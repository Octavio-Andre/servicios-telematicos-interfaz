import type { Aviso } from "../estado/useAvisos";
import controles from "../estilos/controles.module.css";
import { Icono } from "../iconos/Icono";
import estilos from "./Avisos.module.css";

interface PropiedadesAvisos {
  avisos: Aviso[];
  alDescartar: (id: number) => void;
}

export function Avisos({ avisos, alDescartar }: PropiedadesAvisos) {
  return (
    <div className={estilos.contenedor} aria-live="assertive">
      {avisos.map((aviso) => (
        <div key={aviso.id} className={estilos.aviso} data-tipo={aviso.tipo} role="status">
          <p className={estilos.mensaje}>{aviso.mensaje}</p>
          <button type="button" className={controles.icono} onClick={() => alDescartar(aviso.id)} aria-label="Cerrar aviso">
            <Icono nombre="cerrar" tamano="1rem" />
          </button>
        </div>
      ))}
    </div>
  );
}
