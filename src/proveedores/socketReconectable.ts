export type EstadoConexion = "conectando" | "conectado" | "desconectado";

interface OpcionesSocket {
  url: string;
  alRecibirMensaje: (datos: unknown) => void;
  alCambiarEstado: (estado: EstadoConexion) => void;
  esperaInicialMs?: number;
  esperaMaximaMs?: number;
}

export function abrirSocketReconectable(opciones: OpcionesSocket): () => void {
  const esperaInicialMs = opciones.esperaInicialMs ?? 1000;
  const esperaMaximaMs = opciones.esperaMaximaMs ?? 10000;
  let socket: WebSocket | null = null;
  let intentosFallidos = 0;
  let temporizadorReconexion: ReturnType<typeof setTimeout> | undefined;
  let cerradoManualmente = false;

  const programarReconexion = () => {
    const espera = Math.min(esperaInicialMs * 2 ** intentosFallidos, esperaMaximaMs);
    intentosFallidos += 1;
    temporizadorReconexion = setTimeout(conectar, espera);
  };

  const conectar = () => {
    opciones.alCambiarEstado("conectando");

    try {
      socket = new WebSocket(opciones.url);
    } catch {
      opciones.alCambiarEstado("desconectado");
      programarReconexion();
      return;
    }

    socket.addEventListener("open", () => {
      intentosFallidos = 0;
      opciones.alCambiarEstado("conectado");
    });

    socket.addEventListener("message", (evento: MessageEvent<string>) => {
      try {
        opciones.alRecibirMensaje(JSON.parse(evento.data) as unknown);
      } catch {
        return;
      }
    });

    socket.addEventListener("close", () => {
      if (cerradoManualmente) {
        return;
      }
      opciones.alCambiarEstado("desconectado");
      programarReconexion();
    });
  };

  conectar();

  return () => {
    cerradoManualmente = true;
    clearTimeout(temporizadorReconexion);
    socket?.close();
  };
}
