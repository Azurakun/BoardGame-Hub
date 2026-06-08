import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card } from '../data/cards';
import { API_BASE_URL } from '../config';

interface CardsContextType {
    cards: Card[];
    loading: boolean;
    addCard: (card: Omit<Card, 'id'>) => Promise<boolean>;
    updateCard: (id: string, card: Omit<Card, 'id'>) => Promise<boolean>;
    deleteCard: (id: string) => Promise<boolean>;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = `${API_BASE_URL}/api/cards`;

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setCards(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Failed to fetch cards from MongoDB:", err);
                setCards([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const addCard = async (newCardData: Omit<Card, 'id'>): Promise<boolean> => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCardData)
            });
            if (res.ok) {
                const newCard = await res.json();
                setCards(prev => [...prev, newCard]);
                return true;
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to create card on server:", errorData);
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const updateCard = async (id: string, updatedCardData: Omit<Card, 'id'>): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCardData)
            });
            if (res.ok) {
                const updatedCard = await res.json();
                setCards(prev => prev.map(c => c.id === id ? updatedCard : c));
                return true;
            } else {
                console.error("Failed to update card on server");
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const deleteCard = async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setCards(prev => prev.filter(c => c.id !== id));
                return true;
            } else {
                console.error("Failed to delete card on server");
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return (
        <CardsContext.Provider value={{ cards, loading, addCard, updateCard, deleteCard }}>
            {children}
        </CardsContext.Provider>
    );
}

export function useCards() {
    const context = useContext(CardsContext);
    if (context === undefined) {
        throw new Error('useCards must be used within a CardsProvider');
    }
    return context;
}
