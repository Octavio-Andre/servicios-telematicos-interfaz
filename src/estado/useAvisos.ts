import { useCallback, useRef, useState } from "react";

export type TipoAviso = "error" | "exito";

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  mensaje: string;
}

const DURACION_AVISO_MS = 4500;

export function useAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguienteId = useRef(0);

  const descartar = useCallback((id: number) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: TipoAviso, mensaje: string) => {
      siguienteId.current += 1;
      const id = siguienteId.current;
      setAvisos((actuales) => [...actuales.filter((aviso) => aviso.mensaje !== mensaje), { id, tipo, mensaje }].slice(-3));
      setTimeout(() => descartar(id), DURACION_AVISO_MS);
    },
    [descartar],
  );

  return { avisos, mostrar, descartar };
}
