"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEntity = exports.MockDataSource = exports.MockRepository = exports.MOCK_DATA = void 0;
exports.setupTestEnvironment = setupTestEnvironment;
// Mock data for testing
exports.MOCK_DATA = {
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
            comparePassword: async (password) => password === 'password123'
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
            comparePassword: async (password) => password === 'password123'
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
class MockRepository {
    constructor(entityName, mockData) {
        this.entityName = entityName;
        this.mockData = mockData;
    }
    async findAndCount(options) {
        const { skip = 0, take = 10, where, order } = options || {};
        let filteredData = [...this.mockData];
        // Apply search filter
        if (where) {
            if (Array.isArray(where)) {
                // Handle OR conditions
                filteredData = filteredData.filter(item => where.some(condition => this.matchesCondition(item, condition)));
            }
            else {
                filteredData = filteredData.filter(item => this.matchesCondition(item, where));
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
                }
                else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        // Apply pagination
        const paginatedData = filteredData.slice(skip, skip + take);
        return [paginatedData, filteredData.length];
    }
    async findOne(options) {
        const { where } = options || {};
        if (where && where.id) {
            return this.mockData.find(item => item.id === parseInt(where.id)) || null;
        }
        return this.mockData[0] || null;
    }
    async count() {
        return this.mockData.length;
    }
    async save(entity) {
        if (entity.id) {
            // Update existing
            const index = this.mockData.findIndex(item => item.id === entity.id);
            if (index !== -1) {
                this.mockData[index] = { ...this.mockData[index], ...entity };
                return this.mockData[index];
            }
        }
        else {
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
    async softRemove(entity) {
        const index = this.mockData.findIndex(item => item.id === entity.id);
        if (index !== -1) {
            this.mockData[index].deletedAt = new Date();
        }
        return entity;
    }
    async remove(entity) {
        const index = this.mockData.findIndex(item => item.id === entity.id);
        if (index !== -1) {
            this.mockData.splice(index, 1);
        }
        return entity;
    }
    matchesCondition(item, condition) {
        for (const [key, value] of Object.entries(condition)) {
            if (value && typeof value === 'object' && value._type === 'like') {
                // Handle LIKE conditions
                const itemValue = item[key];
                if (typeof itemValue === 'string' && typeof value._value === 'string') {
                    const pattern = value._value.replace(/%/g, '');
                    if (!itemValue.toLowerCase().includes(pattern.toLowerCase())) {
                        return false;
                    }
                }
            }
            else if (item[key] !== value) {
                return false;
            }
        }
        return true;
    }
}
exports.MockRepository = MockRepository;
// Mock DataSource
class MockDataSource {
    static initialize() {
        this.repositories.set('User', new MockRepository('User', exports.MOCK_DATA.users));
        this.repositories.set('Place', new MockRepository('Place', exports.MOCK_DATA.places));
        this.repositories.set('Event', new MockRepository('Event', exports.MOCK_DATA.events));
        this.repositories.set('Article', new MockRepository('Article', exports.MOCK_DATA.articles));
        this.repositories.set('Role', new MockRepository('Role', exports.MOCK_DATA.roles));
        this.repositories.set('Advertisement', new MockRepository('Advertisement', exports.MOCK_DATA.advertisements));
    }
    static getRepository(entity) {
        const entityName = entity.name || entity.constructor.name;
        return this.repositories.get(entityName) || new MockRepository(entityName, []);
    }
}
exports.MockDataSource = MockDataSource;
MockDataSource.repositories = new Map();
// Mock entity classes
class MockEntity {
    static getRepository() {
        return MockDataSource.getRepository(this);
    }
    static async findAndCount(options) {
        return this.getRepository().findAndCount(options);
    }
    static async findOne(options) {
        return this.getRepository().findOne(options);
    }
    static async count() {
        return this.getRepository().count();
    }
    async save() {
        return MockDataSource.getRepository(this.constructor).save(this);
    }
    async softRemove() {
        return MockDataSource.getRepository(this.constructor).softRemove(this);
    }
    async remove() {
        return MockDataSource.getRepository(this.constructor).remove(this);
    }
}
exports.MockEntity = MockEntity;
// Setup function for tests
function setupTestEnvironment() {
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
exports.default = MockDataSource;
//# sourceMappingURL=MockDataSource.js.map