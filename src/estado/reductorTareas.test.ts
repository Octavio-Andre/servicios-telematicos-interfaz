import { describe, expect, it } from "vitest";
import type { Tarea } from "../dominio/tarea";
import { ESTADO_INICIAL_TAREAS, ordenarPorActualizacion, reductorTareas } from "./reductorTareas";

function crearTareaDePrueba(cambios: Partial<Tarea> = {}): Tarea {
  return {
    id: "tarea-1",
    titulo: "Preparar demo",
    descripcion: "",
    estado: "pendiente",
    createdAt: 1,
    updatedAt: 1,
    version: 1,
    updatedBy: "usuario-1",
    ...cambios,
  };
}

describe("reductorTareas", () => {
  it("agrega una tarea creada", () => {
    const estado = reductorTareas(ESTADO_INICIAL_TAREAS, { tipo: "tarea:creada", tarea: crearTareaDePrueba() });
    expect(Object.keys(estado.tareas)).toEqual(["tarea-1"]);
  });

  it("ignora una actualización con versión anterior a la actual", () => {
    const conVersionDos = reductorTareas(ESTADO_INICIAL_TAREAS, {
      tipo: "tarea:actualizada",
      tarea: crearTareaDePrueba({ version: 2, estado: "finalizada" }),
    });
    const resultado = reductorTareas(conVersionDos, { tipo: "tarea:actualizada", tarea: crearTareaDePrueba({ version: 1 }) });
    expect(resultado.tareas["tarea-1"]?.estado).toBe("finalizada");
  });

  it("es idempotente ante eventos duplicados", () => {
    const evento = { tipo: "tarea:actualizada" as const, tarea: crearTareaDePrueba({ version: 3 }) };
    const unaVez = reductorTareas(ESTADO_INICIAL_TAREAS, evento);
    expect(reductorTareas(unaVez, evento)).toBe(unaVez);
  });

  it("no revive una tarea eliminada cuando llega un evento atrasado", () => {
    const creada = reductorTareas(ESTADO_INICIAL_TAREAS, { tipo: "tarea:creada", tarea: crearTareaDePrueba() });
    const eliminada = reductorTareas(creada, {
      tipo: "tarea:eliminada",
      id: "tarea-1",
      version: 2,
      updatedAt: 2,
      updatedBy: "usuario-2",
    });
    const atrasada = reductorTareas(eliminada, { tipo: "tarea:actualizada", tarea: crearTareaDePrueba({ version: 2 }) });
    expect(atrasada.tareas).toEqual({});
  });

  it("reemplaza el contenido con una instantánea respetando las eliminaciones", () => {
    const eliminada = reductorTareas(ESTADO_INICIAL_TAREAS, {
      tipo: "tarea:eliminada",
      id: "tarea-1",
      version: 2,
      updatedAt: 2,
      updatedBy: "usuario-2",
    });
    const resultado = reductorTareas(eliminada, {
      tipo: "instantanea",
      tareas: [crearTareaDePrueba(), crearTareaDePrueba({ id: "tarea-2" })],
    });
    expect(Object.keys(resultado.tareas)).toEqual(["tarea-2"]);
  });
});

describe("ordenarPorActualizacion", () => {
  it("muestra primero las tareas modificadas más recientemente", () => {
    const ordenadas = ordenarPorActualizacion([
      crearTareaDePrueba({ id: "antigua", updatedAt: 1 }),
      crearTareaDePrueba({ id: "reciente", updatedAt: 5 }),
    ]);
    expect(ordenadas.map((tarea) => tarea.id)).toEqual(["reciente", "antigua"]);
  });
});
