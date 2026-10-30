import { useState } from "react";
import controles from "../estilos/controles.module.css";
import { Dialogo } from "./Dialogo";
import estilosDialogo from "./Dialogo.module.css";

interface PropiedadesConfirmacion {
  titulo: string;
  mensaje: string | null;
  textoConfirmar: string;
  alCerrar: () => void;
  alConfirmar: () => Promise<boolean>;
}

export function DialogoConfirmacion({ titulo, mensaje, textoConfirmar, alCerrar, alConfirmar }: PropiedadesConfirmacion) {
  const [procesando, setProcesando] = useState(false);

  const confirmar = async () => {
    setProcesando(true);
    const completado = await alConfirmar();
    setProcesando(false);
    if (completado) {
      alCerrar();
    }
  };

  return (
    <Dialogo abierto={mensaje !== null} titulo={titulo} alCerrar={alCerrar} ancho="angosto">
      <p className={estilosDialogo.mensaje}>{mensaje}</p>
      <div className={estilosDialogo.acciones}>
        <button type="button" className={controles.boton} onClick={alCerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className={`${controles.boton} ${controles.peligro}`}
          onClick={() => void confirmar()}
          disabled={procesando}
        >
          {procesando ? "Procesando…" : textoConfirmar}
        </button>
      </div>
    </Dialogo>
  );
}
