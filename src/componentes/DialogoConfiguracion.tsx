import { useState, type FormEvent } from "react";
import type { Arquitectura, DireccionesPersonalizadas } from "../configuracion/configuracion";
import controles from "../estilos/controles.module.css";
import { Dialogo } from "./Dialogo";
import estilosDialogo from "./Dialogo.module.css";
import estilos from "./DialogoConfiguracion.module.css";

interface PropiedadesConfiguracion {
  abierto: boolean;
  arquitecturas: Arquitectura[];
  alCerrar: () => void;
  alGuardar: (direcciones: DireccionesPersonalizadas) => void;
  alRestaurar: () => void;
}

function direccionesDe(arquitecturas: Arquitectura[]): DireccionesPersonalizadas {
  return Object.fromEntries(
    arquitecturas.map((arquitectura) => [
      arquitectura.id,
      { urlApi: arquitectura.urlApi, ...(arquitectura.urlWebSocket ? { urlWebSocket: arquitectura.urlWebSocket } : {}) },
    ]),
  );
}

function FormularioConfiguracion({ arquitecturas, alCerrar, alGuardar, alRestaurar }: Omit<PropiedadesConfiguracion, "abierto">) {
  const [direcciones, setDirecciones] = useState(() => direccionesDe(arquitecturas));

  const actualizar = (id: string, campo: "urlApi" | "urlWebSocket", valor: string) => {
    setDirecciones((actuales) => ({
      ...actuales,
      [id]: { urlApi: actuales[id]?.urlApi ?? "", ...actuales[id], [campo]: valor.trim() },
    }));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    alGuardar(direcciones);
    alCerrar();
  };

  return (
    <form onSubmit={enviar} className={estilosDialogo.formulario}>
      <p className={estilosDialogo.mensaje}>
        Cambia las direcciones si los prototipos se ejecutan en máquinas virtuales o contenedores.
      </p>

      {arquitecturas.map((arquitectura) => (
        <fieldset key={arquitectura.id} className={estilos.grupo}>
          <legend className={estilos.leyenda}>{arquitectura.nombre}</legend>
          <label className={controles.campo}>
            API REST
            <input
              className={controles.entrada}
              type="url"
              required
              value={direcciones[arquitectura.id]?.urlApi ?? ""}
              onChange={(evento) => actualizar(arquitectura.id, "urlApi", evento.target.value)}
            />
          </label>
          {arquitectura.tiempoReal === "websocket" && (
            <label className={controles.campo}>
              WebSocket
              <input
                className={controles.entrada}
                type="text"
                pattern="wss?://.+"
                required
                value={direcciones[arquitectura.id]?.urlWebSocket ?? ""}
                onChange={(evento) => actualizar(arquitectura.id, "urlWebSocket", evento.target.value)}
              />
            </label>
          )}
        </fieldset>
      ))}

      <div className={estilosDialogo.acciones}>
        <button
          type="button"
          className={`${controles.boton} ${estilos.restaurar}`}
          onClick={() => {
            alRestaurar();
            alCerrar();
          }}
        >
          Restaurar valores
        </button>
        <button type="button" className={controles.boton} onClick={alCerrar}>
          Cancelar
        </button>
        <button type="submit" className={`${controles.boton} ${controles.primario}`}>
          Guardar
        </button>
      </div>
    </form>
  );
}

export function DialogoConfiguracion({ abierto, ...propiedades }: PropiedadesConfiguracion) {
  return (
    <Dialogo abierto={abierto} titulo="Direcciones de los prototipos" alCerrar={propiedades.alCerrar}>
      {abierto && <FormularioConfiguracion {...propiedades} />}
    </Dialogo>
  );
}
