export declare const MOCK_DATA: {
    users: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        emails: {
            userId: number;
            email: string;
            isPrimary: boolean;
            verifiedAt: Date;
        }[];
        comparePassword: (password: string) => Promise<boolean>;
    }[];
    places: {
        id: number;
        name: string;
        description: string;
        address: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        createdAt: Date;
        updatedAt: Date;
        createdByAdministrator: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
        };
        categories: never[];
    }[];
    events: {
        id: number;
        name: string;
        description: string;
        startsOn: Date;
        endsOn: Date;
        createdAt: Date;
        updatedAt: Date;
        createdByAdministrator: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
        };
        place: null;
    }[];
    articles: {
        id: number;
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        createdByAdministrator: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
        };
    }[];
    roles: {
        id: number;
        name: string;
        description: string;
        permissions: string[];
        createdAt: Date;
        updatedAt: Date;
        createdByAdministrator: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
        };
        administrators: never[];
    }[];
    advertisements: {
        id: number;
        name: string;
        description: string;
        startsOn: Date;
        endsOn: Date;
        media: never[];
        createdAt: Date;
        updatedAt: Date;
        createdByAdministrator: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
        };
        place: null;
    }[];
};
export declare class MockRepository {
    private entityName;
    private mockData;
    constructor(entityName: string, mockData: any[]);
    findAndCount(options?: any): Promise<[any[], number]>;
    findOne(options?: any): Promise<any>;
    count(): Promise<number>;
    save(entity: any): Promise<any>;
    softRemove(entity: any): Promise<any>;
    remove(entity: any): Promise<any>;
    private matchesCondition;
}
export declare class MockDataSource {
    static repositories: Map<string, MockRepository>;
    static initialize(): void;
    static getRepository(entity: any): MockRepository;
}
export declare class MockEntity {
    static getRepository(): MockRepository;
    static findAndCount(options?: any): Promise<[any[], number]>;
    static findOne(options?: any): Promise<any>;
    static count(): Promise<number>;
    save(): Promise<any>;
    softRemove(): Promise<any>;
    remove(): Promise<any>;
}
export declare function setupTestEnvironment(): void;
export default MockDataSource;
//# sourceMappingURL=MockDataSource.d.ts.map