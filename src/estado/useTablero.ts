import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { Arquitectura, Configuracion } from "../configuracion/configuracion";
import type { EventoTarea } from "../dominio/eventoTarea";
import type { DatosTarea, EstadoTarea, Tarea } from "../dominio/tarea";
import type { MetodoHttp } from "../proveedores/clienteHttp";
import { crearProveedorTareas, type ResultadoOperacion } from "../proveedores/proveedorTareas";
import type { EstadoConexion } from "../proveedores/socketReconectable";
import { crearActividad, describirEvento, type Actividad } from "./actividad";
import { ESTADO_INICIAL_TAREAS, reductorTareas } from "./reductorTareas";

const MAXIMO_ACTIVIDADES = 60;

export interface UltimaOperacion {
  metodo: MetodoHttp;
  duracionMs: number;
}

interface OpcionesTablero {
  arquitectura: Arquitectura;
  configuracion: Configuracion;
  usuario: string;
  alFallar: (mensaje: string) => void;
}

function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado";
}

export function useTablero({ arquitectura, configuracion, usuario, alFallar }: OpcionesTablero) {
  const [estado, despachar] = useReducer(reductorTareas, ESTADO_INICIAL_TAREAS);
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>("conectando");
  const [actividades, setActividades] = useState<Actividad[]>(() => [
    crearActividad("sistema", `Conectando con ${arquitectura.nombre}…`),
  ]);
  const [ultimaOperacion, setUltimaOperacion] = useState<UltimaOperacion | null>(null);
  const [sincronizado, setSincronizado] = useState(false);

  const tareasRef = useRef(estado.tareas);
  const sincronizadoRef = useRef(false);
  const ultimoErrorRef = useRef<string | null>(null);
  const alFallarRef = useRef(alFallar);

  useEffect(() => {
    tareasRef.current = estado.tareas;
  }, [estado.tareas]);

  useEffect(() => {
    alFallarRef.current = alFallar;
  }, [alFallar]);

  const proveedor = useMemo(
    () =>
      crearProveedorTareas(arquitectura, {
        intervaloConsultaMs: configuracion.intervaloConsultaMs,
        tiempoMaximoMs: configuracion.tiempoMaximoMs,
      }),
    [arquitectura, configuracion.intervaloConsultaMs, configuracion.tiempoMaximoMs],
  );

  const registrar = useCallback((nuevas: Actividad[]) => {
    if (nuevas.length === 0) {
      return;
    }
    setActividades((anteriores) => [...nuevas.reverse(), ...anteriores].slice(0, MAXIMO_ACTIVIDADES));
  }, []);

  const procesarEvento = useCallback(
    (evento: EventoTarea) => {
      if (evento.tipo === "instantanea" && !sincronizadoRef.current) {
        sincronizadoRef.current = true;
        setSincronizado(true);
        registrar([crearActividad("sistema", `Tablero sincronizado con ${evento.tareas.length} tarea(s)`)]);
      } else {
        registrar(describirEvento(evento, tareasRef.current));
      }

      despachar(evento);
      tareasRef.current = reductorTareas({ tareas: tareasRef.current, versionesEliminadas: {} }, evento).tareas;
    },
    [registrar],
  );

  useEffect(() => {
    return proveedor.suscribir({
      alRecibirEvento: (evento) => {
        ultimoErrorRef.current = null;
        procesarEvento(evento);
      },
      alCambiarConexion: setEstadoConexion,
      alFallarSincronizacion: (error) => {
        if (ultimoErrorRef.current === error.message) {
          return;
        }
        ultimoErrorRef.current = error.message;
        registrar([crearActividad("error", error.message)]);
      },
    });
  }, [proveedor, procesarEvento, registrar]);

  const ejecutar = useCallback(
    async <T,>(operacion: () => Promise<ResultadoOperacion<T>>): Promise<ResultadoOperacion<T> | null> => {
      try {
        const resultado = await operacion();
        setUltimaOperacion({ metodo: resultado.metodo, duracionMs: resultado.duracionMs });
        return resultado;
      } catch (error) {
        alFallarRef.current(mensajeDeError(error));
        return null;
      }
    },
    [],
  );

  const crearTarea = useCallback(
    async (datos: DatosTarea) => {
      const resultado = await ejecutar(() => proveedor.crear(datos, usuario));
      if (resultado) {
        procesarEvento({ tipo: "tarea:creada", tarea: resultado.datos });
      }
      return resultado !== null;
    },
    [ejecutar, proveedor, usuario, procesarEvento],
  );

  const editarTarea = useCallback(
    async (id: string, cambios: Partial<DatosTarea>) => {
      const resultado = await ejecutar(() => proveedor.actualizar(id, cambios, usuario));
      if (resultado) {
        procesarEvento({ tipo: "tarea:actualizada", tarea: resultado.datos });
      }
      return resultado !== null;
    },
    [ejecutar, proveedor, usuario, procesarEvento],
  );

  const moverTarea = useCallback(
    (tarea: Tarea, estadoDestino: EstadoTarea) => {
      if (tarea.estado === estadoDestino) {
        return Promise.resolve(true);
      }
      return editarTarea(tarea.id, { estado: estadoDestino });
    },
    [editarTarea],
  );

  const eliminarTarea = useCallback(
    async (tarea: Tarea) => {
      const resultado = await ejecutar(() => proveedor.eliminar(tarea.id));
      if (resultado) {
        procesarEvento({
          tipo: "tarea:eliminada",
          id: tarea.id,
          version: tarea.version + 1,
          updatedAt: Date.now(),
          updatedBy: usuario,
        });
      }
      return resultado !== null;
    },
    [ejecutar, proveedor, usuario, procesarEvento],
  );

  const tareas = useMemo(() => Object.values(estado.tareas), [estado.tareas]);

  return {
    tareas,
    estadoConexion,
    sincronizado,
    actividades,
    ultimaOperacion,
    crearTarea,
    editarTarea,
    moverTarea,
    eliminarTarea,
    limpiarActividad: () => setActividades([]),
  };
}
