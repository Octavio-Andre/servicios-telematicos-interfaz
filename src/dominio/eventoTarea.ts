import { esTarea, type Tarea } from "./tarea";

export interface EliminacionTarea {
  id: string;
  version: number;
  updatedAt: number;
  updatedBy: string;
}

export type EventoTarea =
  | { tipo: "instantanea"; tareas: Tarea[] }
  | { tipo: "tarea:creada"; tarea: Tarea }
  | { tipo: "tarea:actualizada"; tarea: Tarea }
  | ({ tipo: "tarea:eliminada" } & EliminacionTarea);

function esEliminacion(valor: Record<string, unknown>): boolean {
  return (
    typeof valor.id === "string" &&
    typeof valor.version === "number" &&
    typeof valor.updatedAt === "number" &&
    typeof valor.updatedBy === "string"
  );
}

export function interpretarMensaje(datos: unknown): EventoTarea | null {
  if (typeof datos !== "object" || datos === null) {
    return null;
  }

  const mensaje = datos as Record<string, unknown>;

  if (mensaje.tipo === "snapshot" && Array.isArray(mensaje.tareas)) {
    return { tipo: "instantanea", tareas: mensaje.tareas.filter(esTarea) };
  }

  if ((mensaje.tipo === "tarea:creada" || mensaje.tipo === "tarea:actualizada") && esTarea(mensaje.tarea)) {
    return { tipo: mensaje.tipo, tarea: mensaje.tarea };
  }

  if (mensaje.tipo === "tarea:eliminada" && esEliminacion(mensaje)) {
    return {
      tipo: "tarea:eliminada",
      id: mensaje.id as string,
      version: mensaje.version as number,
      updatedAt: mensaje.updatedAt as number,
      updatedBy: mensaje.updatedBy as string,
    };
  }

  return null;
}
