export type ModoTiempoReal = "websocket" | "consulta";

export interface Arquitectura {
  id: string;
  nombre: string;
  descripcion: string;
  urlApi: string;
  rutaTareas: string;
  rutaSalud: string;
  tiempoReal: ModoTiempoReal;
  urlWebSocket?: string;
}

export interface Configuracion {
  arquitecturas: Arquitectura[];
  intervaloConsultaMs: number;
  intervaloSaludMs: number;
  tiempoMaximoMs: number;
}

export interface DireccionesPersonalizadas {
  [idArquitectura: string]: { urlApi: string; urlWebSocket?: string };
}

const CLAVE_DIRECCIONES = "tablero.direcciones";

const CONFIGURACION_MINIMA: Omit<Configuracion, "arquitecturas"> = {
  intervaloConsultaMs: 1500,
  intervaloSaludMs: 5000,
  tiempoMaximoMs: 5000,
};

export async function cargarConfiguracionBase(): Promise<Configuracion> {
  const respuesta = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: "no-store" });

  if (!respuesta.ok) {
    throw new Error("No se encontró el archivo config.json");
  }

  const datos = (await respuesta.json()) as Partial<Configuracion>;

  if (!Array.isArray(datos.arquitecturas) || datos.arquitecturas.length === 0) {
    throw new Error("config.json no define arquitecturas");
  }

  return { ...CONFIGURACION_MINIMA, ...datos, arquitecturas: datos.arquitecturas };
}

export function leerDireccionesPersonalizadas(): DireccionesPersonalizadas {
  try {
    const guardado = localStorage.getItem(CLAVE_DIRECCIONES);
    return guardado ? (JSON.parse(guardado) as DireccionesPersonalizadas) : {};
  } catch {
    return {};
  }
}

export function guardarDireccionesPersonalizadas(direcciones: DireccionesPersonalizadas): void {
  try {
    localStorage.setItem(CLAVE_DIRECCIONES, JSON.stringify(direcciones));
  } catch {
    return;
  }
}

export function borrarDireccionesPersonalizadas(): void {
  try {
    localStorage.removeItem(CLAVE_DIRECCIONES);
  } catch {
    return;
  }
}

export function aplicarDirecciones(
  arquitecturas: Arquitectura[],
  direcciones: DireccionesPersonalizadas,
): Arquitectura[] {
  return arquitecturas.map((arquitectura) => {
    const personalizada = direcciones[arquitectura.id];

    if (!personalizada) {
      return arquitectura;
    }

    return {
      ...arquitectura,
      urlApi: personalizada.urlApi || arquitectura.urlApi,
      ...(arquitectura.tiempoReal === "websocket" && personalizada.urlWebSocket
        ? { urlWebSocket: personalizada.urlWebSocket }
        : {}),
    };
  });
}
