import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export interface Category {
    id: string;
    name: {
        en: string;
        id: string;
    };
    type: 'card' | 'wiki' | 'mechanic';
}

interface CategoriesContextType {
    categories: Category[];
    addCategory: (cat: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const API_URL = `${API_BASE_URL}/api/categories`;

    const fetchCategories = async () => {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (cat: Category) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cat)
            });
            if (res.ok) {
                const newCat = await res.json();
                setCategories(prev => [...prev, newCat]);
            }
        } catch (error) {
            console.error("Failed to add category", error);
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    return (
        <CategoriesContext.Provider value={{ categories, addCategory, deleteCategory }}>
            {children}
        </CategoriesContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoriesContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoriesProvider');
    }
    return context;
};
