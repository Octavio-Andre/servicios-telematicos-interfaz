import { useDroppable } from "@dnd-kit/core";
import type { ColumnaEstado, EstadoTarea, Tarea } from "../dominio/tarea";
import controles from "../estilos/controles.module.css";
import { Icono } from "../iconos/Icono";
import estilos from "./Columna.module.css";
import { TarjetaTarea } from "./TarjetaTarea";

interface PropiedadesColumna {
  columna: ColumnaEstado;
  tareas: Tarea[];
  ahora: number;
  alAgregar: (estado: EstadoTarea) => void;
  alEditar: (tarea: Tarea) => void;
  alEliminar: (tarea: Tarea) => void;
  alMover: (tarea: Tarea, estado: EstadoTarea) => void;
}

export function Columna({ columna, tareas, ahora, alAgregar, alEditar, alEliminar, alMover }: PropiedadesColumna) {
  const { setNodeRef, isOver } = useDroppable({ id: columna.estado });

  return (
    <section
      ref={setNodeRef}
      className={`${estilos.columna} ${isOver ? estilos.destino : ""}`}
      data-estado={columna.estado}
      aria-labelledby={`columna-${columna.estado}`}
    >
      <header className={estilos.cabecera}>
        <h2 id={`columna-${columna.estado}`} className={estilos.titulo}>
          <span className={estilos.indicador} aria-hidden="true" />
          {columna.nombre}
          <span className={estilos.contador}>{tareas.length}</span>
        </h2>
        <button
          type="button"
          className={controles.icono}
          onClick={() => alAgregar(columna.estado)}
          aria-label={`Agregar tarea en ${columna.nombre}`}
          title="Agregar tarea"
        >
          <Icono nombre="agregar" />
        </button>
      </header>

      <div className={estilos.lista}>
        {tareas.map((tarea) => (
          <TarjetaTarea
            key={tarea.id}
            tarea={tarea}
            ahora={ahora}
            alEditar={alEditar}
            alEliminar={alEliminar}
            alMover={alMover}
          />
        ))}

        {tareas.length === 0 && (
          <button type="button" className={estilos.vacia} onClick={() => alAgregar(columna.estado)}>
            <Icono nombre="agregar" tamano="1rem" />
            Agregar una tarea
          </button>
        )}
      </div>
    </section>
  );
}
