# F1 Pilot Tracker — Frontend
## Autor: Pedro Caso 241286
Cliente web para gestionar y calificar pilotos de Fórmula 1. Construido con **HTML, CSS y JavaScript vanilla** — sin frameworks, sin librerías, sin jQuery, sin axios. Consume la API REST del backend mediante `fetch()` nativo.

> **Repositorio del backend:** [https://github.com/Pxdro-410/Proy1web-backend-PC](https://github.com/Pxdro-410/Proy1web-backend-PC)
>
> **App publicada:** https://proy1web-formula1-pc.netlify.app/

---

## Screenshot de Netlify y funcionamiento de la app

<img width="1600" height="717" alt="image" src="https://github.com/user-attachments/assets/4f2347b4-acb8-4724-9194-daf9129de54f" />


<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/1c093f89-6e96-456b-898c-bf0f6f64b03f" />

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 vanilla (variables, grid, flexbox, animaciones) |
| Lógica | JavaScript ES2020+ vanilla (`fetch`, `async/await`, `URLSearchParams`) |
| Tipografía | Google Fonts — Barlow + Barlow Condensed |
| Deploy | Netlify |

> **Sin frameworks.** Cero dependencias de npm. No se usa React, Vue, Angular, jQuery, axios ni ninguna librería externa.

---

## Cómo correr el proyecto localmente

### Pre-requisitos

- Cualquier navegador moderno (Chrome, Firefox, Edge)
- Python 3 instalado (para el servidor local) **o** la extensión Live Server de VS Code

### 1. Clonar el repositorio

```bash
git clone [https://github.com/Pxdro-410/Proy1web-frontend-PC.git](https://github.com/Pxdro-410/Proy1web-frontend-PC.git)
cd Proy1web-frontend-PC
```

### 2. Iniciar un servidor local

**Python:**

```bash
python -m http.server 5505
```

### 3. Abrir en el navegador

```
http://localhost:5500
```

---

## CORS

El frontend y el backend corren en dominios distintos. El navegador bloquea las peticiones `fetch()` a menos que el servidor lo permita explícitamente mediante headers CORS. CORS lo que hace controlar las peticiones de una pagina web hacia hacia un dominio distinto al suyo. 

El backend está configurado para aceptar peticiones de cualquier origen:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Sin esta configuración, todas las llamadas `fetch()` del frontend fallarían con un error de CORS.

---

## Estructura del proyecto

```
Proy1web-frontend-PC/
│
├── index.html          # Estructura principal de la app
│
├── css/
│   └── styles.css      # Todos los estilos (design tokens, componentes, responsive)
│
└── js/
    ├── api.js          # Capa de comunicación con el backend (fetch wrappers)
    ├── rating.js       # Lógica del modal de rating (estrellas, promedio, lista)
    └── ui.js           # Lógica principal de la UI (render, paginación, modales, CRUD)
```

### Responsabilidad de cada archivo JS

| Archivo | Responsabilidad |
|---|---|
| `api.js` | Todas las llamadas a la API. Un solo helper `request()` centraliza el manejo de errores HTTP. Las demás funciones (`getPilotos`, `createPiloto`, etc.) |
| `rating.js` | Modal de rating: construye las estrellas 1–10, maneja hover/click sin reconstruir el DOM, carga ratings existentes y muestra el promedio. |
| `ui.js` | Estado global de la app (página, búsqueda, sort), renderizado de cards, paginación, modales de crear/editar y confirmación de borrado, toasts de notificación. |

---

## Funcionalidades

- **Listado de pilotos** con cards visuales que muestran imagen, número, equipo, nacionalidad y descripción
- **Búsqueda en tiempo real** con debounce (400ms) por nombre del piloto
- **Ordenamiento** por nombre, equipo, número o campeonatos, en dirección ASC/DESC
- **Paginación** con controles de navegación y selector de resultados por página (6, 12, 24)
- **Crear piloto** desde un modal con validación client-side y errores del servidor mostrados en el formulario
- **Editar piloto** con el formulario pre-rellenado con los datos actuales
- **Eliminar piloto** con modal de confirmación antes de ejecutar la acción
- **Sistema de rating** por piloto: selector de 1–10 estrellas con hover interactivo, comentario opcional, promedio actualizado en tiempo real y lista de ratings previos
- **Notificaciones toast** de éxito/error al completar acciones
- **Estado de carga** y **estado vacío** para UX completa
- **Cierre de modales** con `Escape`, clic fuera del modal o botón ✕
- **Diseño responsive** adaptado a móvil

---

## Challenges implementados

| Challenge | Puntos | Cómo se ve en el cliente |
|---|---|---|
| **Códigos HTTP correctos** | 20 pts | Los errores 400/404 se muestran en el formulario; 201/204 disparan toast de éxito |
| **Validación server-side** | 20 pts | Los errores JSON del servidor (`{ "error": "..." }`) se muestran debajo del campo correspondiente o en el formulario |
| **Paginación** | 30 pts | Controles de navegación con info "Mostrando X–Y de Z pilotos" |
| **Búsqueda** | 15 pts | Input de búsqueda con debounce, botón de limpiar, actualización automática |
| **Ordenamiento** | 15 pts | Select de campo + botón ASC/DESC con icono animado |
| **Sistema de rating** | 30 pts | Modal con 10 estrellas interactivas, promedio circular, historial de ratings |
| **Total** | **130 pts** | |

---

## Reflexión

### HTML + CSS + JavaScript Vanilla

Este proyecto demostró que es completamente posible construir una interfaz moderna y funcional sin ningún framework. La separación en tres archivos JS con responsabilidades claras api.js, rating.js, ui.js) hizo que el código fuera mantenible sin necesitar React o Vue.

**¿Lo usaría de nuevo?** Depende, unicamente para proyectos pequeños debido a que para aplicaciones más complejas con estado compartido entre muchos componentes se vuelve muy complejo, por loq ue, probablemente elegiría Vue o React.

### `fetch()` como cliente HTTP

fetch() es simple de entender cuando se trata de comsumir APIs REST. La combinación de async/await con un helper centralizado hace que el código sea limpio y predecible.

**¿Lo usaría de nuevo?** Sí, lo he usado en otros proyectos y se me hace cómodo de usar.

### Diseño CSS sin framework

Implementar el diseño completamente con CSS vanilla fue más trabajo de forma general aunque eso permitió que también fuera más flexible. Las variables CSS actuaron como un sistema de diseño propio. Las animaciones se lograron con @keyframes, cumpliendo con el requisito de no utilizar ninguna librería de animación o externa.

**¿Lo usaría de nuevo?** Sí para proyectos con diseño personalizado y no muy grandes, para proyectos donde se requieran prioridades distintas como la eficiencia o velocidad si utilizaría un framework.
