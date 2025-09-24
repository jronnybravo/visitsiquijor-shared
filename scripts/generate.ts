import * as fs from 'fs';
import * as path from 'path';

interface EntityProperty {
    name: string;
    type: string;
    isOptional: boolean;
    isArray: boolean;
    isRelation: boolean;
    relationTarget?: string;
}

interface EntityInfo {
    name: string;
    properties: EntityProperty[];
    computedProperties: EntityProperty[];
    isChildEntity: boolean;
    parentEntity?: string;
}

class TypeGenerator {
    private apiPath: string;
    private outputPath: string;
    private entities: Map<string, EntityInfo> = new Map();

    constructor(apiPath: string, outputPath: string) {
        this.apiPath = apiPath;
        this.outputPath = outputPath;
    }

    async generate() {
        console.log('🚀 Starting type generation...');
        
        // Parse all entity files
        await this.parseEntities();
        
        // Generate type files
        await this.generateEntityTypes();
        
        // Update API types with proper references
        await this.updateApiTypes();
        
        // Generate main index files
        await this.generateIndexFiles();
        
        console.log('✅ Type generation completed!');
    }

    private async parseEntities() {
        const entitiesPath = path.join(this.apiPath, 'src/entities');
        const files = fs.readdirSync(entitiesPath).filter(file => file.endsWith('.ts'));

        for (const file of files) {
            const filePath = path.join(entitiesPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const entityInfos = this.parseEntityFile(content, file);
            for (const entityInfo of entityInfos) {
                this.entities.set(entityInfo.name, entityInfo);
            }
        }
    }

    private parseEntityFile(content: string, filename: string): EntityInfo[] {
        const entities: EntityInfo[] = [];
        
        // Skip if not an entity file
        if (!content.includes('@Entity()') && !content.includes('@ChildEntity(')) {
            return entities;
        }

        // Find all entity classes in the file
        const entityMatches = content.matchAll(/(?:@Entity\(\)|@ChildEntity\([^)]*\))\s*(?:@[^\n]*\s*)*export\s+class\s+(\w+)/g);
        
        for (const match of entityMatches) {
            const entityName = match[1];
            const entityInfo = this.parseEntityClass(content, entityName);
            if (entityInfo) {
                entities.push(entityInfo);
            }
        }

        return entities;
    }

    private parseEntityClass(content: string, entityName: string): EntityInfo | null {
        const properties: EntityProperty[] = [];
        const computedProperties: EntityProperty[] = [];
        let isChildEntity = false;
        let parentEntity: string | undefined;

        // Find the class definition
        const classRegex = new RegExp(`(?:@Entity\\(\\)|@ChildEntity\\([^)]*\\))\\s*(?:@[^\\n]*\\s*)*export\\s+class\\s+${entityName}(?:\\s+extends\\s+(\\w+))?[^{]*{([^}]*(?:{[^}]*}[^}]*)*)}`, 's');
        const classMatch = content.match(classRegex);
        
        if (!classMatch) {
            return null;
        }

        const classContent = classMatch[0];
        const extendsClass = classMatch[1];
        
        // Check if it's a child entity
        const childEntityMatch = classContent.match(/@ChildEntity\([^)]*\)/);
        if (childEntityMatch) {
            isChildEntity = true;
            parentEntity = extendsClass;
        }

        // Parse properties only from the specific class content, not the entire file
        const classBodyMatch = classContent.match(/{([^}]*(?:{[^}]*}[^}]*)*)}/s);
        if (!classBodyMatch) {
            return null;
        }
        
        const classBody = classBodyMatch[1];
        const lines = classBody.split('\n');
        let currentDecorators: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Collect decorators
            if (line.startsWith('@') && !line.includes(':')) {
                currentDecorators.push(line);
                continue;
            }
            
            // Check if this is a property declaration
            const propMatch = line.match(/^(\w+)(\?)?:\s*([^;]+);?\s*$/);
            if (propMatch && currentDecorators.length > 0) {
                const propName = propMatch[1];
                const isOptional = !!propMatch[2] || currentDecorators.some(d => d.includes('nullable: true'));
                const propTypeRaw = propMatch[3].trim();
                
                // Skip excluded properties
                if (currentDecorators.some(d => d.includes('@Exclude'))) {
                    currentDecorators = [];
                    continue;
                }
                
                // Handle different decorator types
                if (currentDecorators.some(d => d.includes('@PrimaryGeneratedColumn'))) {
                    properties.push({
                        name: propName,
                        type: 'number',
                        isOptional: false,
                        isArray: false,
                        isRelation: false
                    });
                } else if (currentDecorators.some(d => d.includes('@Column'))) {
                    const propType = this.mapTypeOrmTypeToTS(propTypeRaw);
                    // Check if column is nullable from decorator
                    const columnDecorator = currentDecorators.find(d => d.includes('@Column'));
                    const isNullable = columnDecorator?.includes('nullable: true') || false;
                    properties.push({
                        name: propName,
                        type: propType.type,
                        isOptional: isOptional || propType.isOptional || isNullable,
                        isArray: propType.isArray,
                        isRelation: false
                    });
                } else if (currentDecorators.some(d => d.includes('@CreateDateColumn') || d.includes('@UpdateDateColumn'))) {
                    properties.push({
                        name: propName,
                        type: 'string',
                        isOptional: false,
                        isArray: false,
                        isRelation: false
                    });
                } else if (currentDecorators.some(d => d.includes('@DeleteDateColumn'))) {
                    properties.push({
                        name: propName,
                        type: 'string',
                        isOptional: true,
                        isArray: false,
                        isRelation: false
                    });
                } else if (currentDecorators.some(d => d.includes('@OneToMany') || d.includes('@ManyToOne') || d.includes('@ManyToMany'))) {
                    const relationType = currentDecorators.find(d => d.includes('@OneToMany') || d.includes('@ManyToOne') || d.includes('@ManyToMany'));
                    let targetEntity = '';
                    let isArray = false;
                    
                    if (relationType?.includes('@OneToMany') || relationType?.includes('@ManyToMany')) {
                        isArray = true;
                        const arrayMatch = propTypeRaw.match(/(\w+)\[\]/);
                        if (arrayMatch) {
                            targetEntity = arrayMatch[1];
                        }
                    } else {
                        targetEntity = propTypeRaw;
                    }

                    properties.push({
                        name: propName,
                        type: targetEntity,
                        isOptional: true,
                        isArray,
                        isRelation: true,
                        relationTarget: targetEntity
                    });
                }
                
                currentDecorators = [];
            } else if (!line.startsWith('@') && line.length > 0) {
                // Reset decorators if we hit a non-decorator, non-property line
                currentDecorators = [];
            }
        }

        // Parse computed properties (@Expose getters) only from this class
        const computedMatches = classBody.matchAll(/@Expose\(\)\s*get\s+(\w+)\(\):\s*([^{]+)\s*{/g);
        for (const match of computedMatches) {
            const propName = match[1];
            const returnType = this.mapTypeOrmTypeToTS(match[2].trim());
            computedProperties.push({
                name: propName,
                type: returnType.type,
                isOptional: false,
                isArray: returnType.isArray,
                isRelation: false
            });
        }

        return {
            name: entityName,
            properties,
            computedProperties,
            isChildEntity,
            parentEntity
        };
    }

    private mapTypeOrmTypeToTS(typeormType: string): { type: string; isOptional: boolean; isArray: boolean } {
        let type = typeormType;
        let isOptional = false;
        let isArray = false;

        // Handle optional types
        if (type.includes('| null')) {
            isOptional = true;
            type = type.replace('| null', '').trim();
        }

        // Handle arrays
        if (type.includes('[]')) {
            isArray = true;
            type = type.replace('[]', '').trim();
        }

        // Map TypeORM types to TypeScript types
        switch (type) {
            case 'Date':
                return { type: 'string', isOptional, isArray };
            case 'string':
            case 'number':
            case 'boolean':
                return { type, isOptional, isArray };
            default:
                // For custom types and enums, keep as is
                return { type, isOptional, isArray };
        }
    }

    private async generateEntityTypes() {
        const entitiesDir = path.join(this.outputPath, 'src/types/entities');
        if (!fs.existsSync(entitiesDir)) {
            fs.mkdirSync(entitiesDir, { recursive: true });
        }

        for (const [entityName, entityInfo] of this.entities) {
            const content = this.generateEntityInterface(entityInfo);
            const filePath = path.join(entitiesDir, `${entityName}.ts`);
            fs.writeFileSync(filePath, content);
            console.log(`Generated: ${entityName}.ts`);
        }
    }

    private generateEntityInterface(entityInfo: EntityInfo): string {
        const imports: string[] = [];
        const interfaceLines: string[] = [];

        // Add imports for related entities and enums
        const relatedEntities = new Set<string>();
        const needsIMedia = entityInfo.properties.some(p => p.type === 'IMedia');
        const needsUserType = entityInfo.properties.some(p => p.type === 'UserType') || 
                             entityInfo.computedProperties.some(p => p.type === 'UserType');

        if (needsIMedia) {
            imports.push("import { IMedia } from '../../interfaces';");
        }

        if (needsUserType) {
            imports.push("import { UserType } from '../enums';");
        }

        // Collect related entities for imports
        for (const prop of entityInfo.properties) {
            if (prop.isRelation && prop.relationTarget && prop.relationTarget !== entityInfo.name) {
                // Clean the relation target to remove any union type syntax
                const cleanTarget = prop.relationTarget.replace(/\s*\|\s*null/g, '').trim();
                if (cleanTarget) {
                    relatedEntities.add(cleanTarget);
                }
            }
        }

        // Add imports for related entities
        for (const relatedEntity of relatedEntities) {
            imports.push(`import { ${relatedEntity} } from './${relatedEntity}';`);
        }

        // Generate interface
        interfaceLines.push(`export interface ${entityInfo.name} {`);

        // Add properties from parent if it's a child entity
        if (entityInfo.isChildEntity && entityInfo.parentEntity) {
            const parentEntity = this.entities.get(entityInfo.parentEntity);
            if (parentEntity) {
                for (const prop of parentEntity.properties) {
                    const optionalMark = prop.isOptional ? '?' : '';
                    const arrayMark = prop.isArray ? '[]' : '';
                    interfaceLines.push(`    ${prop.name}${optionalMark}: ${prop.type}${arrayMark};`);
                }
                for (const prop of parentEntity.computedProperties) {
                    const optionalMark = prop.isOptional ? '?' : '';
                    const arrayMark = prop.isArray ? '[]' : '';
                    interfaceLines.push(`    ${prop.name}${optionalMark}: ${prop.type}${arrayMark};`);
                }
            }
        }

        // Add entity-specific properties
        for (const prop of entityInfo.properties) {
            const optionalMark = prop.isOptional ? '?' : '';
            const arrayMark = prop.isArray ? '[]' : '';
            interfaceLines.push(`    ${prop.name}${optionalMark}: ${prop.type}${arrayMark};`);
        }

        // Add computed properties
        for (const prop of entityInfo.computedProperties) {
            const optionalMark = prop.isOptional ? '?' : '';
            const arrayMark = prop.isArray ? '[]' : '';
            interfaceLines.push(`    ${prop.name}${optionalMark}: ${prop.type}${arrayMark};`);
        }

        interfaceLines.push('}');

        // Combine imports and interface
        const result = [];
        if (imports.length > 0) {
            result.push(...imports, '');
        }
        result.push(...interfaceLines);

        return result.join('\n');
    }

    private async updateApiTypes() {
        const apiTypesPath = path.join(this.outputPath, 'src/types/api/index.ts');
        let content = fs.readFileSync(apiTypesPath, 'utf-8');

        // Only add imports if they don't already exist
        if (!content.includes("import { IMedia } from '../../interfaces';")) {
            const imports = [
                "import { IMedia } from '../../interfaces';",
                "import { UserType } from '../enums';",
                "import { User } from '../entities/User';"
            ];

            content = imports.join('\n') + '\n\n' + content;
        }

        // Replace placeholder types
        content = content.replace(/user: any;/g, 'user: User;');
        content = content.replace(/media\?: any\[\];/g, 'media?: IMedia[];');
        content = content.replace(/type: string;/g, 'type: UserType;');

        fs.writeFileSync(apiTypesPath, content);
        console.log('Updated API types with proper references');
    }

    private async generateIndexFiles() {
        // Generate main types index
        const typesIndexPath = path.join(this.outputPath, 'src/types/index.ts');
        const typesIndexContent = [
            "export * from './api';",
            "export * from './entities';",
            "export * from './enums';"
        ].join('\n');
        fs.writeFileSync(typesIndexPath, typesIndexContent);

        // Generate entities index
        const entitiesIndexPath = path.join(this.outputPath, 'src/types/entities/index.ts');
        const entityExports = Array.from(this.entities.keys())
            .map(name => `export * from './${name}';`)
            .join('\n');
        fs.writeFileSync(entitiesIndexPath, entityExports);

        // Generate utils index
        const utilsIndexPath = path.join(this.outputPath, 'src/utils/index.ts');
        const utilsIndexContent = "export * from './permissions';";
        fs.writeFileSync(utilsIndexPath, utilsIndexContent);

        // Generate main index
        const mainIndexPath = path.join(this.outputPath, 'src/index.ts');
        const mainIndexContent = [
            "export * from './types';",
            "export * from './utils';",
            "export * from './interfaces';"
        ].join('\n');
        fs.writeFileSync(mainIndexPath, mainIndexContent);

        console.log('Generated index files');
    }
}

// Main execution
async function main() {
    const apiPath = process.argv[2] || '../';
    const outputPath = process.argv[3] || './';

    const generator = new TypeGenerator(apiPath, outputPath);
    await generator.generate();
}

if (require.main === module) {
    main().catch(console.error);
}

export { TypeGenerator };
