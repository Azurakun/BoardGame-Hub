export interface Card {
    id: string;
    name: { en: string; id: string };
    type: { en: string; id: string };
    effect: { en: string; id: string };
    lore?: { en: string; id: string };
    imageUrl: string;
    gameId: string;
    color: string;
}
