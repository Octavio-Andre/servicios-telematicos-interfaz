import { useCallback, useState } from "react";
import { Avisos } from "./componentes/Avisos";
import { BarraSuperior } from "./componentes/BarraSuperior";
import { DialogoConfiguracion } from "./componentes/DialogoConfiguracion";
import { EspacioTrabajo } from "./componentes/EspacioTrabajo";
import { useAvisos } from "./estado/useAvisos";
import { useConfiguracion } from "./estado/useConfiguracion";
import { usePreferencia } from "./estado/usePreferencia";
import estilos from "./App.module.css";

export function App() {
  const { configuracion, errorCarga, guardarDirecciones, restaurarDirecciones } = useConfiguracion();
  const { avisos, mostrar, descartar } = useAvisos();
  const [usuario, setUsuario] = usePreferencia("tablero.usuario", "");
  const [idSeleccionado, setIdSeleccionado] = usePreferencia("tablero.arquitectura", "");
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);

  const mostrarError = useCallback((mensaje: string) => mostrar("error", mensaje), [mostrar]);
  const arquitecturas = configuracion?.arquitecturas ?? [];
  const arquitectura = arquitecturas.find((candidata) => candidata.id === idSeleccionado) ?? arquitecturas[0];

  return (
    <>
      <BarraSuperior
        usuario={usuario}
        alCambiarUsuario={setUsuario}
        alAbrirConfiguracion={() => setConfiguracionAbierta(true)}
      />

      <main className={estilos.principal}>
        {errorCarga && (
          <p className={estilos.estado} role="alert">
            No se pudo cargar la configuración: {errorCarga}
          </p>
        )}

        {!errorCarga && !configuracion && <p className={estilos.estado}>Cargando…</p>}

        {configuracion && arquitectura && (
          <EspacioTrabajo
            configuracion={configuracion}
            arquitectura={arquitectura}
            usuario={usuario.trim() || "Invitado"}
            alSeleccionarArquitectura={setIdSeleccionado}
            alFallar={mostrarError}
          />
        )}
      </main>

      {configuracion && (
        <DialogoConfiguracion
          abierto={configuracionAbierta}
          arquitecturas={configuracion.arquitecturas}
          alCerrar={() => setConfiguracionAbierta(false)}
          alGuardar={(direcciones) => {
            guardarDirecciones(direcciones);
            mostrar("exito", "Direcciones guardadas");
          }}
          alRestaurar={() => {
            restaurarDirecciones();
            mostrar("exito", "Se restauraron las direcciones predeterminadas");
          }}
        />
      )}

      <Avisos avisos={avisos} alDescartar={descartar} />
    </>
  );
}
