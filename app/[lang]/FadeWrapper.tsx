"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface FadeWrapperProps {
  children: React.ReactNode;
  delay?: number;
  // El contenido de cada página debe re-animar en cada navegación; el header
  // (chrome fijo del sitio) no tiene sentido que parpadee en cada clic, así
  // que se anima una sola vez, al cargar.
  remountOnNavigate?: boolean;
}

function FadeInner({ children, delay }: { children: React.ReactNode; delay: number }) {
  // Mientras la animación de CSS está activa, el elemento crea un "stacking
  // context" nuevo (cualquier `animation`/`transition` sobre opacity lo hace),
  // lo que puede atrapar hijos con z-index alto (ej. el menú del header) por
  // debajo de otros elementos del layout. Por eso sacamos la clase apenas
  // termina de animar, dejando el div sin ningún estilo especial.
  const [animating, setAnimating] = useState(true);

  return (
    <div
      className={animating ? "fade-wrapper" : undefined}
      style={animating ? { animationDelay: `${delay}s` } : undefined}
      onAnimationEnd={() => setAnimating(false)}
    >
      {children}
    </div>
  );
}

export function FadeWrapper({ children, delay = 0, remountOnNavigate = false }: FadeWrapperProps) {
  const pathname = usePathname();
  // Este componente NO se remonta entre navegaciones (solo FadeInner, vía
  // key), así que esta ref sobrevive y nos dice si ya pasamos por la carga
  // inicial: de ahí en más, el delay de arranque no aplica más.
  const hasMountedRef = useRef(false);
  const effectiveDelay = hasMountedRef.current ? 0 : delay;

  useEffect(() => {
    hasMountedRef.current = true;
  }, [pathname]);

  return (
    <FadeInner key={remountOnNavigate ? pathname : "static"} delay={effectiveDelay}>
      {children}
    </FadeInner>
  );
}
