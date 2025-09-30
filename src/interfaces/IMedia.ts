export interface IMedia {
    name?: string;
    type?: 'image' | 'video';
    description?: string;
    isDefault?: boolean;
    url: string;
}