import { useEffect, useCallback } from 'react';

/**
 * Custom hook for dark mode toggle.
 * Uses body.dark-mode class + localStorage persistence.
 * Syncs across tabs via storage event listener.
 */
export function useDarkMode() {
    const applyDarkMode = useCallback((enabled) => {
        document.body.classList.toggle('dark-mode', enabled);
    }, []);

    const toggleDarkMode = useCallback(() => {
        const isDark = document.body.classList.contains('dark-mode');
        const next = !isDark;
        applyDarkMode(next);
        localStorage.setItem('darkMode', String(next));
    }, [applyDarkMode]);

    // Init dark mode from localStorage + listen for cross-tab changes
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true' || document.body.classList.contains('dark-mode')) {
            applyDarkMode(true);
        }

        const handleStorage = (event) => {
            if (event.key === 'darkMode') {
                applyDarkMode(event.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [applyDarkMode]);

    return { toggleDarkMode };
}
