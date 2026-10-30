import controles from "../estilos/controles.module.css";
import { Icono } from "../iconos/Icono";
import estilos from "./BarraSuperior.module.css";

interface PropiedadesBarra {
  usuario: string;
  alCambiarUsuario: (usuario: string) => void;
  alAbrirConfiguracion: () => void;
}

export function BarraSuperior({ usuario, alCambiarUsuario, alAbrirConfiguracion }: PropiedadesBarra) {
  return (
    <header className={estilos.barra}>
      <div className={estilos.contenido}>
        <div className={estilos.marca}>
          <h1 className={estilos.titulo}>Tablero colaborativo</h1>
          <p className={estilos.subtitulo}>Arquitecturas distribuidas · Grupo 10</p>
        </div>

        <div className={estilos.herramientas}>
          <label className={estilos.usuario}>
            <span className="visualmente-oculto">Tu nombre</span>
            <input
              className={controles.entrada}
              value={usuario}
              maxLength={30}
              onChange={(evento) => alCambiarUsuario(evento.target.value)}
              placeholder="Tu nombre"
            />
          </label>
          <button
            type="button"
            className={controles.icono}
            onClick={alAbrirConfiguracion}
            aria-label="Configurar direcciones de los prototipos"
            title="Configurar direcciones"
          >
            <Icono nombre="ajustes" />
          </button>
        </div>
      </div>
    </header>
  );
}
