abstract class BasePermission {

    static getPermissionPath(permission: string): string[] {
        const hierarchy = (this as any).getHierarchy();
        const stack: [Record<string, any>, string[]][] = [[hierarchy, []]];
        while (stack.length > 0) {
            const [obj, path] = stack.pop()!;
            for (const key in obj) {
                if (key === permission) {
                    return [...path, permission];
                }
                if (typeof obj[key] === 'object') {
                    stack.push([obj[key], [...path, key]]);
                }
            }
        }
        return [];
    }

    static getAllPermissions(): string[] {
        const permissions: string[] = [];

        const stack: Record<string, any>[] = [(this as any).getHierarchy()];
        while (stack.length > 0) {
            const obj = stack.pop()!;
            for (const key in obj) {
                permissions.push(key);
                if (typeof obj[key] === 'object') {
                    stack.push(obj[key]);
                }
            }
        }

        return permissions;
    }
}

export class AdministratorPermission extends BasePermission {
    static DO_EVERYTHING = 'Do Everything';

    static MANAGE_USERS = 'Manage Users';
    static CREATE_USERS = 'Create Users';
    static READ_USERS = 'Read Users';
    static UPDATE_USERS = 'Update Users';
    static DELETE_USERS = 'Delete Users';

    static MANAGE_PLACES = 'Manage Places';
    static CREATE_PLACES = 'Create Places';
    static READ_PLACES = 'Read Places';
    static UPDATE_PLACES = 'Update Places';
    static DELETE_PLACES = 'Delete Places';

    static MANAGE_EVENTS = 'Manage Events';
    static CREATE_EVENTS = 'Create Events';
    static READ_EVENTS = 'Read Events';
    static UPDATE_EVENTS = 'Update Events';
    static DELETE_EVENTS = 'Delete Events';

    static MANAGE_ARTICLES = 'Manage Articles';
    static CREATE_ARTICLES = 'Create Articles';
    static READ_ARTICLES = 'Read Articles';
    static UPDATE_ARTICLES = 'Update Articles';
    static DELETE_ARTICLES = 'Delete Articles';

    static MANAGE_ADVERTISEMENTS = 'Manage Advertisements';
    static CREATE_ADVERTISEMENTS = 'Create Advertisements';
    static READ_ADVERTISEMENTS = 'Read Advertisements';
    static UPDATE_ADVERTISEMENTS = 'Update Advertisements';
    static DELETE_ADVERTISEMENTS = 'Delete Advertisements';

    static READ_ACCESS_LOGS = 'Read Access Logs';

    static getHierarchy() {
        return {
            [this.DO_EVERYTHING]: {
                [this.MANAGE_USERS]: {
                    [this.CREATE_USERS]: true,
                    [this.READ_USERS]: true,
                    [this.UPDATE_USERS]: true,
                    [this.DELETE_USERS]: true,
                },
                [this.MANAGE_PLACES]: {
                    [this.CREATE_PLACES]: true,
                    [this.READ_PLACES]: true,
                    [this.UPDATE_PLACES]: true,
                    [this.DELETE_PLACES]: true,
                },
                [this.MANAGE_EVENTS]: {
                    [this.CREATE_EVENTS]: true,
                    [this.READ_EVENTS]: true,
                    [this.UPDATE_EVENTS]: true,
                    [this.DELETE_EVENTS]: true,
                },
                [this.MANAGE_ARTICLES]: {
                    [this.CREATE_ARTICLES]: true,
                    [this.READ_ARTICLES]: true,
                    [this.UPDATE_ARTICLES]: true,
                    [this.DELETE_ARTICLES]: true,
                },
                [this.MANAGE_ADVERTISEMENTS]: {
                    [this.CREATE_ADVERTISEMENTS]: true,
                    [this.READ_ADVERTISEMENTS]: true,
                    [this.UPDATE_ADVERTISEMENTS]: true,
                    [this.DELETE_ADVERTISEMENTS]: true,
                },
                [this.READ_ACCESS_LOGS]: true,
            }
        };
    }
}