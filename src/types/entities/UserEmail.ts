import { User } from './User';

export interface UserEmail {
    isPrimary: boolean;
    user?: User;
}