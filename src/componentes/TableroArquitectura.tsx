import { useState } from "react";
import type { Arquitectura, Configuracion } from "../configuracion/configuracion";
import { nombreDeEstado, type DatosTarea, type EstadoTarea, type Tarea } from "../dominio/tarea";
import { useTablero } from "../estado/useTablero";
import { DialogoConfirmacion } from "./DialogoConfirmacion";
import { DialogoTarea, type EdicionTarea } from "./DialogoTarea";
import estilos from "./TableroArquitectura.module.css";
import { PanelActividad } from "./PanelActividad";
import { ResumenArquitectura } from "./ResumenArquitectura";
import { Tablero } from "./Tablero";

interface PropiedadesTableroArquitectura {
  arquitectura: Arquitectura;
  configuracion: Configuracion;
  usuario: string;
  alFallar: (mensaje: string) => void;
  alConfirmar: (mensaje: string) => void;
}

export function TableroArquitectura({
  arquitectura,
  configuracion,
  usuario,
  alFallar,
  alConfirmar,
}: PropiedadesTableroArquitectura) {
  const tablero = useTablero({ arquitectura, configuracion, usuario, alFallar });
  const [edicion, setEdicion] = useState<EdicionTarea | null>(null);
  const [tareaPorEliminar, setTareaPorEliminar] = useState<Tarea | null>(null);

  const guardar = async (datos: DatosTarea) => {
    if (edicion?.modo === "editar") {
      return tablero.editarTarea(edicion.tarea.id, datos);
    }
    const creada = await tablero.crearTarea(datos);
    if (creada) {
      alConfirmar(`«${datos.titulo}» se creó en ${nombreDeEstado(datos.estado)}`);
    }
    return creada;
  };

  const abrirCreacion = (estadoInicial: EstadoTarea = "pendiente") => setEdicion({ modo: "crear", estadoInicial });

  return (
    <>
      <ResumenArquitectura
        arquitectura={arquitectura}
        estadoConexion={tablero.estadoConexion}
        intervaloConsultaMs={configuracion.intervaloConsultaMs}
        ultimaOperacion={tablero.ultimaOperacion}
        totalTareas={tablero.tareas.length}
        alCrearTarea={() => abrirCreacion()}
      />

      <div className={estilos.espacio}>
        <Tablero
          tareas={tablero.tareas}
          cargando={!tablero.sincronizado}
          alAgregar={abrirCreacion}
          alEditar={(tarea) => setEdicion({ modo: "editar", tarea })}
          alEliminar={setTareaPorEliminar}
          alMover={(tarea, estado) => void tablero.moverTarea(tarea, estado)}
        />
        <PanelActividad actividades={tablero.actividades} alLimpiar={tablero.limpiarActividad} />
      </div>

      <DialogoTarea edicion={edicion} alCerrar={() => setEdicion(null)} alGuardar={guardar} />

      <DialogoConfirmacion
        titulo="Eliminar tarea"
        mensaje={tareaPorEliminar ? `¿Eliminar «${tareaPorEliminar.titulo}»? Esta acción no se puede deshacer.` : null}
        textoConfirmar="Eliminar"
        alCerrar={() => setTareaPorEliminar(null)}
        alConfirmar={() => (tareaPorEliminar ? tablero.eliminarTarea(tareaPorEliminar) : Promise.resolve(true))}
      />
    </>
  );
}
