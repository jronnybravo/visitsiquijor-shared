# Visit Siquijor Shared Types

This repository contains shared TypeScript types, interfaces, and utilities for the Visit Siquijor project ecosystem.

## Overview

This package provides:
- **Entity Types**: Clean TypeScript interfaces generated from API TypeORM entities
- **API Types**: Request/response interfaces and common API structures
- **Permissions**: Shared permission classes and hierarchies
- **Interfaces**: Common interfaces like `IMedia`
- **Enums**: Shared enumerations like `UserType`

## Usage

### As Git Submodule

```bash
# Add as submodule to your project
git submodule add <repository-url> shared-types

# Import types in your TypeScript files
import { User, Place, Event } from './shared-types/src/types/entities';
import { ApiResponse, LoginRequest } from './shared-types/src/types/api';
import { AdministratorPermission } from './shared-types/src/permissions';
```

### As NPM Package

```bash
npm install visitsiquijor-shared
```

```typescript
import { User, Place, Event } from 'visitsiquijor-shared/types';
import { ApiResponse, LoginRequest } from 'visitsiquijor-shared/types';
import { AdministratorPermission } from 'visitsiquijor-shared/permissions';
```

## Type Generation

Types are automatically generated from the API project's TypeORM entities using the included generation script.

### Manual Generation

```bash
# Generate types from API project
npm run generate

# Build the package
npm run build
```

### Automated Generation

The types can be automatically generated and updated when the API entities change by running the generation script as part of your CI/CD pipeline.

## Structure

```
src/
├── types/
│   ├── entities/     # Generated entity interfaces
│   ├── api/          # API request/response types
│   └── enums/        # Shared enumerations
├── permissions/      # Permission classes
├── interfaces/       # Common interfaces
└── index.ts          # Main export file
```

## Development

```bash
# Install dependencies
npm install

# Generate types from API
npm run generate

# Build the package
npm run build

# Watch mode for development
npm run dev
```

## Projects Using This Package

- **API**: Node.js/TypeORM backend
- **Web**: SvelteKit frontend
- **Mobile**: Flutter mobile app (via generated Dart types)

## Contributing

1. Make changes to the type generation script or manual types
2. Run `npm run generate` to update generated types
3. Run `npm run build` to ensure everything compiles
4. Commit and push changes
5. Update consuming projects to pull latest types
