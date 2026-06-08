import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game } from '../data/games';
import { API_BASE_URL } from '../config';

interface GamesContextType {
    games: Game[];
    loading: boolean;
    addGame: (game: Game) => Promise<boolean>;
    updateGame: (id: string, game: Game) => Promise<boolean>;
    deleteGame: (id: string) => Promise<boolean>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: ReactNode }) {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = `${API_BASE_URL}/api/games`;

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setGames(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Failed to fetch games from MongoDB:", err);
                setGames([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const addGame = async (game: Game): Promise<boolean> => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(game)
            });
            if (res.ok) {
                const newGame = await res.json();
                setGames(prev => [...prev, newGame]);
                return true;
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to add game to DB", errorData);
                return false;
            }
        } catch (error) {
            console.error("Failed to add game", error);
            return false;
        }
    };

    const updateGame = async (id: string, updatedGame: Game): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedGame)
            });
            if (res.ok) {
                const newGame = await res.json();
                setGames(prev => prev.map(g => g.id === id ? newGame : g));
                return true;
            } else {
                console.error("Failed to update game in DB");
                return false;
            }
        } catch (error) {
            console.error("Failed to update game", error);
            return false;
        }
    };

    const deleteGame = async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setGames(prev => prev.filter(g => g.id !== id));
                return true;
            } else {
                console.error("Failed to delete game from DB");
                return false;
            }
        } catch (error) {
            console.error("Failed to delete game", error);
            return false;
        }
    };

    return (
        <GamesContext.Provider value={{ games, loading, addGame, updateGame, deleteGame }}>
            {children}
        </GamesContext.Provider>
    );
}

export function useGames() {
    const context = useContext(GamesContext);
    if (context === undefined) {
        throw new Error('useGames must be used within a GamesProvider');
    }
    return context;
}
