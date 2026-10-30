import type { Arquitectura } from "../configuracion/configuracion";
import { formatearDuracion } from "../estado/formatos";
import type { UltimaOperacion } from "../estado/useTablero";
import type { EstadoConexion } from "../proveedores/socketReconectable";
import controles from "../estilos/controles.module.css";
import { Icono } from "../iconos/Icono";
import estilos from "./ResumenArquitectura.module.css";

interface PropiedadesResumen {
  arquitectura: Arquitectura;
  estadoConexion: EstadoConexion;
  intervaloConsultaMs: number;
  ultimaOperacion: UltimaOperacion | null;
  totalTareas: number;
  alCrearTarea: () => void;
}

function describirConexion(arquitectura: Arquitectura, estado: EstadoConexion, intervaloMs: number): string {
  if (estado === "conectando") {
    return "Conectando…";
  }
  if (estado === "desconectado") {
    return arquitectura.tiempoReal === "websocket" ? "Sin conexión · reintentando" : "Sin respuesta del nodo";
  }
  if (arquitectura.tiempoReal === "websocket") {
    return "En vivo · WebSocket";
  }
  return `En vivo · consulta cada ${(intervaloMs / 1000).toLocaleString("es")} s`;
}

export function ResumenArquitectura({
  arquitectura,
  estadoConexion,
  intervaloConsultaMs,
  ultimaOperacion,
  totalTareas,
  alCrearTarea,
}: PropiedadesResumen) {
  return (
    <section className={estilos.resumen} aria-label="Resumen de la arquitectura">
      <div className={estilos.texto}>
        <h2 className={estilos.nombre}>{arquitectura.nombre}</h2>
        <p className={estilos.descripcion}>{arquitectura.descripcion}</p>
      </div>

      <ul className={estilos.datos}>
        <li className={estilos.dato} data-conexion={estadoConexion}>
          <span className={estilos.punto} aria-hidden="true" />
          {describirConexion(arquitectura, estadoConexion, intervaloConsultaMs)}
        </li>
        {ultimaOperacion && (
          <li className={estilos.dato} title="Duración de la última operación HTTP realizada desde esta interfaz">
            {`Última operación ${ultimaOperacion.metodo} · ${formatearDuracion(ultimaOperacion.duracionMs)}`}
          </li>
        )}
        <li className={estilos.dato}>{totalTareas === 1 ? "1 tarea" : `${totalTareas} tareas`}</li>
      </ul>

      <button type="button" className={`${controles.boton} ${controles.primario} ${estilos.crear}`} onClick={alCrearTarea}>
        <Icono nombre="agregar" />
        Crear tarea
      </button>
    </section>
  );
}
