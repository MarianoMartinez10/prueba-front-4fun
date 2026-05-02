/**
 * Patrón GoF: Singleton — ThemeManager
 * --------------------------------------------------------------------------
 * Asegura que exista una única instancia global para la gestión del tema
 * visual de la aplicación. Previene inconsistencias de estado entre
 * componentes al centralizar la fuente de verdad.
 *
 * Estándar UTN: Robustez y Mantenibilidad mediante Singleton.
 */

type Theme = 'light' | 'dark' | 'system';

class ThemeManager {
    private static instance: ThemeManager;
    private currentTheme: Theme = 'system';

    private constructor() {
        // Inicialización privada para el patrón Singleton
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('4fun-theme') as Theme;
            this.currentTheme = saved || 'system';
            this.applyTheme(this.currentTheme);
        }
    }

    /**
     * Punto de acceso global al Singleton.
     */
    public static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    /**
     * Obtiene el tema actual.
     */
    public getTheme(): Theme {
        return this.currentTheme;
    }

    /**
     * Cambia el tema globalmente y lo persiste.
     */
    public setTheme(theme: Theme): void {
        this.currentTheme = theme;
        if (typeof window !== 'undefined') {
            localStorage.setItem('4fun-theme', theme);
            this.applyTheme(theme);
        }
    }

    /**
     * Lógica técnica de aplicación al DOM (Infrastructure logic)
     */
    private applyTheme(theme: Theme): void {
        if (typeof window === 'undefined') return;
        
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || 
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.toggle('dark', isDark);
    }
}

export default ThemeManager;
