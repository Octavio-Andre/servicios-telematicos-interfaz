import { useEffect, useState } from "react";

export function useReloj(intervaloMs = 30_000): number {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = setInterval(() => setAhora(Date.now()), intervaloMs);
    return () => clearInterval(temporizador);
  }, [intervaloMs]);

  return ahora;
}
