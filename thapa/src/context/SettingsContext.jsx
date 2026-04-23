import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // 1. Initialize state from localStorage or defaults
    const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'auto');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('app-font-size') || 'medium');
    const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('app-privacy') === 'true');

    // 2. Apply theme and font size to document root
    useEffect(() => {
        const root = document.documentElement;
        
        // Theme logic
        let appliedTheme = theme;
        if (theme === 'auto') {
            appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        root.setAttribute('data-theme', appliedTheme);
        localStorage.setItem('app-theme', theme);
        
        // Font size logic
        root.setAttribute('data-font-size', fontSize);
        localStorage.setItem('app-font-size', fontSize);

        // Privacy persistence
        localStorage.setItem('app-privacy', isPrivate);
    }, [theme, fontSize, isPrivate]);

    // 3. Watch for system theme changes if 'auto' is selected
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <SettingsContext.Provider value={{ 
            theme, setTheme, 
            fontSize, setFontSize, 
            isPrivate, setIsPrivate 
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
