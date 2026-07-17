import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = {
    light: { key: 'light', label: 'White', className: '', color: '#F7F7F9' },
    midnight: { key: 'midnight', label: 'Midnight', className: 'theme-midnight', color: '#020617' },
    hotpink: { key: 'hotpink', label: 'Hot Pink', className: 'theme-hotpink', color: '#1F0024' },
};

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('pih_theme') || 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        Object.values(THEMES).forEach(t => {
            if (t.className) root.classList.remove(t.className);
        });
        const current = THEMES[theme];
        if (current?.className) {
            root.classList.add(current.className);
        }
        localStorage.setItem('pih_theme', theme);
    }, [theme]);

    const setTheme = (key) => {
        if (THEMES[key]) setThemeState(key);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}