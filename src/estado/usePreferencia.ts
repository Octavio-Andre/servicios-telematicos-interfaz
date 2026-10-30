import { useEffect, useState } from "react";

export function usePreferencia(clave: string, valorInicial: string): [string, (valor: string) => void] {
  const [valor, setValor] = useState(() => {
    try {
      return localStorage.getItem(clave) ?? valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(clave, valor);
    } catch {
      return;
    }
  }, [clave, valor]);

  return [valor, setValor];
}
