import { useEffect, useState } from "react";
import type { Arquitectura } from "../configuracion/configuracion";
import { consultarSalud } from "../proveedores/proveedorTareas";

export interface SaludServicio {
  disponible: boolean | null;
  latenciaMs?: number;
}

export function useSaludServicios(
  arquitecturas: Arquitectura[],
  intervaloMs: number,
  tiempoMaximoMs: number,
): Record<string, SaludServicio> {
  const [salud, setSalud] = useState<Record<string, SaludServicio>>({});

  useEffect(() => {
    let activo = true;

    const revisar = async () => {
      const resultados = await Promise.all(
        arquitecturas.map(async (arquitectura): Promise<[string, SaludServicio]> => {
          try {
            const latenciaMs = await consultarSalud(arquitectura, tiempoMaximoMs);
            return [arquitectura.id, { disponible: true, latenciaMs }];
          } catch {
            return [arquitectura.id, { disponible: false }];
          }
        }),
      );

      if (activo) {
        setSalud(Object.fromEntries(resultados));
      }
    };

    void revisar();
    const temporizador = setInterval(() => void revisar(), intervaloMs);

    return () => {
      activo = false;
      clearInterval(temporizador);
    };
  }, [arquitecturas, intervaloMs, tiempoMaximoMs]);

  return salud;
}
