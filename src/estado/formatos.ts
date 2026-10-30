const formateadorRelativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const formateadorHora = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const UNIDADES: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

export function formatearTiempoRelativo(instante: number, ahora = Date.now()): string {
  const diferencia = instante - ahora;

  for (const [unidad, milisegundos] of UNIDADES) {
    if (Math.abs(diferencia) >= milisegundos) {
      return formateadorRelativo.format(Math.round(diferencia / milisegundos), unidad);
    }
  }

  return "hace un momento";
}

export function formatearHora(instante: number): string {
  return formateadorHora.format(instante);
}

export function formatearDuracion(milisegundos: number): string {
  return `${Math.round(milisegundos)} ms`;
}

export function inicialDe(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase() || "?";
}
