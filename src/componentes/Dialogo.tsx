import { useEffect, useRef, type ReactNode } from "react";
import { Icono } from "../iconos/Icono";
import controles from "../estilos/controles.module.css";
import estilos from "./Dialogo.module.css";

interface PropiedadesDialogo {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
  ancho?: "normal" | "angosto";
}

export function Dialogo({ abierto, titulo, alCerrar, children, ancho = "normal" }: PropiedadesDialogo) {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) {
      return;
    }
    if (abierto && !dialogo.open) {
      dialogo.showModal();
    }
    if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  return (
    <dialog
      ref={referencia}
      className={`${estilos.dialogo} ${ancho === "angosto" ? estilos.angosto : ""}`}
      aria-labelledby="titulo-dialogo"
      onClose={alCerrar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) {
          alCerrar();
        }
      }}
    >
      {abierto && (
        <div className={estilos.contenido}>
          <header className={estilos.cabecera}>
            <h2 id="titulo-dialogo" className={estilos.titulo}>
              {titulo}
            </h2>
            <button type="button" className={controles.icono} onClick={alCerrar} aria-label="Cerrar">
              <Icono nombre="cerrar" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
