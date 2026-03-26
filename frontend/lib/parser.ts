export interface TerraformResource {
  type: string;
  name: string;
  attributes: Record<string, any>;
}

export interface ParsedTerraform {
  resources: TerraformResource[];
  errors: string[];
}

export async function parseTerraformFiles(files: Record<string, string>): Promise<ParsedTerraform> {
  const resources: TerraformResource[] = [];
  const errors: string[] = [];

  for (const [filename, content] of Object.entries(files)) {
    try {
      console.log(`Parsing file: ${filename}`);
      
      // Enhanced regex-based parser for Terraform resources
      const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
      let match;
      
      while ((match = resourceRegex.exec(content)) !== null) {
        const resourceType = match[1];
        const resourceName = match[2];
        const resourceBody = match[3];
        
        console.log(`Found resource: ${resourceType}.${resourceName}`);
        
        // Extract attributes from resource body
        const attributes: Record<string, any> = {};
        
        // Extract simple key-value pairs (strings)
        const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(resourceBody)) !== null) {
          attributes[attrMatch[1]] = attrMatch[2];
        }
        
        // Extract numeric values
        const numRegex = /(\w+)\s*=\s*(\d+\.?\d*)/g;
        let numMatch;
        while ((numMatch = numRegex.exec(resourceBody)) !== null) {
          const value = numMatch[2];
          attributes[numMatch[1]] = value.includes('.') ? parseFloat(value) : parseInt(value);
        }
        
        // Extract boolean values
        const boolRegex = /(\w+)\s*=\s*(true|false)/g;
        let boolMatch;
        while ((boolMatch = boolRegex.exec(resourceBody)) !== null) {
          attributes[boolMatch[1]] = boolMatch[2] === 'true';
        }
        
        // Extract list values [...]
        const listRegex = /(\w+)\s*=\s*\[(.*?)\]/g;
        let listMatch;
        while ((listMatch = listRegex.exec(resourceBody)) !== null) {
          const items = listMatch[2].split(',').map(item => item.trim().replace(/"/g, ''));
          attributes[listMatch[1]] = items.filter(item => item.length > 0);
        }
        
        // Extract count attribute for resource multiplication
        if (attributes.count) {
          attributes._count = parseInt(attributes.count as string) || 1;
        } else {
          attributes._count = 1;
        }
        
        // Extract availability_zone, region, etc.
        if (resourceBody.includes('availability_zone')) {
          const azMatch = resourceBody.match(/availability_zone\s*=\s*"([^"]*)"/);
          if (azMatch) attributes.availability_zone = azMatch[1];
        }
        
        resources.push({
          type: resourceType,
          name: resourceName,
          attributes,
        });
      }
      
      if (resources.length === 0) {
        console.log('No resources found in file');
      }
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
      errors.push(`Error parsing ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`Total resources found: ${resources.length}`);
  return { resources, errors };
}

export function extractResourceDetails(resources: TerraformResource[]) {
  return resources.map(resource => {
    const details: any = {
      resource_type: resource.type,
      resource_name: resource.name,
    };

    // Extract common attributes
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

    return details;
  });
}
