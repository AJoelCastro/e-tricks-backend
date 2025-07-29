import mongoose, { Schema } from "mongoose";
import { IBannerPrincipal, ILinksWithNames } from "../interfaces/BannerPrincipal";

const LinksSchema = new Schema<ILinksWithNames>(
    {
        name: { type: String, required: true },
        link: { type: String, required: true }
    },
    { _id: false }
);
const BannerPrincipalSchema = new Schema<IBannerPrincipal>(
    {
        image: { type: String, required: true },
        imageMobile: { type: String, required: true },
        links: { type: [LinksSchema], required: true },
        status: { type: Boolean, required: true },
    },
    { timestamps: true }
);

export const BannerPrincipalModel = mongoose.model<IBannerPrincipal>("BannerPrincipal", BannerPrincipalSchema);