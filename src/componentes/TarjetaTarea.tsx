import { useDraggable } from "@dnd-kit/core";
import { estadoVecino, nombreDeEstado, type EstadoTarea, type Tarea } from "../dominio/tarea";
import { formatearTiempoRelativo, inicialDe } from "../estado/formatos";
import controles from "../estilos/controles.module.css";
import { Icono } from "../iconos/Icono";
import estilos from "./TarjetaTarea.module.css";

interface PropiedadesTarjeta {
  tarea: Tarea;
  ahora: number;
  alEditar: (tarea: Tarea) => void;
  alEliminar: (tarea: Tarea) => void;
  alMover: (tarea: Tarea, estado: EstadoTarea) => void;
}

interface PropiedadesContenido {
  tarea: Tarea;
  ahora: number;
}

export function ContenidoTarjeta({ tarea, ahora }: PropiedadesContenido) {
  return (
    <>
      <h3 className={estilos.titulo}>{tarea.titulo}</h3>
      {tarea.descripcion && <p className={estilos.descripcion}>{tarea.descripcion}</p>}
      <footer className={estilos.pie}>
        <span className={estilos.autor} title={`Última modificación por ${tarea.updatedBy}`}>
          <span className={estilos.avatar} aria-hidden="true">
            {inicialDe(tarea.updatedBy)}
          </span>
          <span className={estilos.nombreAutor}>{tarea.updatedBy}</span>
        </span>
        <span className={estilos.meta}>
          <span className={estilos.version}>v{tarea.version}</span>
          <time dateTime={new Date(tarea.updatedAt).toISOString()}>{formatearTiempoRelativo(tarea.updatedAt, ahora)}</time>
        </span>
      </footer>
    </>
  );
}

export function TarjetaTarea({ tarea, ahora, alEditar, alEliminar, alMover }: PropiedadesTarjeta) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: tarea.id, data: { tarea } });
  const estadoAnterior = estadoVecino(tarea.estado, -1);
  const estadoSiguiente = estadoVecino(tarea.estado, 1);

  return (
    <article ref={setNodeRef} className={`${estilos.tarjeta} ${isDragging ? estilos.arrastrando : ""}`}>
      <div
        className={estilos.zonaArrastre}
        {...listeners}
        {...attributes}
        aria-roledescription="tarea arrastrable"
        aria-label={`${tarea.titulo}. ${nombreDeEstado(tarea.estado)}. Arrastra para cambiar de columna`}
        onDoubleClick={() => alEditar(tarea)}
      >
        <ContenidoTarjeta tarea={tarea} ahora={ahora} />
      </div>

      <div className={estilos.acciones}>
        <button
          type="button"
          className={controles.icono}
          onClick={() => estadoAnterior && alMover(tarea, estadoAnterior)}
          disabled={!estadoAnterior}
          aria-label={estadoAnterior ? `Mover a ${nombreDeEstado(estadoAnterior)}` : "Sin columna anterior"}
          title={estadoAnterior ? `Mover a ${nombreDeEstado(estadoAnterior)}` : undefined}
        >
          <Icono nombre="izquierda" />
        </button>
        <button
          type="button"
          className={controles.icono}
          onClick={() => estadoSiguiente && alMover(tarea, estadoSiguiente)}
          disabled={!estadoSiguiente}
          aria-label={estadoSiguiente ? `Mover a ${nombreDeEstado(estadoSiguiente)}` : "Sin columna siguiente"}
          title={estadoSiguiente ? `Mover a ${nombreDeEstado(estadoSiguiente)}` : undefined}
        >
          <Icono nombre="derecha" />
        </button>
        <span className={estilos.separador} />
        <button type="button" className={controles.icono} onClick={() => alEditar(tarea)} aria-label="Editar tarea" title="Editar">
          <Icono nombre="editar" />
        </button>
        <button
          type="button"
          className={`${controles.icono} ${estilos.eliminar}`}
          onClick={() => alEliminar(tarea)}
          aria-label="Eliminar tarea"
          title="Eliminar"
        >
          <Icono nombre="eliminar" />
        </button>
      </div>
    </article>
  );
}
