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
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    user: any;
    token: string;
    refreshToken?: string;
}
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
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}
export interface PlaceFormData {
    name: string;
    description: string;
    address: string;
    coordinates?: string;
    featureStartsOn?: string;
    featureEndsOn?: string;
    media?: any[];
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
    media?: any[];
    categories?: number[];
}
export interface UserFormData {
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    birthdate?: string;
    type: any;
    roleId?: number;
    permissions?: string[];
}
//# sourceMappingURL=index.d.ts.map