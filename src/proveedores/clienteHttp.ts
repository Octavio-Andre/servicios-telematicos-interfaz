export class ErrorDeConexion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeConexion";
  }
}

export class ErrorDeRespuesta extends Error {
  readonly codigoHttp: number;

  constructor(mensaje: string, codigoHttp: number) {
    super(mensaje);
    this.name = "ErrorDeRespuesta";
    this.codigoHttp = codigoHttp;
  }
}

export interface RespuestaMedida<T> {
  datos: T;
  codigoHttp: number;
  duracionMs: number;
}

export type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE";

interface OpcionesSolicitud {
  metodo: MetodoHttp;
  cuerpo?: unknown;
  tiempoMaximoMs: number;
  nombreServicio: string;
}

async function leerCuerpo(respuesta: Response): Promise<unknown> {
  if (respuesta.status === 204) {
    return null;
  }

  const texto = await respuesta.text();

  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return texto;
  }
}

function mensajeDeError(cuerpo: unknown, codigoHttp: number): string {
  if (typeof cuerpo === "object" && cuerpo !== null && "mensaje" in cuerpo && typeof cuerpo.mensaje === "string") {
    return cuerpo.mensaje;
  }

  return `El servidor respondió con el código ${codigoHttp}`;
}

export async function solicitar<T>(url: string, opciones: OpcionesSolicitud): Promise<RespuestaMedida<T>> {
  const inicio = performance.now();
  const tieneCuerpo = opciones.cuerpo !== undefined;
  let respuesta: Response;

  try {
    respuesta = await fetch(url, {
      method: opciones.metodo,
      headers: tieneCuerpo ? { "Content-Type": "application/json" } : {},
      body: tieneCuerpo ? JSON.stringify(opciones.cuerpo) : null,
      signal: AbortSignal.timeout(opciones.tiempoMaximoMs),
    });
  } catch (error) {
    const expirado = error instanceof DOMException && error.name === "TimeoutError";
    throw new ErrorDeConexion(
      expirado
        ? `${opciones.nombreServicio} no respondió a tiempo`
        : `No se pudo conectar con ${opciones.nombreServicio}. Verifica que esté iniciado.`,
    );
  }

  const cuerpo = await leerCuerpo(respuesta);
  const duracionMs = performance.now() - inicio;

  if (!respuesta.ok) {
    throw new ErrorDeRespuesta(mensajeDeError(cuerpo, respuesta.status), respuesta.status);
  }

  return { datos: cuerpo as T, codigoHttp: respuesta.status, duracionMs };
}
