// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    username: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Простая проверка - если есть токен, считаем пользователя авторизованным
        const token = localStorage.getItem("token");
        if (token) {
            // Временное решение - устанавливаем mock пользователя
            // В реальном приложении нужно делать запрос к API для получения данных пользователя
            setUser({
                id: 1, // Это должно приходить с бекенда
                username: "Текущий пользователь"
            });
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};