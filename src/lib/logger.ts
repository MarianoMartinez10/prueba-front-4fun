/**
 * Capa de Infraestructura: Motor de Audit Trail (Logger)
 * --------------------------------------------------------------------------
 * Centraliza la salida de diagnóstico del sistema.
 * Reemplaza el uso directo de 'console.log' para garantizar una estructura de 
 * logs consistente y fácil de monitorear (Structured Logging). (Lib)
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
    /**
     * RN - Auditoría Técnica: Formatea cada entrada de log como un JSON estructurado.
     * Facilita el parseo por herramientas de monitoreo externas.
     */
    private static format(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        return JSON.stringify({
            timestamp,
            level,
            message,
            data: data || undefined
        });
    }

    /**
     * Registra eventos informativos del flujo normal.
     */
    static info(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.info(this.format('info', message, data));
    }

    /**
     * Advierte sobre situaciones no críticas que requieren atención.
     */
    static warn(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.warn(this.format('warn', message, data));
    }

    /**
     * RN - Gestión de Excepciones: Registra fallos críticos.
     * Vital para la depuración en entornos de producción.
     */
    static error(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.error(this.format('error', message, data));
    }

    /**
     * Registro detallado para depuración. 
     * RN - Seguridad: Solo se activa en entorno de 'development' para evitar
     * fuga de trazas técnicas en producción.
     */
    static debug(message: string, data?: any) {
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug(this.format('debug', message, data));
        }
    }
}
