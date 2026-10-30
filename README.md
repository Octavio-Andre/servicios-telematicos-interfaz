# Interfaz gráfica · Tablero colaborativo

Interfaz web común para los tres prototipos del proyecto **Comparación de Arquitecturas Distribuidas: Sistema Colaborativo de Gestión de Tareas** (Servicios Telemáticos, Grupo 10).

Un mismo tablero de tareas (Pendiente · En progreso · Finalizada) que se conecta a:

| Arquitectura | API REST | Tiempo real |
| --- | --- | --- |
| Cliente-Servidor | `http://localhost:3000/tasks` | WebSocket `ws://localhost:3000/ws` |
| P2P · Nodo 1 / Nodo 2 | `http://localhost:4001/tasks` · `http://localhost:4002/tasks` | Consulta periódica (los nodos no exponen un canal para clientes) |
| Microservicios | API Gateway `http://localhost:6001/api/tareas` | WebSocket de notificaciones `ws://localhost:5002/ws` |

## Funcionalidades

- Crear, editar, mover y eliminar tareas.
- Mover tareas arrastrándolas (mouse, pantalla táctil y teclado) o con los botones de cada tarjeta.
- Sincronización en tiempo real entre varios usuarios y panel de actividad.
- Estado de cada servicio y duración de la última operación HTTP.
- Direcciones configurables desde la interfaz (VirtualBox / Docker).
- Diseño adaptable desde 320 px hasta pantallas grandes, con modo oscuro automático.

## Requisitos

- Node.js 22.12 o superior (probado también con Node.js 26).
- Los prototipos en ejecución, en sus ramas con CORS habilitado (`sprint4-interfaz-grafica`).

## Ejecución en desarrollo

```bash
npm ci
npm run dev
```

Abrir `http://localhost:8080`.

## Verificación

```bash
npm run lint
npm run test
npm run build
```

## Docker

```bash
docker build -t tele-interfaz .
docker run --rm -p 8080:80 tele-interfaz
```

## Configuración de direcciones

Las direcciones predeterminadas están en `public/config.json`. En Docker se pueden reemplazar sin recompilar:

```bash
docker run --rm -p 8080:80 -v ./config.json:/usr/share/nginx/html/config.json:ro tele-interfaz
```

También se pueden cambiar desde el botón de ajustes de la interfaz; el cambio se guarda solo en ese navegador.

> En `docker-compose.yml` del repositorio de microservicios el API Gateway se publica en el puerto `6000`. Si se usa esa composición, cambiar la dirección de Microservicios a `http://localhost:6000`.

## Estructura

```
src/
├─ dominio/         Modelo de tarea y eventos comunes
├─ configuracion/   Carga de config.json y direcciones personalizadas
├─ proveedores/     Cliente HTTP, WebSocket con reconexión y proveedor de tareas
├─ estado/          Reductor, actividad y hooks del tablero
├─ componentes/     Componentes de la interfaz
├─ estilos/         Variables de diseño y controles compartidos
└─ iconos/          Iconos SVG
```

La interfaz no conoce los detalles de cada arquitectura: `crearProveedorTareas` traduce la configuración de cada prototipo a un contrato común (`listar`, `crear`, `actualizar`, `eliminar`, `suscribir`). Agregar una arquitectura nueva solo requiere declararla en `config.json`.

## Limitaciones

- En P2P los cambios se ven con una demora de hasta `intervaloConsultaMs` (1,5 s por defecto), porque el prototipo no ofrece un canal en tiempo real para los clientes.
- Los prototipos guardan las tareas en memoria: al reiniciar un servicio se pierden.
