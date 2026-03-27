import { Box, Terminal, Radio, Paintbrush, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectType } from "@/data/projects";

export interface ProjectTypeConfig {
  style: number;
  colors: [[number, number, number], [number, number, number], [number, number, number]];
  dominantHex: string;
  icon: LucideIcon;
  label: string;
}

export const PROJECT_TYPE_CONFIG: Record<ProjectType, ProjectTypeConfig> = {
  "3d": {
    style: 0,
    colors: [
      [0.482, 0.184, 0.745],   // purple #7b2fbe
      [0, 0.898, 1],            // cyan #00e5ff
      [0, 0.722, 0.663],        // teal #00b8a9
    ],
    dominantHex: "#7b2fbe",
    icon: Box,
    label: "3D",
  },
  software: {
    style: 1,
    colors: [
      [0, 0.898, 1],            // cyan #00e5ff
      [0.224, 1, 0.078],        // green #39ff14
      [0.482, 0.184, 0.745],    // purple #7b2fbe
    ],
    dominantHex: "#00e5ff",
    icon: Terminal,
    label: "Software",
  },
  performance: {
    style: 2,
    colors: [
      [1, 0.549, 0],            // orange #ff8c00
      [0.482, 0.184, 0.745],    // purple #7b2fbe
      [0, 0.898, 1],            // cyan #00e5ff
    ],
    dominantHex: "#ff8c00",
    icon: Radio,
    label: "Performance",
  },
  artwork: {
    style: 3,
    colors: [
      [0.224, 1, 0.078],        // green #39ff14
      [0, 0.898, 1],            // cyan #00e5ff
      [1, 0.549, 0],            // orange #ff8c00
    ],
    dominantHex: "#39ff14",
    icon: Paintbrush,
    label: "Artwork",
  },
  diy: {
    style: 4,
    colors: [
      [1, 0.549, 0],            // orange #ff8c00
      [0.224, 1, 0.078],        // green #39ff14
      [0.482, 0.184, 0.745],    // purple #7b2fbe
    ],
    dominantHex: "#ff8c00",
    icon: Wrench,
    label: "DIY",
  },
};
