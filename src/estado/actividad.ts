import type { EventoTarea } from "../dominio/eventoTarea";
import { nombreDeEstado, type Tarea } from "../dominio/tarea";

export type TipoActividad = "creada" | "actualizada" | "eliminada" | "sistema" | "error";

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  mensaje: string;
  autor?: string;
  instante: number;
}

let contadorActividades = 0;

export function crearActividad(tipo: TipoActividad, mensaje: string, autor?: string): Actividad {
  contadorActividades += 1;
  return {
    id: `${Date.now()}-${contadorActividades}`,
    tipo,
    mensaje,
    instante: Date.now(),
    ...(autor ? { autor } : {}),
  };
}

function describirCambio(anterior: Tarea | undefined, nueva: Tarea): string {
  if (anterior && anterior.estado !== nueva.estado) {
    return `«${nueva.titulo}» pasó a ${nombreDeEstado(nueva.estado)}`;
  }
  return `«${nueva.titulo}» fue editada (v${nueva.version})`;
}

export function describirEvento(evento: EventoTarea, tareasActuales: Record<string, Tarea>): Actividad[] {
  switch (evento.tipo) {
    case "tarea:creada":
      if (tareasActuales[evento.tarea.id]) {
        return [];
      }
      return [crearActividad("creada", `«${evento.tarea.titulo}» fue creada`, evento.tarea.updatedBy)];

    case "tarea:actualizada": {
      const anterior = tareasActuales[evento.tarea.id];
      if (anterior && anterior.version >= evento.tarea.version) {
        return [];
      }
      return [crearActividad("actualizada", describirCambio(anterior, evento.tarea), evento.tarea.updatedBy)];
    }

    case "tarea:eliminada": {
      const eliminada = tareasActuales[evento.id];
      if (!eliminada) {
        return [];
      }
      return [crearActividad("eliminada", `«${eliminada.titulo}» fue eliminada`, evento.updatedBy)];
    }

    case "instantanea":
      return compararInstantaneas(tareasActuales, evento.tareas);
  }
}

export function compararInstantaneas(anteriores: Record<string, Tarea>, nuevas: Tarea[]): Actividad[] {
  const actividades: Actividad[] = [];
  const idsNuevos = new Set<string>();

  for (const tarea of nuevas) {
    idsNuevos.add(tarea.id);
    const anterior = anteriores[tarea.id];

    if (!anterior) {
      actividades.push(crearActividad("creada", `«${tarea.titulo}» fue creada`, tarea.updatedBy));
    } else if (tarea.version > anterior.version) {
      actividades.push(crearActividad("actualizada", describirCambio(anterior, tarea), tarea.updatedBy));
    }
  }

  for (const anterior of Object.values(anteriores)) {
    if (!idsNuevos.has(anterior.id)) {
      actividades.push(crearActividad("eliminada", `«${anterior.titulo}» fue eliminada`));
    }
  }

  return actividades;
}
