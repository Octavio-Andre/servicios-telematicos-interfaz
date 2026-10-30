import type { Arquitectura } from "../configuracion/configuracion";
import { formatearDuracion } from "../estado/formatos";
import type { SaludServicio } from "../estado/useSaludServicios";
import estilos from "./SelectorArquitectura.module.css";

interface PropiedadesSelector {
  arquitecturas: Arquitectura[];
  seleccionada: string;
  salud: Record<string, SaludServicio>;
  alSeleccionar: (id: string) => void;
}

function describirSalud(salud: SaludServicio | undefined): string {
  if (!salud || salud.disponible === null) {
    return "Verificando servicio";
  }
  if (!salud.disponible) {
    return "Servicio no disponible";
  }
  return `Servicio activo · ${formatearDuracion(salud.latenciaMs ?? 0)}`;
}

export function SelectorArquitectura({ arquitecturas, seleccionada, salud, alSeleccionar }: PropiedadesSelector) {
  return (
    <nav className={estilos.selector} aria-label="Arquitectura">
      <div className={estilos.opciones} role="tablist">
        {arquitecturas.map((arquitectura) => {
          const saludServicio = salud[arquitectura.id];
          const estadoSalud = saludServicio?.disponible === true ? "activo" : saludServicio?.disponible === false ? "inactivo" : "pendiente";

          return (
            <button
              key={arquitectura.id}
              type="button"
              role="tab"
              aria-selected={arquitectura.id === seleccionada}
              className={estilos.opcion}
              onClick={() => alSeleccionar(arquitectura.id)}
              title={describirSalud(saludServicio)}
            >
              <span className={estilos.indicador} data-estado={estadoSalud} aria-hidden="true" />
              {arquitectura.nombre}
              <span className="visualmente-oculto">. {describirSalud(saludServicio)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
