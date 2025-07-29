import { Document } from "mongoose";

export interface ILinksWithNames {
    name: string;
    link: string;
}
export interface IBannerPrincipal extends Document {
    image: string;
    imageMobile: string;
    links: ILinksWithNames[];
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBannerPrincipalRequest {
    image: string;
    imageMobile: string;
    links: ILinksWithNames[];
    status: boolean;
}