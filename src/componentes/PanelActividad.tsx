import type { Actividad } from "../estado/actividad";
import { formatearHora } from "../estado/formatos";
import estilos from "./PanelActividad.module.css";

interface PropiedadesPanel {
  actividades: Actividad[];
  alLimpiar: () => void;
}

export function PanelActividad({ actividades, alLimpiar }: PropiedadesPanel) {
  return (
    <aside className={estilos.panel} aria-labelledby="titulo-actividad">
      <header className={estilos.cabecera}>
        <h2 id="titulo-actividad" className={estilos.titulo}>
          Actividad
        </h2>
        {actividades.length > 0 && (
          <button type="button" className={estilos.limpiar} onClick={alLimpiar}>
            Limpiar
          </button>
        )}
      </header>

      {actividades.length === 0 ? (
        <p className={estilos.vacio}>Los cambios de todos los usuarios aparecerán aquí en tiempo real.</p>
      ) : (
        <ol className={estilos.lista} aria-live="polite">
          {actividades.map((actividad) => (
            <li key={actividad.id} className={estilos.elemento} data-tipo={actividad.tipo}>
              <span className={estilos.marcador} aria-hidden="true" />
              <div className={estilos.detalle}>
                <p className={estilos.mensaje}>{actividad.mensaje}</p>
                <p className={estilos.meta}>
                  {actividad.autor && <span>{actividad.autor} · </span>}
                  <time dateTime={new Date(actividad.instante).toISOString()}>{formatearHora(actividad.instante)}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
