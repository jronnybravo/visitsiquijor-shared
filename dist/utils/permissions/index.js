"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePermission = exports.AdministratorPermission = void 0;
class BasePermission {
    static getPermissionPath(permission) {
        const hierarchy = this.getHierarchy();
        const stack = [[hierarchy, []]];
        while (stack.length > 0) {
            const [obj, path] = stack.pop();
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
    static getAllPermissions() {
        const permissions = [];
        const stack = [this.getHierarchy()];
        while (stack.length > 0) {
            const obj = stack.pop();
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
exports.BasePermission = BasePermission;
class AdministratorPermission extends BasePermission {
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
exports.AdministratorPermission = AdministratorPermission;
AdministratorPermission.DO_EVERYTHING = 'Do Everything';
AdministratorPermission.MANAGE_USERS = 'Manage Users';
AdministratorPermission.CREATE_USERS = 'Create Users';
AdministratorPermission.READ_USERS = 'Read Users';
AdministratorPermission.UPDATE_USERS = 'Update Users';
AdministratorPermission.DELETE_USERS = 'Delete Users';
AdministratorPermission.MANAGE_PLACES = 'Manage Places';
AdministratorPermission.CREATE_PLACES = 'Create Places';
AdministratorPermission.READ_PLACES = 'Read Places';
AdministratorPermission.UPDATE_PLACES = 'Update Places';
AdministratorPermission.DELETE_PLACES = 'Delete Places';
AdministratorPermission.MANAGE_EVENTS = 'Manage Events';
AdministratorPermission.CREATE_EVENTS = 'Create Events';
AdministratorPermission.READ_EVENTS = 'Read Events';
AdministratorPermission.UPDATE_EVENTS = 'Update Events';
AdministratorPermission.DELETE_EVENTS = 'Delete Events';
AdministratorPermission.MANAGE_ARTICLES = 'Manage Articles';
AdministratorPermission.CREATE_ARTICLES = 'Create Articles';
AdministratorPermission.READ_ARTICLES = 'Read Articles';
AdministratorPermission.UPDATE_ARTICLES = 'Update Articles';
AdministratorPermission.DELETE_ARTICLES = 'Delete Articles';
AdministratorPermission.MANAGE_ADVERTISEMENTS = 'Manage Advertisements';
AdministratorPermission.CREATE_ADVERTISEMENTS = 'Create Advertisements';
AdministratorPermission.READ_ADVERTISEMENTS = 'Read Advertisements';
AdministratorPermission.UPDATE_ADVERTISEMENTS = 'Update Advertisements';
AdministratorPermission.DELETE_ADVERTISEMENTS = 'Delete Advertisements';
AdministratorPermission.READ_ACCESS_LOGS = 'Read Access Logs';
//# sourceMappingURL=index.js.map