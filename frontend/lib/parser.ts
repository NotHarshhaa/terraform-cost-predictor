import { parseToObject } from 'hcl2-parser';

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
      const parsed = parseToObject(content);
      
      // Extract resources from parsed HCL
      if (parsed.resource) {
        for (const [resourceType, resourceInstances] of Object.entries(parsed.resource)) {
          if (typeof resourceInstances === 'object' && resourceInstances !== null) {
            for (const [resourceName, attributes] of Object.entries(resourceInstances)) {
              resources.push({
                type: resourceType as string,
                name: resourceName as string,
                attributes: attributes as Record<string, any>,
              });
            }
          }
        }
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
