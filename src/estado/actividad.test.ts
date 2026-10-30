import { describe, expect, it } from "vitest";
import type { Tarea } from "../dominio/tarea";
import { compararInstantaneas, describirEvento } from "./actividad";

const tareaBase: Tarea = {
  id: "tarea-1",
  titulo: "Informe",
  descripcion: "",
  estado: "pendiente",
  createdAt: 1,
  updatedAt: 1,
  version: 1,
  updatedBy: "nodo-1",
};

describe("compararInstantaneas", () => {
  it("detecta tareas creadas, movidas y eliminadas entre dos consultas", () => {
    const anteriores = { "tarea-1": tareaBase, "tarea-2": { ...tareaBase, id: "tarea-2", titulo: "Pruebas" } };
    const nuevas = [
      { ...tareaBase, version: 2, estado: "en_progreso" as const },
      { ...tareaBase, id: "tarea-3", titulo: "Demo" },
    ];

    const mensajes = compararInstantaneas(anteriores, nuevas).map((actividad) => `${actividad.tipo}: ${actividad.mensaje}`);

    expect(mensajes).toEqual([
      "actualizada: «Informe» pasó a En progreso",
      "creada: «Demo» fue creada",
      "eliminada: «Pruebas» fue eliminada",
    ]);
  });

  it("no registra nada si no hubo cambios", () => {
    expect(compararInstantaneas({ "tarea-1": tareaBase }, [tareaBase])).toEqual([]);
  });
});

describe("describirEvento", () => {
  it("no duplica la creación de una tarea ya conocida", () => {
    expect(describirEvento({ tipo: "tarea:creada", tarea: tareaBase }, { "tarea-1": tareaBase })).toEqual([]);
  });
});
