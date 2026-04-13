import { useState, useEffect } from 'react';

/**
 * Capa de Lógica Reutilizable: Optimización de Eventos (Debounce Hook)
 * --------------------------------------------------------------------------
 * Orquesta la demora controlada en la propagación de cambios de estado.
 * Su propósito es mitigar el impacto de eventos de alta frecuencia, como
 * el tipado en campos de búsqueda, protegiendo al backend de sobrecargas.
 * (Lib / Hook)
 */

/**
 * RN - Optimización de Red: Implementa un retardo (delay) antes de confirmar un valor.
 * 
 * @template T - Tipo de dato del valor a procesar.
 * @param {T} value - Valor de entrada que muta rápidamente.
 * @param {number} delay - Tiempo de espera en milisegundos (default: 500ms).
 * @returns {T} El valor estabilizado tras el periodo de espera.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Inicializa el temporizador de estabilización.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // RN - Limpieza: Cancela el temporizador anterior si el valor cambia antes del delay.
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
