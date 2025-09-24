/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { argv } from 'process';

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
        console.log('🚀 Starting type generation using TypeScript AST...');
        
        // Parse all entity files using TypeScript compiler
        await this.parseEntities();
        
        // Generate enum files
        await this.generateEnumTypes();
        
        // Generate API interface files
        await this.generateApiInterfaces();
        
        // Generate type files
        await this.generateEntityTypes();
        
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
            
            // Create TypeScript source file
            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.Latest,
                true
            );
            
            const entityInfos = this.parseEntityFile(sourceFile, file);
            for (const entityInfo of entityInfos) {
                this.entities.set(entityInfo.name, entityInfo);
                console.log(`✅ Parsed entity: ${entityInfo.name} (${entityInfo.properties.length} properties, ${entityInfo.computedProperties.length} computed)`);
            }
        }
    }

    private parseEntityFile(sourceFile: ts.SourceFile, filename: string): EntityInfo[] {
        const entities: EntityInfo[] = [];
        
        // Visit all nodes in the AST
        const visit = (node: ts.Node) => {
            if (ts.isClassDeclaration(node) && node.name) {
                const entityInfo = this.parseEntityClass(node, sourceFile);
                if (entityInfo) {
                    entities.push(entityInfo);
                }
            }
            ts.forEachChild(node, visit);
        };
        
        visit(sourceFile);
        return entities;
    }

    private parseEntityClass(classNode: ts.ClassDeclaration, sourceFile: ts.SourceFile): EntityInfo | null {
        if (!classNode.name) return null;
        
        const entityName = classNode.name.text;
        const properties: EntityProperty[] = [];
        const computedProperties: EntityProperty[] = [];
        
        // Check if this class has @Entity or @ChildEntity decorator
        const hasEntityDecorator = this.hasDecorator(classNode, ['Entity', 'ChildEntity']);
        if (!hasEntityDecorator) {
            return null;
        }
        
        console.log(`\n🔍 Parsing entity: ${entityName}`);
        
        // Check if it's a child entity and get parent
        const isChildEntity = this.hasDecorator(classNode, ['ChildEntity']);
        let parentEntity: string | undefined;
        
        if (isChildEntity && classNode.heritageClauses) {
            for (const heritage of classNode.heritageClauses) {
                if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
                    const extendsType = heritage.types[0];
                    if (ts.isIdentifier(extendsType.expression)) {
                        parentEntity = extendsType.expression.text;
                    }
                }
            }
        }
        
        // Parse class members
        for (const member of classNode.members) {
            if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
                const property = this.parseProperty(member, sourceFile);
                if (property) {
                    properties.push(property);
                    console.log(`  📝 Property: ${property.name} (${property.type}${property.isOptional ? '?' : ''}${property.isArray ? '[]' : ''})`);
                }
            } else if (ts.isGetAccessorDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
                const computedProperty = this.parseComputedProperty(member, sourceFile);
                if (computedProperty) {
                    computedProperties.push(computedProperty);
                    console.log(`  ⚡ Computed: ${computedProperty.name} (${computedProperty.type})`);
                }
            }
        }
        
        return {
            name: entityName,
            properties,
            computedProperties,
            isChildEntity,
            parentEntity
        };
    }

    private parseProperty(propertyNode: ts.PropertyDeclaration, sourceFile: ts.SourceFile): EntityProperty | null {
        if (!propertyNode.name || !ts.isIdentifier(propertyNode.name)) return null;
        
        const propertyName = propertyNode.name.text;
        const decorators = this.getDecorators(propertyNode);
        
        // Skip if no relevant decorators
        if (decorators.length === 0) return null;
        
        // Skip excluded properties
        if (decorators.some(d => d.name === 'Exclude')) {
            console.log(`  ❌ Skipping excluded property: ${propertyName}`);
            return null;
        }
        
        const isOptionalFromSyntax = !!propertyNode.questionToken;
        const typeInfo = this.getPropertyType(propertyNode);
        
        // Handle @PrimaryGeneratedColumn
        if (decorators.some(d => d.name === 'PrimaryGeneratedColumn')) {
            return {
                name: propertyName,
                type: 'number',
                isOptional: false,
                isArray: false,
                isRelation: false
            };
        }
        
        // Handle @Column decorators
        const columnDecorator = decorators.find(d => d.name === 'Column');
        if (columnDecorator) {
            const isNullable = this.isColumnNullable(columnDecorator);
            const mappedType = this.mapTypeToTS(typeInfo.type, columnDecorator);
            
            return {
                name: propertyName,
                type: mappedType.type,
                isOptional: isOptionalFromSyntax || typeInfo.isOptional || isNullable,
                isArray: mappedType.isArray,
                isRelation: false
            };
        }
        
        // Handle date columns
        if (decorators.some(d => ['CreateDateColumn', 'UpdateDateColumn'].includes(d.name))) {
            return {
                name: propertyName,
                type: 'string',
                isOptional: false,
                isArray: false,
                isRelation: false
            };
        }
        
        if (decorators.some(d => d.name === 'DeleteDateColumn')) {
            return {
                name: propertyName,
                type: 'string',
                isOptional: true,
                isArray: false,
                isRelation: false
            };
        }
        
        // Handle relations
        const relationDecorator = decorators.find(d => 
            ['OneToMany', 'ManyToOne', 'ManyToMany'].includes(d.name)
        );
        
        if (relationDecorator) {
            const isArray = ['OneToMany', 'ManyToMany'].includes(relationDecorator.name);
            const targetEntity = this.extractRelationTarget(typeInfo.type, isArray);
            
            return {
                name: propertyName,
                type: targetEntity,
                isOptional: true,
                isArray,
                isRelation: true,
                relationTarget: targetEntity
            };
        }
        
        return null;
    }

    private parseComputedProperty(getterNode: ts.GetAccessorDeclaration, sourceFile: ts.SourceFile): EntityProperty | null {
        if (!getterNode.name || !ts.isIdentifier(getterNode.name)) return null;
        
        const propertyName = getterNode.name.text;
        const decorators = this.getDecorators(getterNode);
        
        // Only include properties with @Expose decorator
        if (!decorators.some(d => d.name === 'Expose')) {
            return null;
        }
        
        const returnType = this.getReturnType(getterNode);
        
        return {
            name: propertyName,
            type: returnType,
            isOptional: false,
            isArray: false,
            isRelation: false
        };
    }

    private hasDecorator(node: ts.Node, decoratorNames: string[]): boolean {
        // Use modifiers to access decorators for compatibility
        const modifiers = (node as any).modifiers || (node as any).decorators;
        if (!modifiers) return false;
        
        return modifiers.some((modifier: any) => {
            if (modifier.kind === ts.SyntaxKind.Decorator) {
                const decorator = modifier;
                if (ts.isCallExpression(decorator.expression)) {
                    const expression = decorator.expression.expression;
                    if (ts.isIdentifier(expression)) {
                        return decoratorNames.includes(expression.text);
                    }
                } else if (ts.isIdentifier(decorator.expression)) {
                    return decoratorNames.includes(decorator.expression.text);
                }
            }
            return false;
        });
    }

    private getDecorators(node: ts.Node): Array<{name: string, args: any[]}> {
        // Use modifiers to access decorators for compatibility
        const modifiers = (node as any).modifiers || (node as any).decorators;
        if (!modifiers) return [];
        
        return modifiers
            .filter((modifier: any) => modifier.kind === ts.SyntaxKind.Decorator)
            .map((decorator: any) => {
                let name = '';
                let args: any[] = [];
                
                if (ts.isCallExpression(decorator.expression)) {
                    const expression = decorator.expression.expression;
                    if (ts.isIdentifier(expression)) {
                        name = expression.text;
                    }
                    args = decorator.expression.arguments.map((arg: any) => arg.getText());
                } else if (ts.isIdentifier(decorator.expression)) {
                    name = decorator.expression.text;
                }
                
                return { name, args };
            })
            .filter((d: any) => d.name);
    }

    private getPropertyType(propertyNode: ts.PropertyDeclaration): {type: string, isOptional: boolean} {
        if (!propertyNode.type) {
            return { type: 'any', isOptional: false };
        }
        
        const typeText = propertyNode.type.getText();
        const isOptional = typeText.includes('| null');
        
        return {
            type: typeText,
            isOptional
        };
    }

    private isColumnNullable(columnDecorator: {name: string, args: any[]}): boolean {
        return columnDecorator.args.some(arg => 
            arg.includes('nullable: true') || arg.includes('nullable:true')
        );
    }

    private mapTypeToTS(typeText: string, columnDecorator?: {name: string, args: any[]}): {type: string, isArray: boolean} {
        // Handle arrays
        if (typeText.includes('[]')) {
            const baseType = typeText.replace('[]', '').replace('| null', '').trim();
            return {
                type: this.mapSingleTypeToTS(baseType, columnDecorator),
                isArray: true
            };
        }
        
        // Handle union with null
        const cleanType = typeText.replace('| null', '').trim();
        
        return {
            type: this.mapSingleTypeToTS(cleanType, columnDecorator),
            isArray: false
        };
    }

    private mapSingleTypeToTS(typeText: string, columnDecorator?: {name: string, args: any[]}): string {
        // Check column decorator for specific types
        if (columnDecorator) {
            const hasDateTimeType = columnDecorator.args.some(arg => 
                arg.includes("'datetime'") || arg.includes("'date'") || arg.includes("'timestamp'")
            );
            if (hasDateTimeType) {
                return 'string';
            }
            
            const hasJsonType = columnDecorator.args.some(arg => 
                arg.includes("'json'") || arg.includes("'simple-json'") || arg.includes("type: 'simple-json'")
            );
            if (hasJsonType) {
                return 'any';
            }
        }
        
        // Map TypeScript types
        switch (typeText) {
            case 'Date':
                return 'string';
            case 'string':
            case 'number':
            case 'boolean':
                return typeText;
            case 'IMedia':
                return 'IMedia';
            default:
                // For custom types, keep as is
                return typeText;
        }
    }

    private extractRelationTarget(typeText: string, isArray: boolean): string {
        if (isArray) {
            // Extract from Type[]
            const match = typeText.match(/(\w+)\[\]/);
            return match ? match[1] : 'any';
        } else {
            // Extract from Type | null or just Type
            const cleanType = typeText.replace('| null', '').trim();
            return cleanType || 'any';
        }
    }

    private getReturnType(getterNode: ts.GetAccessorDeclaration): string {
        if (getterNode.type) {
            const typeText = getterNode.type.getText();
            switch (typeText) {
                case 'boolean':
                case 'string':
                case 'number':
                    return typeText;
                default:
                    return 'any';
            }
        }
        return 'any';
    }

    private async generateEnumTypes() {
        const enumsDir = path.join(this.outputPath, 'src/types/enums');
        if (!fs.existsSync(enumsDir)) {
            fs.mkdirSync(enumsDir, { recursive: true });
        }

        const entitiesPath = path.join(this.apiPath, 'src/entities');
        const files = fs.readdirSync(entitiesPath).filter(file => file.endsWith('.ts'));

        const allEnums: string[] = [];

        for (const file of files) {
            const filePath = path.join(entitiesPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Extract enum declarations using regex
            const enumMatches = content.match(/export enum \w+ \{[\s\S]*?\}/g);
            if (enumMatches) {
                allEnums.push(...enumMatches);
            }
        }

        if (allEnums.length > 0) {
            const enumContent = allEnums.join('\n\n');
            const enumFilePath = path.join(enumsDir, 'index.ts');
            fs.writeFileSync(enumFilePath, enumContent);
            console.log(`Generated enums: ${allEnums.length} enums`);
        }
    }

    private async generateApiInterfaces() {
        const apiDir = path.join(this.outputPath, 'src/types/api');
        if (!fs.existsSync(apiDir)) {
            fs.mkdirSync(apiDir, { recursive: true });
        }

        const interfacesPath = path.join(this.apiPath, 'src/interfaces');
        if (!fs.existsSync(interfacesPath)) {
            console.log('⚠️  No interfaces directory found, skipping API interface generation');
            return;
        }

        const files = fs.readdirSync(interfacesPath).filter(file => file.endsWith('.ts'));

        const allInterfaces: string[] = [];

        for (const file of files) {
            const filePath = path.join(interfacesPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Use TypeScript AST to parse interfaces properly
            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.Latest,
                true
            );
            
            const interfaces = this.parseInterfaceFile(sourceFile);
            allInterfaces.push(...interfaces);
        }

        if (allInterfaces.length > 0) {
            const interfaceContent = allInterfaces.join('\n\n');
            const apiFilePath = path.join(apiDir, 'index.ts');
            fs.writeFileSync(apiFilePath, interfaceContent);
            console.log(`Generated API interfaces: ${allInterfaces.length} interfaces`);
        }
    }

    private parseInterfaceFile(sourceFile: ts.SourceFile): string[] {
        const interfaces: string[] = [];
        
        const visit = (node: ts.Node) => {
            if (ts.isInterfaceDeclaration(node) && node.name) {
                // Skip IMedia as it's handled separately in the main interfaces
                if (node.name.text === 'IMedia') {
                    return;
                }
                // Get the full text of the interface declaration
                const interfaceText = node.getFullText(sourceFile).trim();
                interfaces.push(interfaceText);
            }
            ts.forEachChild(node, visit);
        };
        
        visit(sourceFile);
        return interfaces;
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
        const relatedEnums = new Set<string>();
        const needsIMedia = entityInfo.properties.some(p => p.type === 'IMedia');

        if (needsIMedia) {
            imports.push("import type { IMedia } from '../../interfaces';");
        }

        // Generate interface
        interfaceLines.push(`export interface ${entityInfo.name} {`);

        // Add properties from parent if it's a child entity
        if (entityInfo.isChildEntity && entityInfo.parentEntity) {
            const parentEntity = this.entities.get(entityInfo.parentEntity);
            if (parentEntity) {
                // Add parent's imports
                for (const prop of parentEntity.properties) {
                    if (prop.isRelation && prop.relationTarget && prop.relationTarget !== entityInfo.name) {
                        relatedEntities.add(prop.relationTarget);
                    }
                    if (this.isEnumType(prop.type)) {
                        relatedEnums.add(prop.type);
                    }
                }
                
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

        // Collect related entities and enums for imports
        for (const prop of entityInfo.properties) {
            if (prop.isRelation && prop.relationTarget && prop.relationTarget !== entityInfo.name) {
                relatedEntities.add(prop.relationTarget);
            }
            // Check for enum types
            if (this.isEnumType(prop.type)) {
                relatedEnums.add(prop.type);
            }
        }

        // Add imports for related entities
        for (const relatedEntity of relatedEntities) {
            imports.push(`import type { ${relatedEntity} } from './${relatedEntity}';`);
        }

        // Add imports for enums
        if (relatedEnums.size > 0) {
            const enumImports = Array.from(relatedEnums).join(', ');
            imports.push(`import type { ${enumImports} } from '../enums';`);
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
        const result: string[] = [];
        if (imports.length > 0) {
            result.push(...imports);
            result.push(''); // Add blank line only if there are imports
        }
        result.push(...interfaceLines);

        return result.join('\n');
    }

    private async updateApiTypes() {
        const apiTypesPath = path.join(this.outputPath, 'src/types/api/index.ts');
        
        if (!fs.existsSync(apiTypesPath)) {
            console.log('⚠️  API types file not found, skipping update');
            return;
        }
        
        let content = fs.readFileSync(apiTypesPath, 'utf-8');

        // Remove existing imports and add clean ones
        const lines = content.split('\n');
        const nonImportLines = lines.filter(line => 
            !line.trim().startsWith('import') && line.trim() !== ''
        );
        
        // Dynamically discover required imports based on content
        const imports = this.discoverRequiredImports(content);

        content = imports.join('\n') + (imports.length > 0 ? '\n\n' : '') + nonImportLines.join('\n');

        // Replace placeholder types
        content = content.replace(/user: any;/g, 'user: User;');
        content = content.replace(/media\?: any\[\];/g, 'media?: IMedia[];');

        fs.writeFileSync(apiTypesPath, content);
        console.log('Updated API types with proper references');
    }

    private async generateIndexFiles() {
        // Generate main types index - discover subdirectories dynamically
        const typesIndexPath = path.join(this.outputPath, 'src/types/index.ts');
        const typesDir = path.dirname(typesIndexPath);
        const typesSubdirs = this.getSubdirectories(typesDir);
        const typesIndexContent = typesSubdirs
            .map(subdir => `export * from './${subdir}';`)
            .join('\n');
        
        if (!fs.existsSync(typesDir)) {
            fs.mkdirSync(typesDir, { recursive: true });
        }
        fs.writeFileSync(typesIndexPath, typesIndexContent);

        // Generate entities index
        const entitiesIndexPath = path.join(this.outputPath, 'src/types/entities/index.ts');
        const entityExports = Array.from(this.entities.keys())
            .map(name => `export * from './${name}';`)
            .join('\n');
        fs.writeFileSync(entitiesIndexPath, entityExports);

        // Generate utils index - discover subdirectories dynamically
        const utilsIndexPath = path.join(this.outputPath, 'src/utils/index.ts');
        const utilsDir = path.dirname(utilsIndexPath);
        if (fs.existsSync(utilsDir)) {
            const utilsSubdirs = this.getSubdirectories(utilsDir);
            const utilsIndexContent = utilsSubdirs
                .map(subdir => `export * from './${subdir}';`)
                .join('\n');
            fs.writeFileSync(utilsIndexPath, utilsIndexContent);
        }

        // Generate main index - discover subdirectories dynamically
        const mainIndexPath = path.join(this.outputPath, 'src/index.ts');
        const srcDir = path.dirname(mainIndexPath);
        const srcSubdirs = this.getSubdirectories(srcDir);
        const mainIndexContent = srcSubdirs
            .map(subdir => `export * from './${subdir}';`)
            .join('\n');
        fs.writeFileSync(mainIndexPath, mainIndexContent);

        console.log('Generated index files');
    }

    private getSubdirectories(dirPath: string): string[] {
        if (!fs.existsSync(dirPath)) {
            return [];
        }
        
        return fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort();
    }

    private discoverRequiredImports(content: string): string[] {
        const imports: string[] = [];
        
        // Check for IMedia usage
        if (content.includes('IMedia')) {
            imports.push("import type { IMedia } from '../../interfaces';");
        }
        
        // Check for User usage
        if (content.includes(': User')) {
            imports.push("import type { User } from '../entities/User';");
        }
        
        // Dynamically discover enum usage
        const enumTypes = this.discoverEnumTypes(content);
        if (enumTypes.length > 0) {
            const enumImports = enumTypes.join(', ');
            imports.push(`import type { ${enumImports} } from '../enums';`);
        }
        
        return imports;
    }

    private isEnumType(typeName: string): boolean {
        // Check if this type exists in the enums directory
        const enumsDir = path.join(this.outputPath, 'src/types/enums');
        if (fs.existsSync(enumsDir)) {
            // Check individual enum files first
            const enumFiles = fs.readdirSync(enumsDir).filter(file => file.endsWith('.ts') && file !== 'index.ts');
            if (enumFiles.some(file => path.basename(file, '.ts') === typeName)) {
                return true;
            }
            
            // Check if it's exported from the index file - use regex for exact match
            const indexFile = path.join(enumsDir, 'index.ts');
            if (fs.existsSync(indexFile)) {
                const content = fs.readFileSync(indexFile, 'utf-8');
                const enumRegex = new RegExp(`^export enum ${typeName}\\b`, 'm');
                return enumRegex.test(content);
            }
        }
        return false;
    }

    private discoverEnumTypes(content: string): string[] {
        const enumTypes: string[] = [];
        
        // Get all available enum types from the enums directory
        const enumsDir = path.join(this.outputPath, 'src/types/enums');
        if (fs.existsSync(enumsDir)) {
            // Check individual enum files first
            const enumFiles = fs.readdirSync(enumsDir).filter(file => file.endsWith('.ts') && file !== 'index.ts');
            
            for (const enumFile of enumFiles) {
                const enumName = path.basename(enumFile, '.ts');
                if (content.includes(enumName)) {
                    enumTypes.push(enumName);
                }
            }
            
            // Check enums exported from the index file
            const indexFile = path.join(enumsDir, 'index.ts');
            if (fs.existsSync(indexFile)) {
                const indexContent = fs.readFileSync(indexFile, 'utf-8');
                const enumMatches = indexContent.match(/export enum (\w+)/g);
                if (enumMatches) {
                    for (const match of enumMatches) {
                        const enumName = match.replace('export enum ', '');
                        if (content.includes(enumName) && !enumTypes.includes(enumName)) {
                            enumTypes.push(enumName);
                        }
                    }
                }
            }
        }
        
        return enumTypes;
    }
}

// Main execution
async function main() {
    const apiPath = argv[2] || '../';
    const outputPath = argv[3] || './';

    const generator = new TypeGenerator(apiPath, outputPath);
    await generator.generate();
}

// Run main if this file is executed directly
main().catch(console.error);

export { TypeGenerator };
