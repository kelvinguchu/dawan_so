import { Block } from "payload";

export const RecentBlogPosts: Block = {
    slug: "recentBlogPosts",
    fields: [
        {
            name: "shownPosts",
            type: "relationship",
            relationTo: "blogPosts",
            label: "Shown Posts",
            hasMany: true,
        },
        
    ],
};

