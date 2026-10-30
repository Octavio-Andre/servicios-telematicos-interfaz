import { describe, expect, it } from "vitest";
import { estadoVecino } from "./tarea";

describe("estadoVecino", () => {
  it("devuelve la columna adyacente o null en los extremos", () => {
    expect(estadoVecino("pendiente", 1)).toBe("en_progreso");
    expect(estadoVecino("en_progreso", -1)).toBe("pendiente");
    expect(estadoVecino("pendiente", -1)).toBeNull();
    expect(estadoVecino("finalizada", 1)).toBeNull();
  });
});
