import type { EventoTarea } from "../dominio/eventoTarea";
import type { Tarea } from "../dominio/tarea";

export interface EstadoTareas {
  tareas: Record<string, Tarea>;
  versionesEliminadas: Record<string, number>;
}

export type AccionTareas = EventoTarea;

export const ESTADO_INICIAL_TAREAS: EstadoTareas = { tareas: {}, versionesEliminadas: {} };

function fueEliminada(estado: EstadoTareas, tarea: Tarea): boolean {
  const versionEliminada = estado.versionesEliminadas[tarea.id];
  return versionEliminada !== undefined && versionEliminada >= tarea.version;
}

function aplicarTarea(estado: EstadoTareas, tarea: Tarea): EstadoTareas {
  const actual = estado.tareas[tarea.id];

  if (fueEliminada(estado, tarea) || (actual && actual.version >= tarea.version)) {
    return estado;
  }

  return { ...estado, tareas: { ...estado.tareas, [tarea.id]: tarea } };
}

export function reductorTareas(estado: EstadoTareas, accion: AccionTareas): EstadoTareas {
  switch (accion.tipo) {
    case "instantanea": {
      const tareas: Record<string, Tarea> = {};
      for (const tarea of accion.tareas) {
        if (!fueEliminada(estado, tarea)) {
          tareas[tarea.id] = tarea;
        }
      }
      return { ...estado, tareas };
    }

    case "tarea:creada":
    case "tarea:actualizada":
      return aplicarTarea(estado, accion.tarea);

    case "tarea:eliminada": {
      const restantes = { ...estado.tareas };
      delete restantes[accion.id];
      return {
        tareas: restantes,
        versionesEliminadas: { ...estado.versionesEliminadas, [accion.id]: accion.version },
      };
    }
  }
}

export function ordenarPorActualizacion(tareas: Tarea[]): Tarea[] {
  return [...tareas].sort((primera, segunda) => segunda.updatedAt - primera.updatedAt);
}
