export interface TerraformResource {
  type: string;
  name: string;
  attributes: Record<string, any>;
}

export interface ParsedTerraform {
  resources: TerraformResource[];
  errors: string[];
}

/**
 * Strip comments from Terraform HCL while preserving strings that contain comment symbols
 */
function stripComments(content: string): string {
  let result = '';
  let i = 0;
  const len = content.length;

  while (i < len) {
    const char = content[i];
    const nextChar = i + 1 < len ? content[i + 1] : '';

    // Check for string literal
    if (char === '"') {
      result += char;
      i++;
      while (i < len) {
        const strChar = content[i];
        result += strChar;
        if (strChar === '\\' && i + 1 < len) {
          // Escaped character inside string
          i++;
          result += content[i];
        } else if (strChar === '"') {
          break;
        }
        i++;
      }
      i++;
      continue;
    }

    // Check for single-line comment (# or //)
    if (char === '#' || (char === '/' && nextChar === '/')) {
      // Skip until end of line
      while (i < len && content[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Check for multi-line comment (/* ... */)
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < len && !(content[i] === '*' && i + 1 < len && content[i + 1] === '/')) {
        i++;
      }
      i += 2; // skip */
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Parse attributes inside a resource body block
 */
function parseResourceAttributes(body: string): Record<string, any> {
  const attributes: Record<string, any> = {};

  // Extract simple key-value pairs (strings)
  const attrRegex = /([a-zA-Z0-9_-]+)\s*=\s*"([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(body)) !== null) {
    attributes[attrMatch[1]] = attrMatch[2];
  }

  // Extract numeric values (not inside quotes)
  const numRegex = /([a-zA-Z0-9_-]+)\s*=\s*(\d+\.?\d*)\b(?!\s*")/g;
  let numMatch;
  while ((numMatch = numRegex.exec(body)) !== null) {
    const key = numMatch[1];
    const val = numMatch[2];
    attributes[key] = val.includes('.') ? parseFloat(val) : parseInt(val, 10);
  }

  // Extract boolean values
  const boolRegex = /([a-zA-Z0-9_-]+)\s*=\s*(true|false)\b/gi;
  let boolMatch;
  while ((boolMatch = boolRegex.exec(body)) !== null) {
    attributes[boolMatch[1]] = boolMatch[2].toLowerCase() === 'true';
  }

  // Extract list values [...]
  const listRegex = /([a-zA-Z0-9_-]+)\s*=\s*\[([^\]]*)\]/g;
  let listMatch;
  while ((listMatch = listRegex.exec(body)) !== null) {
    const items = listMatch[2]
      .split(',')
      .map(item => item.trim().replace(/^["']|["']$/g, ''))
      .filter(item => item.length > 0);
    attributes[listMatch[1]] = items;
  }

  // Extract nested root_block_device if present
  const rootBlockMatch = body.match(/root_block_device\s*\{([^}]*)\}/i);
  if (rootBlockMatch) {
    const rootBody = rootBlockMatch[1];
    const rootSizeMatch = rootBody.match(/volume_size\s*=\s*(\d+)/i);
    const rootTypeMatch = rootBody.match(/volume_type\s*=\s*"([^"]*)"/i);
    attributes.root_block_device = {
      volume_size: rootSizeMatch ? parseInt(rootSizeMatch[1], 10) : 30,
      volume_type: rootTypeMatch ? rootTypeMatch[1] : 'gp2',
    };
  }

  // Extract availability_zone if present
  const azMatch = body.match(/availability_zone\s*=\s*"([^"]*)"/i);
  if (azMatch) {
    attributes.availability_zone = azMatch[1];
  }

  // Accurately extract count attribute (handle 0 correctly!)
  if (attributes.count !== undefined) {
    const parsed = parseInt(String(attributes.count), 10);
    attributes._count = isNaN(parsed) ? 1 : Math.max(0, parsed);
  } else {
    attributes._count = 1;
  }

  return attributes;
}

/**
 * Enhanced Terraform file parser using balanced brace scanning
 */
export async function parseTerraformFiles(files: Record<string, string>): Promise<ParsedTerraform> {
  const resources: TerraformResource[] = [];
  const errors: string[] = [];

  for (const [filename, rawContent] of Object.entries(files)) {
    try {
      // 1. Strip comments cleanly
      const cleanContent = stripComments(rawContent);

      // 2. Scan for resource blocks using balanced braces
      const resourceHeaderRegex = /\bresource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
      let headerMatch;

      while ((headerMatch = resourceHeaderRegex.exec(cleanContent)) !== null) {
        const resourceType = headerMatch[1];
        const resourceName = headerMatch[2];
        const startIndex = resourceHeaderRegex.lastIndex; // right after opening '{'

        // Scan balanced braces to find the matching '}'
        let depth = 1;
        let currentIndex = startIndex;
        let inString = false;
        let escaped = false;

        while (currentIndex < cleanContent.length && depth > 0) {
          const char = cleanContent[currentIndex];

          if (inString) {
            if (escaped) {
              escaped = false;
            } else if (char === '\\') {
              escaped = true;
            } else if (char === '"') {
              inString = false;
            }
          } else {
            if (char === '"') {
              inString = true;
            } else if (char === '{') {
              depth++;
            } else if (char === '}') {
              depth--;
            }
          }

          currentIndex++;
        }

        if (depth !== 0) {
          errors.push(`Unmatched braces in resource ${resourceType}.${resourceName} in ${filename}`);
          continue;
        }

        // The body is between startIndex and currentIndex - 1
        const resourceBody = cleanContent.substring(startIndex, currentIndex - 1);
        const attributes = parseResourceAttributes(resourceBody);

        resources.push({
          type: resourceType,
          name: resourceName,
          attributes,
        });

        // Continue search after the closing brace
        resourceHeaderRegex.lastIndex = currentIndex;
      }
    } catch (error) {
      errors.push(`Error parsing ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { resources, errors };
}

export function extractResourceDetails(resources: TerraformResource[]) {
  return resources.map(resource => {
    const details: any = {
      resource_type: resource.type,
      resource_name: resource.name,
      count: resource.attributes._count ?? 1,
    };

    if (resource.attributes.instance_type) {
      details.instance_type = resource.attributes.instance_type;
    }
    if (resource.attributes.engine) {
      details.engine = resource.attributes.engine;
    }
    if (resource.attributes.allocated_storage) {
      details.allocated_storage = resource.attributes.allocated_storage;
    }
    if (resource.attributes.instance_class) {
      details.instance_class = resource.attributes.instance_class;
    }
    if (resource.attributes.root_block_device) {
      details.root_block_device = resource.attributes.root_block_device;
    }

    return details;
  });
}
