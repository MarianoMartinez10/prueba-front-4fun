import * as React from "react"

/**
 * Capa de Lógica Reutilizable: Adaptabilidad de Interfaz (Responsive Hook)
 * --------------------------------------------------------------------------
 * Detecta dinámicamente el factor de forma del dispositivo del usuario.
 * Provee un indicador booleano para el renderizado condicional de componentes
 * optimizados para móviles o escritorio. (UI / Hook)
 */

// RN - Especificación Técnica: Punto de quiebre estándar para dispositivos móviles.
const MOBILE_BREAKPOINT = 768

/**
 * RN - UX Adaptativa: Escucha los cambios en el viewport para ajustar la UI.
 * 
 * @returns {boolean} True si el ancho de pantalla es inferior al breakpoint móvil.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Utiliza la API de MatchMedia para una detección eficiente a nivel de navegador.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Registra el escuchador de eventos para cambios en la orientación o redimensión.
    mql.addEventListener("change", onChange)
    
    // Ejecución inicial para establecer el estado de arranque.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
