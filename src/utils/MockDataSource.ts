import { DataSource } from 'typeorm';

// Mock data for testing
export const MOCK_DATA = {
    users: [
        {
            id: 1,
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            type: 'Administrator',
            createdAt: new Date(),
            updatedAt: new Date(),
            emails: [
                {
                    userId: 1,
                    email: 'admin@test.com',
                    isPrimary: true,
                    verifiedAt: new Date()
                }
            ],
            comparePassword: async (password: string) => password === 'password123'
        },
        {
            id: 2,
            username: 'visitor',
            firstName: 'Visitor',
            lastName: 'User',
            type: 'Visitor',
            createdAt: new Date(),
            updatedAt: new Date(),
            emails: [
                {
                    userId: 2,
                    email: 'visitor@test.com',
                    isPrimary: true,
                    verifiedAt: new Date()
                }
            ],
            comparePassword: async (password: string) => password === 'password123'
        }
    ],
    places: [
        {
            id: 1,
            name: 'Test Place',
            description: 'A test place',
            address: '123 Test Street',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdByAdministrator: {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            },
            categories: []
        }
    ],
    events: [
        {
            id: 1,
            name: 'Test Event',
            description: 'A test event',
            startsOn: new Date(),
            endsOn: new Date(Date.now() + 2 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdByAdministrator: {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            },
            place: null
        }
    ],
    articles: [
        {
            id: 1,
            title: 'Test Article',
            content: 'This is a test article',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdByAdministrator: {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            }
        }
    ],
    roles: [
        {
            id: 1,
            name: 'Admin',
            description: 'Administrator role',
            permissions: ['read', 'write', 'delete'],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdByAdministrator: {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            },
            administrators: []
        }
    ],
    advertisements: [
        {
            id: 1,
            name: 'Test Advertisement',
            description: 'A test advertisement',
            startsOn: new Date(),
            endsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            media: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdByAdministrator: {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            },
            place: null
        }
    ]
};

// Mock repository methods
export class MockRepository {
    constructor(private entityName: string, private mockData: any[]) {}

    async findAndCount(options?: any): Promise<[any[], number]> {
        const { skip = 0, take = 10, where, order } = options || {};
        
        let filteredData = [...this.mockData];
        
        // Apply search filter
        if (where) {
            if (Array.isArray(where)) {
                // Handle OR conditions
                filteredData = filteredData.filter(item => 
                    where.some(condition => this.matchesCondition(item, condition))
                );
            } else {
                filteredData = filteredData.filter(item => 
                    this.matchesCondition(item, where)
                );
            }
        }
        
        // Apply sorting
        if (order) {
            const [field, direction] = Object.entries(order)[0];
            filteredData.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                if (direction === 'ASC') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        // Apply pagination
        const paginatedData = filteredData.slice(skip, skip + take);
        
        return [paginatedData, filteredData.length];
    }

    async findOne(options?: any): Promise<any> {
        const { where } = options || {};
        
        if (where && where.id) {
            return this.mockData.find(item => item.id === parseInt(where.id)) || null;
        }
        
        return this.mockData[0] || null;
    }

    async count(): Promise<number> {
        return this.mockData.length;
    }

    async save(entity: any): Promise<any> {
        if (entity.id) {
            // Update existing
            const index = this.mockData.findIndex(item => item.id === entity.id);
            if (index !== -1) {
                this.mockData[index] = { ...this.mockData[index], ...entity };
                return this.mockData[index];
            }
        } else {
            // Create new
            const newEntity = {
                ...entity,
                id: Math.max(...this.mockData.map(item => item.id)) + 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.mockData.push(newEntity);
            return newEntity;
        }
        return entity;
    }

    async softRemove(entity: any): Promise<any> {
        const index = this.mockData.findIndex(item => item.id === entity.id);
        if (index !== -1) {
            this.mockData[index].deletedAt = new Date();
        }
        return entity;
    }

    async remove(entity: any): Promise<any> {
        const index = this.mockData.findIndex(item => item.id === entity.id);
        if (index !== -1) {
            this.mockData.splice(index, 1);
        }
        return entity;
    }

    private matchesCondition(item: any, condition: any): boolean {
        for (const [key, value] of Object.entries(condition)) {
            if (value && typeof value === 'object' && (value as any)._type === 'like') {
                // Handle LIKE conditions
                const itemValue = item[key];
                if (typeof itemValue === 'string' && typeof (value as any)._value === 'string') {
                    const pattern = (value as any)._value.replace(/%/g, '');
                    if (!itemValue.toLowerCase().includes(pattern.toLowerCase())) {
                        return false;
                    }
                }
            } else if (item[key] !== value) {
                return false;
            }
        }
        return true;
    }
}

// Mock DataSource
export class MockDataSource {
    static repositories = new Map<string, MockRepository>();

    static initialize() {
        this.repositories.set('User', new MockRepository('User', MOCK_DATA.users));
        this.repositories.set('Place', new MockRepository('Place', MOCK_DATA.places));
        this.repositories.set('Event', new MockRepository('Event', MOCK_DATA.events));
        this.repositories.set('Article', new MockRepository('Article', MOCK_DATA.articles));
        this.repositories.set('Role', new MockRepository('Role', MOCK_DATA.roles));
        this.repositories.set('Advertisement', new MockRepository('Advertisement', MOCK_DATA.advertisements));
    }

    static getRepository(entity: any): MockRepository {
        const entityName = entity.name || entity.constructor.name;
        return this.repositories.get(entityName) || new MockRepository(entityName, []);
    }
}

// Mock entity classes
export class MockEntity {
    static getRepository(): MockRepository {
        return MockDataSource.getRepository(this);
    }

    static async findAndCount(options?: any): Promise<[any[], number]> {
        return this.getRepository().findAndCount(options);
    }

    static async findOne(options?: any): Promise<any> {
        return this.getRepository().findOne(options);
    }

    static async count(): Promise<number> {
        return this.getRepository().count();
    }

    async save(): Promise<any> {
        return MockDataSource.getRepository(this.constructor).save(this);
    }

    async softRemove(): Promise<any> {
        return MockDataSource.getRepository(this.constructor).softRemove(this);
    }

    async remove(): Promise<any> {
        return MockDataSource.getRepository(this.constructor).remove(this);
    }
}

// Setup function for tests
export function setupTestEnvironment() {
    MockDataSource.initialize();
    
    // Mock the entities
    const entities = ['User', 'Place', 'Event', 'Article', 'Role', 'Advertisement'];
    
    entities.forEach(entityName => {
        const EntityClass = require(`../entities/${entityName}`).default || require(`../entities/${entityName}`)[entityName];
        if (EntityClass) {
            // Replace static methods
            EntityClass.findAndCount = MockEntity.findAndCount.bind(EntityClass);
            EntityClass.findOne = MockEntity.findOne.bind(EntityClass);
            EntityClass.count = MockEntity.count.bind(EntityClass);
            EntityClass.getRepository = MockEntity.getRepository.bind(EntityClass);
            
            // Replace instance methods
            EntityClass.prototype.save = MockEntity.prototype.save;
            EntityClass.prototype.softRemove = MockEntity.prototype.softRemove;
            EntityClass.prototype.remove = MockEntity.prototype.remove;
        }
    });
}

export default MockDataSource;
