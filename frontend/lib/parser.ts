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
      
      // Simple regex-based parser for Terraform resources
      const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
      let match;
      
      while ((match = resourceRegex.exec(content)) !== null) {
        const resourceType = match[1];
        const resourceName = match[2];
        const resourceBody = match[3];
        
        console.log(`Found resource: ${resourceType}.${resourceName}`);
        
        // Extract attributes from resource body
        const attributes: Record<string, any> = {};
        
        // Extract simple key-value pairs
        const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(resourceBody)) !== null) {
          attributes[attrMatch[1]] = attrMatch[2];
        }
        
        // Extract numeric values
        const numRegex = /(\w+)\s*=\s*(\d+)/g;
        let numMatch;
        while ((numMatch = numRegex.exec(resourceBody)) !== null) {
          attributes[numMatch[1]] = parseInt(numMatch[2]);
        }
        
        // Extract boolean values
        const boolRegex = /(\w+)\s*=\s*(true|false)/g;
        let boolMatch;
        while ((boolMatch = boolRegex.exec(resourceBody)) !== null) {
          attributes[boolMatch[1]] = boolMatch[2] === 'true';
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
