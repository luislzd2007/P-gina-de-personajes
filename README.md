# Purifición de alma– Coleción de chicas de animes de romance

Luis Augusto Lozada Duarte
Desarrollo de Aplicaciones Web
**GitHub Pages:** https://github.com/luislzd2007/Pagina-de-personajes

## Descripción
SPA que administra una colección de personajes con CRUD completo y persistencia en `localStorage`.

## Funcionalidades
- Cuadrícula responsiva con nombre, rol e imagen (o iniciales si no hay imagen o falla).
- Detalle de cada personaje con botón para volver.
- Alta y edición con validación (campos obligatorios, nombres duplicados, URL de imagen).
- Eliminación con confirmación.
- Búsqueda en tiempo real por nombre o rol, sin distinguir mayúsculas ni acentos, con contador y mensaje de "sin resultados".
- Persistencia: sobrevive a recargas; maneja JSON corrupto, estado vacío y almacenamiento lleno.

- Estilos con el framework visual Bulma (cargado por CDN) y un archivo `styles.css` con ajustes propios.

## Instrucciones de uso
1. Abre la URL de GitHub Pages.
2. Usa el buscador para filtrar; haz clic en una tarjeta para ver su detalle.
3. "Agregar personaje" abre el formulario; en el detalle puedes editar o eliminar.
