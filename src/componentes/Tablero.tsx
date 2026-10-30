import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { COLUMNAS_TABLERO, esEstadoTarea, type EstadoTarea, type Tarea } from "../dominio/tarea";
import { ordenarPorActualizacion } from "../estado/reductorTareas";
import { useReloj } from "../estado/useReloj";
import { Columna } from "./Columna";
import estilos from "./Tablero.module.css";
import { ContenidoTarjeta } from "./TarjetaTarea";
import estilosTarjeta from "./TarjetaTarea.module.css";

interface PropiedadesTablero {
  tareas: Tarea[];
  cargando: boolean;
  alAgregar: (estado: EstadoTarea) => void;
  alEditar: (tarea: Tarea) => void;
  alEliminar: (tarea: Tarea) => void;
  alMover: (tarea: Tarea, estado: EstadoTarea) => void;
}

export function Tablero({ tareas, cargando, alAgregar, alEditar, alEliminar, alMover }: PropiedadesTablero) {
  const ahora = useReloj();
  const [tareaArrastrada, setTareaArrastrada] = useState<Tarea | null>(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const tareasPorEstado = useMemo(() => {
    const agrupadas = Object.fromEntries(COLUMNAS_TABLERO.map((columna) => [columna.estado, [] as Tarea[]])) as Record<
      EstadoTarea,
      Tarea[]
    >;
    for (const tarea of ordenarPorActualizacion(tareas)) {
      agrupadas[tarea.estado].push(tarea);
    }
    return agrupadas;
  }, [tareas]);

  const iniciarArrastre = (evento: DragStartEvent) => {
    setTareaArrastrada((evento.active.data.current?.tarea as Tarea | undefined) ?? null);
  };

  const terminarArrastre = (evento: DragEndEvent) => {
    setTareaArrastrada(null);
    const tarea = evento.active.data.current?.tarea as Tarea | undefined;
    const destino = evento.over?.id;
    if (tarea && esEstadoTarea(destino)) {
      alMover(tarea, destino);
    }
  };

  return (
    <DndContext
      sensors={sensores}
      onDragStart={iniciarArrastre}
      onDragEnd={terminarArrastre}
      onDragCancel={() => setTareaArrastrada(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable: "Presiona espacio para tomar la tarea, usa las flechas para moverla y espacio para soltarla.",
        },
      }}
    >
      <div className={estilos.tablero} aria-busy={cargando}>
        {COLUMNAS_TABLERO.map((columna) => (
          <Columna
            key={columna.estado}
            columna={columna}
            tareas={tareasPorEstado[columna.estado]}
            ahora={ahora}
            alAgregar={alAgregar}
            alEditar={alEditar}
            alEliminar={alEliminar}
            alMover={alMover}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {tareaArrastrada && (
          <article className={`${estilosTarjeta.tarjeta} ${estilosTarjeta.superpuesta}`}>
            <div className={estilosTarjeta.zonaArrastre}>
              <ContenidoTarjeta tarea={tareaArrastrada} ahora={ahora} />
            </div>
          </article>
        )}
      </DragOverlay>
    </DndContext>
  );
}
