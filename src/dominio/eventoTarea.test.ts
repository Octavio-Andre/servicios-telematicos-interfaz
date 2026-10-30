import { describe, expect, it } from "vitest";
import { interpretarMensaje } from "./eventoTarea";

const tarea = {
  id: "a",
  titulo: "Tarea",
  descripcion: "",
  estado: "pendiente",
  createdAt: 1,
  updatedAt: 1,
  version: 1,
  updatedBy: "x",
};

describe("interpretarMensaje", () => {
  it("convierte el snapshot de Cliente-Servidor en una instantánea", () => {
    expect(interpretarMensaje({ tipo: "snapshot", tareas: [tarea, { invalida: true }] })).toEqual({
      tipo: "instantanea",
      tareas: [tarea],
    });
  });

  it("acepta los eventos del servicio de notificaciones", () => {
    expect(interpretarMensaje({ tipo: "tarea:actualizada", tarea, origen: "servicio-tareas" })).toEqual({
      tipo: "tarea:actualizada",
      tarea,
    });
  });

  it("descarta mensajes desconocidos o incompletos", () => {
    expect(interpretarMensaje({ tipo: "conexion", mensaje: "hola" })).toBeNull();
    expect(interpretarMensaje({ tipo: "tarea:eliminada", id: "a" })).toBeNull();
    expect(interpretarMensaje("texto")).toBeNull();
  });
});
