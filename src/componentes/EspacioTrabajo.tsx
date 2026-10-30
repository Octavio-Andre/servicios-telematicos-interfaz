import type { Arquitectura, Configuracion } from "../configuracion/configuracion";
import { useSaludServicios } from "../estado/useSaludServicios";
import { SelectorArquitectura } from "./SelectorArquitectura";
import { TableroArquitectura } from "./TableroArquitectura";

interface PropiedadesEspacio {
  configuracion: Configuracion;
  arquitectura: Arquitectura;
  usuario: string;
  alSeleccionarArquitectura: (id: string) => void;
  alFallar: (mensaje: string) => void;
}

function claveDeConexion(arquitectura: Arquitectura): string {
  return [arquitectura.id, arquitectura.urlApi, arquitectura.urlWebSocket ?? ""].join("|");
}

export function EspacioTrabajo({
  configuracion,
  arquitectura,
  usuario,
  alSeleccionarArquitectura,
  alFallar,
}: PropiedadesEspacio) {
  const salud = useSaludServicios(configuracion.arquitecturas, configuracion.intervaloSaludMs, configuracion.tiempoMaximoMs);

  return (
    <>
      <SelectorArquitectura
        arquitecturas={configuracion.arquitecturas}
        seleccionada={arquitectura.id}
        salud={salud}
        alSeleccionar={alSeleccionarArquitectura}
      />
      <TableroArquitectura
        key={claveDeConexion(arquitectura)}
        arquitectura={arquitectura}
        configuracion={configuracion}
        usuario={usuario}
        alFallar={alFallar}
      />
    </>
  );
}
