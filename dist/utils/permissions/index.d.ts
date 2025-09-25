declare abstract class BasePermission {
    static getPermissionPath(permission: string): string[];
    static getAllPermissions(): string[];
}
export declare class AdministratorPermission extends BasePermission {
    static DO_EVERYTHING: string;
    static MANAGE_USERS: string;
    static CREATE_USERS: string;
    static READ_USERS: string;
    static UPDATE_USERS: string;
    static DELETE_USERS: string;
    static MANAGE_PLACES: string;
    static CREATE_PLACES: string;
    static READ_PLACES: string;
    static UPDATE_PLACES: string;
    static DELETE_PLACES: string;
    static MANAGE_EVENTS: string;
    static CREATE_EVENTS: string;
    static READ_EVENTS: string;
    static UPDATE_EVENTS: string;
    static DELETE_EVENTS: string;
    static MANAGE_ARTICLES: string;
    static CREATE_ARTICLES: string;
    static READ_ARTICLES: string;
    static UPDATE_ARTICLES: string;
    static DELETE_ARTICLES: string;
    static MANAGE_ADVERTISEMENTS: string;
    static CREATE_ADVERTISEMENTS: string;
    static READ_ADVERTISEMENTS: string;
    static UPDATE_ADVERTISEMENTS: string;
    static DELETE_ADVERTISEMENTS: string;
    static READ_ACCESS_LOGS: string;
    static getHierarchy(): {
        [x: string]: {
            [x: string]: boolean | {
                [x: string]: boolean;
            };
        };
    };
}
export { BasePermission };
//# sourceMappingURL=index.d.ts.map