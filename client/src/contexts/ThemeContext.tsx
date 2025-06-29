import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [isDark, setIsDark] = useState(true); // Default to dark mode

    useEffect(() => {
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            const prefersDark = 'dark' === savedTheme;
            setIsDark(prefersDark);
            updateDocumentClass(prefersDark);
        } else {
            // Default to dark mode and save preference
            setIsDark(true);
            updateDocumentClass(true);
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    const updateDocumentClass = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        updateDocumentClass(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    const setTheme = (theme: 'light' | 'dark') => {
        const dark = 'dark' === theme;
        setIsDark(dark);
        updateDocumentClass(dark);
        localStorage.setItem('theme', theme);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}