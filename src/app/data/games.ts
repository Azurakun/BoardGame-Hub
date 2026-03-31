export interface Game {
  id: string;
  name: { en: string; id: string };
  category: string[];
  description: { en: string; id: string };
  shortDescription: { en: string; id: string };
  minPlayers: number;
  maxPlayers: number;
  playTime: number; // in minutes
  complexity: 1 | 2 | 3 | 4 | 5;
  designer: string;
  yearPublished: number;
  mechanics: string[];
  imageUrl: string;
  howToPlay: { en: string[]; id: string[] };
  rules: {
    title: { en: string; id: string };
    content: { en: string; id: string };
  }[];
  faq?: {
    q: { en: string; id: string };
    a: { en: string; id: string };
  }[];
  videoUrl?: string;
}
