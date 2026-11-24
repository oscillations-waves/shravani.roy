import type { ImageMetadata } from "astro";
import coffeeAndWhereabouts from "@/assets/photography/coffee-and-whereabouts.webp";
import whereaboutsByTheWindow from "@/assets/photography/whereabouts-by-the-window.webp";
import crowOnAWire from "@/assets/photography/crow-on-a-wire.webp";
import lastLightAcrossTheWater from "@/assets/photography/last-light-across-the-water.webp";
import treetopsAtDusk from "@/assets/photography/treetops-at-dusk.webp";
import strawberries from "@/assets/photography/strawberries.webp";
import driedFlowers from "@/assets/photography/dried-flowers.webp";
import clayPots from "@/assets/photography/clay-pots.webp";
import stripedLeaves from "@/assets/photography/striped-leaves.webp";
import betweenThePages from "@/assets/photography/between-the-pages.webp";

export type Photograph = {
  image: ImageMetadata;
  alt: string;
  caption: string;
};

export const photographs: Photograph[] = [
  {
    image: coffeeAndWhereabouts,
    alt: "A copy of Whereabouts, a yellow mug, and a bowl of coffee beans on a wooden table",
    caption: "Coffee and Whereabouts",
  },
  {
    image: whereaboutsByTheWindow,
    alt: "A hand holding Jhumpa Lahiri’s Whereabouts beside a sunlit window",
    caption: "Whereabouts by the window",
  },
  {
    image: crowOnAWire,
    alt: "A crow perched on a wire above the arched shutters of an old building",
    caption: "A crow on a wire",
  },
  {
    image: lastLightAcrossTheWater,
    alt: "A pale sun low beside a smokestack silhouetted across dark water",
    caption: "Last light across the water",
  },
  {
    image: treetopsAtDusk,
    alt: "Treetops and a few distant lights beneath dark clouds at dusk",
    caption: "Treetops at dusk",
  },
  {
    image: strawberries,
    alt: "Bright red strawberries in a black bowl on a white surface",
    caption: "Strawberries",
  },
  {
    image: driedFlowers,
    alt: "A glass jar of dried chamomile flowers, seen from above",
    caption: "Chamomile",
  },
  {
    image: clayPots,
    alt: "Rows of clay pots with ridged bands in a black-and-white close-up",
    caption: "Clay pots",
  },
  {
    image: stripedLeaves,
    alt: "Overlapping green leaves with bright yellow stripes",
    caption: "Striped leaves",
  },
  {
    image: betweenThePages,
    alt: "A hand holding open a book with a band of light across the pages",
    caption: "Between the pages",
  },
];
