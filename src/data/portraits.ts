export type PortraitPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  framed?: boolean;
};

const cafePortrait: PortraitPhoto = {
  src: "/cafe-portrait.webp",
  alt: "Shravani Roy sitting in a café",
  width: 768,
  height: 1152,
  caption: "At a café",
  framed: true,
};

export const streetPortrait: PortraitPhoto = {
  src: "/home-portrait.webp",
  alt: "Shravani Roy standing on a tree-lined street",
  width: 524,
  height: 636,
  caption: "On a tree-lined street",
};

export const aboutPhotos = [cafePortrait, streetPortrait] as const;
