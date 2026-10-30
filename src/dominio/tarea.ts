export type EstadoTarea = "pendiente" | "en_progreso" | "finalizada";

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  createdAt: number;
  updatedAt: number;
  version: number;
  updatedBy: string;
}

export interface DatosTarea {
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
}

export interface ColumnaEstado {
  estado: EstadoTarea;
  nombre: string;
}

export const COLUMNAS_TABLERO: readonly ColumnaEstado[] = [
  { estado: "pendiente", nombre: "Pendiente" },
  { estado: "en_progreso", nombre: "En progreso" },
  { estado: "finalizada", nombre: "Finalizada" },
];

export const LONGITUD_MAXIMA_TITULO = 120;
export const LONGITUD_MAXIMA_DESCRIPCION = 1000;

export function esEstadoTarea(valor: unknown): valor is EstadoTarea {
  return COLUMNAS_TABLERO.some((columna) => columna.estado === valor);
}

export function esTarea(valor: unknown): valor is Tarea {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const candidata = valor as Record<string, unknown>;

  return (
    typeof candidata.id === "string" &&
    typeof candidata.titulo === "string" &&
    typeof candidata.descripcion === "string" &&
    esEstadoTarea(candidata.estado) &&
    typeof candidata.createdAt === "number" &&
    typeof candidata.updatedAt === "number" &&
    typeof candidata.version === "number" &&
    typeof candidata.updatedBy === "string"
  );
}

export function nombreDeEstado(estado: EstadoTarea): string {
  return COLUMNAS_TABLERO.find((columna) => columna.estado === estado)?.nombre ?? estado;
}

export function estadoVecino(estado: EstadoTarea, desplazamiento: -1 | 1): EstadoTarea | null {
  const posicion = COLUMNAS_TABLERO.findIndex((columna) => columna.estado === estado);
  return COLUMNAS_TABLERO[posicion + desplazamiento]?.estado ?? null;
}
