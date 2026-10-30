import { useState, type FormEvent } from "react";
import {
  COLUMNAS_TABLERO,
  LONGITUD_MAXIMA_DESCRIPCION,
  LONGITUD_MAXIMA_TITULO,
  esEstadoTarea,
  type DatosTarea,
  type EstadoTarea,
  type Tarea,
} from "../dominio/tarea";
import controles from "../estilos/controles.module.css";
import { Dialogo } from "./Dialogo";
import estilosDialogo from "./Dialogo.module.css";

export type EdicionTarea = { modo: "crear"; estadoInicial: EstadoTarea } | { modo: "editar"; tarea: Tarea };

interface PropiedadesDialogoTarea {
  edicion: EdicionTarea | null;
  alCerrar: () => void;
  alGuardar: (datos: DatosTarea) => Promise<boolean>;
}

function datosIniciales(edicion: EdicionTarea): DatosTarea {
  return edicion.modo === "editar"
    ? { titulo: edicion.tarea.titulo, descripcion: edicion.tarea.descripcion, estado: edicion.tarea.estado }
    : { titulo: "", descripcion: "", estado: edicion.estadoInicial };
}

function FormularioTarea({ edicion, alCerrar, alGuardar }: PropiedadesDialogoTarea & { edicion: EdicionTarea }) {
  const [datos, setDatos] = useState<DatosTarea>(() => datosIniciales(edicion));
  const [guardando, setGuardando] = useState(false);
  const tituloValido = datos.titulo.trim().length > 0;

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!tituloValido || guardando) {
      return;
    }
    setGuardando(true);
    const guardado = await alGuardar({ ...datos, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim() });
    setGuardando(false);
    if (guardado) {
      alCerrar();
    }
  };

  return (
    <form onSubmit={enviar} className={estilosDialogo.formulario}>
      <label className={controles.campo}>
        Título
        <input
          className={controles.entrada}
          value={datos.titulo}
          maxLength={LONGITUD_MAXIMA_TITULO}
          onChange={(evento) => setDatos({ ...datos, titulo: evento.target.value })}
          placeholder="¿Qué hay que hacer?"
          required
          autoFocus
        />
      </label>

      <label className={controles.campo}>
        Descripción
        <textarea
          className={controles.entrada}
          value={datos.descripcion}
          maxLength={LONGITUD_MAXIMA_DESCRIPCION}
          onChange={(evento) => setDatos({ ...datos, descripcion: evento.target.value })}
          placeholder="Detalles opcionales"
        />
      </label>

      <label className={controles.campo}>
        Estado
        <select
          className={controles.entrada}
          value={datos.estado}
          onChange={(evento) => {
            if (esEstadoTarea(evento.target.value)) {
              setDatos({ ...datos, estado: evento.target.value });
            }
          }}
        >
          {COLUMNAS_TABLERO.map((columna) => (
            <option key={columna.estado} value={columna.estado}>
              {columna.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className={estilosDialogo.acciones}>
        <button type="button" className={controles.boton} onClick={alCerrar}>
          Cancelar
        </button>
        <button type="submit" className={`${controles.boton} ${controles.primario}`} disabled={!tituloValido || guardando}>
          {guardando ? "Guardando…" : edicion.modo === "crear" ? "Crear tarea" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

export function DialogoTarea({ edicion, alCerrar, alGuardar }: PropiedadesDialogoTarea) {
  const titulo = edicion?.modo === "editar" ? "Editar tarea" : "Nueva tarea";
  const clave = edicion?.modo === "editar" ? edicion.tarea.id : edicion?.estadoInicial;

  return (
    <Dialogo abierto={edicion !== null} titulo={titulo} alCerrar={alCerrar}>
      {edicion && <FormularioTarea key={clave} edicion={edicion} alCerrar={alCerrar} alGuardar={alGuardar} />}
    </Dialogo>
  );
}
