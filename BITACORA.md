# Bitácora de decisiones

## 1. ¿Por qué un id único y no el nombre?
Dos personajes pueden llamarse igual (por ejemplo, versiones distintas del mismo nombre). Si el nombre fuera la clave, editar o borrar a uno afectaría al otro. Uso un `id` (la fecha en milisegundos más un número aleatorio) para identificar y, aparte, valido que el nombre no se repita para evitar confusión visual. Alternativa: usar el índice del arreglo, pero cambia al borrar y causaría errores.

## 2. ¿Un arreglo en una sola clave o un personaje por clave?
Elegí una sola clave (`personajes`). Ventajas: una sola lectura/escritura, fácil de exportar y de validar si está corrupto. Desventaja: cada cambio reescribe todo el JSON, que con miles de elementos sería lento. Con un personaje por clave se escribe menos, pero hay que llevar un índice de claves y es más fácil quedar con datos inconsistentes. Para una colección personal, una clave es más simple y segura.

## 3. ¿Búsqueda en cada tecla o con Enter?
En cada tecla (evento `input`), porque con decenas de personajes filtrar un arreglo es instantáneo y el usuario ve resultados al momento. Con 1,000 personajes seguiría siendo rápido, pero con decenas de miles convendría un *debounce* de ~200 ms para no redibujar el DOM en cada letra. Enter sería más lento de usar y no cumple "tiempo real".

## 4. ¿Qué pasa si localStorage tiene un JSON inválido?
`cargarPersonajes()` usa `try/catch` y además comprueba que el resultado sea un arreglo y que cada elemento tenga `id`, `nombre` y `rol`. Si algo falla, avisa y restaura la colección inicial en lugar de romper la página. Alternativa: conservar una copia del dato dañado para que el usuario lo recupere; no la implementé por simplicidad.

## 5. ¿Qué pasa si la URL de la imagen no existe?
El evento `onerror` de la imagen la reemplaza por un círculo con las iniciales del personaje. Así la tarjeta nunca queda con un icono roto. Además valido que la URL empiece con http/https.

## 6. ¿Se permite un nombre de solo espacios o duplicado?
No a ambos. Aplico `trim()` y colapso espacios; si queda vacío, error. Para duplicados comparo el nombre normalizado (sin acentos ni mayúsculas), ignorando al propio personaje cuando se edita. Alternativa: permitir duplicados con aviso; la descarté porque confunde en la búsqueda.

## 10 (extra de pensamiento crítico). Inconsistencia en el planteamiento: el ciclo `while`
La sección 7 pide repetir la búsqueda "mientras el resultado tenga 0 coincidencias, hasta encontrar al menos un personaje". Esto tiene dos problemas:
1. **Bucle infinito:** si la colección está vacía o nada coincide jamás, la condición nunca se cumple y la página se congela.
2. **Contradice los criterios CA-07 y CA-08:** si la búsqueda cambia sola hasta hallar algo, el usuario nunca vería "sin resultados" y el contador sería falso.

**Mi solución:** mantengo el `while`, pero solo para *sugerir*: acorta la consulta una letra por vuelta (así siempre termina) y muestra "Quizá buscabas...", mientras la cuadrícula sigue mostrando el mensaje honesto de "sin resultados" con botón de limpiar.

Riesgo adicional: `localStorage` es por navegador y dominio; en GitHub Pages cada persona ve su propia colección, no la mía (pregunta 9). Cualquier script del mismo dominio puede leerlo, por eso no se guarda información sensible.
