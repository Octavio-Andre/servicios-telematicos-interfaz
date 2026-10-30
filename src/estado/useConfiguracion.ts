import { useCallback, useEffect, useMemo, useState } from "react";
import {
  aplicarDirecciones,
  borrarDireccionesPersonalizadas,
  cargarConfiguracionBase,
  guardarDireccionesPersonalizadas,
  leerDireccionesPersonalizadas,
  type Configuracion,
  type DireccionesPersonalizadas,
} from "../configuracion/configuracion";

type EstadoCarga =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; base: Configuracion };

export function useConfiguracion() {
  const [carga, setCarga] = useState<EstadoCarga>({ estado: "cargando" });
  const [direcciones, setDirecciones] = useState<DireccionesPersonalizadas>(leerDireccionesPersonalizadas);

  useEffect(() => {
    let activo = true;
    cargarConfiguracionBase()
      .then((base) => activo && setCarga({ estado: "listo", base }))
      .catch((error: unknown) =>
        activo && setCarga({ estado: "error", mensaje: error instanceof Error ? error.message : String(error) }),
      );
    return () => {
      activo = false;
    };
  }, []);

  const configuracion = useMemo<Configuracion | null>(
    () =>
      carga.estado === "listo"
        ? { ...carga.base, arquitecturas: aplicarDirecciones(carga.base.arquitecturas, direcciones) }
        : null,
    [carga, direcciones],
  );

  const guardarDirecciones = useCallback((nuevas: DireccionesPersonalizadas) => {
    guardarDireccionesPersonalizadas(nuevas);
    setDirecciones(nuevas);
  }, []);

  const restaurarDirecciones = useCallback(() => {
    borrarDireccionesPersonalizadas();
    setDirecciones({});
  }, []);

  return {
    configuracion,
    errorCarga: carga.estado === "error" ? carga.mensaje : null,
    guardarDirecciones,
    restaurarDirecciones,
  };
}
