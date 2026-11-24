import type { ImageMetadata } from "astro";

type Photograph = {
  image: ImageMetadata;
  alt: string;
  caption?: string;
};

// Import images from src/assets/photography and list them here in display order.
export const photographs: Photograph[] = [];
