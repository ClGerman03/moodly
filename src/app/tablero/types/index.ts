// Tipos compartidos para los componentes del tablero

export type SectionType = "bento" | "palette" | "links" | "typography";

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  type: "spotify" | "youtube" | "twitter" | "threads" | "instagram" | "other";
}

export interface ImageMetadata {
  title?: string;
  description?: string;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}
