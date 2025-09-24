import type { IMedia } from '../../interfaces';
import type { User } from '../entities/User';
import type { UserType } from '../enums';















// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    draw?: number;
    recordsTotal: number;
    recordsFiltered: number;
    pagination?: Pagination;
}

// Authentication Types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

// DataTable Request Types
export interface DataTableRequest {
    draw?: number;
    start?: number;
    length?: number;
    search?: {
        value: string;
        regex?: boolean;
    };
    order?: Array<{
        column: number;
        dir: 'asc' | 'desc';
    }>;
    columns?: Array<{
        data: string;
        name?: string;
        searchable?: boolean;
        orderable?: boolean;
        search?: {
            value: string;
            regex?: boolean;
        };
    }>;
    // Additional filters
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

// Form Types
export interface PlaceFormData {
    name: string;
    description: string;
    address: string;
    coordinates?: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: IMedia[];
    categories?: number[];
}

export interface EventFormData {
    name: string;
    description: string;
    placeId?: number;
    address?: string;
    coordinates?: string;
    organizer?: string;
    startsOn: string;
    endsOn: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: IMedia[];
    categories?: number[];
}

export interface UserFormData {
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    birthdate?: string;
    type: UserType;
    roleId?: number;
    permissions?: string[];
}
