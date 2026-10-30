import type { Arquitectura, Configuracion } from "../configuracion/configuracion";
import { interpretarMensaje, type EventoTarea } from "../dominio/eventoTarea";
import { esTarea, type DatosTarea, type Tarea } from "../dominio/tarea";
import { solicitar, type MetodoHttp } from "./clienteHttp";
import { abrirSocketReconectable, type EstadoConexion } from "./socketReconectable";

export interface ResultadoOperacion<T> {
  datos: T;
  metodo: MetodoHttp;
  duracionMs: number;
}

export interface Suscriptor {
  alRecibirEvento: (evento: EventoTarea) => void;
  alCambiarConexion: (estado: EstadoConexion) => void;
  alFallarSincronizacion: (error: Error) => void;
}

export interface ProveedorTareas {
  listar: () => Promise<ResultadoOperacion<Tarea[]>>;
  crear: (datos: DatosTarea, usuario: string) => Promise<ResultadoOperacion<Tarea>>;
  actualizar: (id: string, cambios: Partial<DatosTarea>, usuario: string) => Promise<ResultadoOperacion<Tarea>>;
  eliminar: (id: string) => Promise<ResultadoOperacion<null>>;
  suscribir: (suscriptor: Suscriptor) => () => void;
}

type Parametros = Pick<Configuracion, "intervaloConsultaMs" | "tiempoMaximoMs">;

function exigirTarea(valor: unknown): Tarea {
  if (!esTarea(valor)) {
    throw new Error("El servidor devolvió una tarea con un formato inesperado");
  }
  return valor;
}

export function crearProveedorTareas(arquitectura: Arquitectura, parametros: Parametros): ProveedorTareas {
  const urlTareas = `${arquitectura.urlApi}${arquitectura.rutaTareas}`;

  const ejecutar = async <T>(
    metodo: MetodoHttp,
    url: string,
    transformar: (cuerpo: unknown) => T,
    cuerpo?: unknown,
  ): Promise<ResultadoOperacion<T>> => {
    const respuesta = await solicitar<unknown>(url, {
      metodo,
      cuerpo,
      tiempoMaximoMs: parametros.tiempoMaximoMs,
      nombreServicio: arquitectura.nombre,
    });
    return { datos: transformar(respuesta.datos), metodo, duracionMs: respuesta.duracionMs };
  };

  const listar = () =>
    ejecutar("GET", urlTareas, (cuerpo) => (Array.isArray(cuerpo) ? cuerpo.filter(esTarea) : []));

  const crear = async (datos: DatosTarea, usuario: string) => {
    const creada = await ejecutar("POST", urlTareas, exigirTarea, {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      updatedBy: usuario,
    });

    if (datos.estado === "pendiente") {
      return creada;
    }

    const actualizada = await actualizar(creada.datos.id, { estado: datos.estado }, usuario);
    return { ...actualizada, duracionMs: creada.duracionMs + actualizada.duracionMs };
  };

  const actualizar = (id: string, cambios: Partial<DatosTarea>, usuario: string) =>
    ejecutar("PUT", `${urlTareas}/${encodeURIComponent(id)}`, exigirTarea, { ...cambios, updatedBy: usuario });

  const eliminar = (id: string) => ejecutar("DELETE", `${urlTareas}/${encodeURIComponent(id)}`, () => null);

  const sincronizarConInstantanea = async (suscriptor: Suscriptor) => {
    try {
      const resultado = await listar();
      suscriptor.alRecibirEvento({ tipo: "instantanea", tareas: resultado.datos });
      return true;
    } catch (error) {
      suscriptor.alFallarSincronizacion(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  };

  const suscribirPorWebSocket = (suscriptor: Suscriptor, urlWebSocket: string) =>
    abrirSocketReconectable({
      url: urlWebSocket,
      alCambiarEstado: (estado) => {
        suscriptor.alCambiarConexion(estado);
        if (estado === "conectado") {
          void sincronizarConInstantanea(suscriptor);
        }
      },
      alRecibirMensaje: (datos) => {
        const evento = interpretarMensaje(datos);
        if (evento) {
          suscriptor.alRecibirEvento(evento);
        }
      },
    });

  const suscribirPorConsulta = (suscriptor: Suscriptor) => {
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const consultar = async () => {
      const exito = await sincronizarConInstantanea(suscriptor);
      if (!activo) {
        return;
      }
      suscriptor.alCambiarConexion(exito ? "conectado" : "desconectado");
      temporizador = setTimeout(() => void consultar(), parametros.intervaloConsultaMs);
    };

    suscriptor.alCambiarConexion("conectando");
    void consultar();

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  };

  const suscribir = (suscriptor: Suscriptor) =>
    arquitectura.tiempoReal === "websocket" && arquitectura.urlWebSocket
      ? suscribirPorWebSocket(suscriptor, arquitectura.urlWebSocket)
      : suscribirPorConsulta(suscriptor);

  return { listar, crear, actualizar, eliminar, suscribir };
}

export async function consultarSalud(
  arquitectura: Arquitectura,
  tiempoMaximoMs: number,
): Promise<number> {
  const respuesta = await solicitar<unknown>(`${arquitectura.urlApi}${arquitectura.rutaSalud}`, {
    metodo: "GET",
    tiempoMaximoMs,
    nombreServicio: arquitectura.nombre,
  });
  return respuesta.duracionMs;
}
