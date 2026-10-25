// =====================================================
//  Corazón de papel - colección de personajes (CRUD)
//  Todo se guarda en localStorage, sin backend.
// =====================================================


// ---------- 1. Datos y estado ----------

const CLAVE_STORAGE = 'personajes';

// Personajes que aparecen la primera vez que se abre la página
const PERSONAJES_INICIALES = [
  { nombre: 'Taiga Aisaka', imagen: 'img/taiga-aisaka.jpg', rol: 'Tsundere', origen: 'Toradora!', descripcion: 'Pequeña, explosiva y con un corazón enorme que le cuesta admitir.' },
  { nombre: 'Kaguya Shinomiya', imagen: 'img/kaguya-shinomiya.jpg', rol: 'Kuudere', origen: 'Kaguya-sama: Love is War', descripcion: 'Presidenta del consejo estudiantil que libra una guerra para que él se confiese primero.' },
  { nombre: 'Mai Sakurajima', imagen: 'img/mai-sakurajima.jpg', rol: 'Kuudere', origen: 'Seishun Buta Yarou', descripcion: 'Actriz que se vuelve invisible por el síndrome de la adolescencia.' },
  { nombre: 'Kaori Miyazono', imagen: 'img/kaori-miyazono.jpg', rol: 'Genki', origen: 'Shigatsu wa Kimi no Uso', descripcion: 'Violinista libre que devuelve el color a la vida de un pianista.' },
  { nombre: 'Ichika Nakano', imagen: 'img/ichika-nakano.jpg', rol: 'Onee-san', origen: 'Go-Toubun no Hanayome', descripcion: 'Actriz en ascenso y hermana mayor que esconde sus propios sentimientos para cuidar a las demás.' },
  { nombre: 'Nino Nakano', imagen: 'img/nino-nakano.jpg', rol: 'Tsundere', origen: 'Go-Toubun no Hanayome', descripcion: 'Segunda hermana, orgullosa y directa, que cocina con esmero aunque lo niegue.' },
  { nombre: 'Miku Nakano', imagen: 'img/miku-nakano.jpg', rol: 'Dandere', origen: 'Go-Toubun no Hanayome', descripcion: 'Tímida y apasionada por la historia, que poco a poco se atreve a abrir su corazón.' },
  { nombre: 'Yotsuba Nakano', imagen: 'img/yotsuba-nakano.jpg', rol: 'Genki', origen: 'Go-Toubun no Hanayome', descripcion: 'Energética y siempre dispuesta a ayudar, aunque detrás de su sonrisa hay secretos.' },
  { nombre: 'Itsuki Nakano', imagen: 'img/itsuki-nakano.jpg', rol: 'Kuudere', origen: 'Go-Toubun no Hanayome', descripcion: 'La menor del grupo, seria y aplicada, con un apetito que contrasta con su disciplina.' }
];

let personajes = [];      // la lista que se muestra y se guarda
let idEnEdicion = null;   // null = estamos creando; con valor = estamos editando


// ---------- 2. Referencias al HTML ----------

const $ = (selector) => document.querySelector(selector);

const buscador = $('#buscador');
const grid = $('#grid');
const contador = $('#contador');
const mensaje = $('#mensaje');
const aviso = $('#aviso');
const formulario = $('#form');

const campos = {
  nombre: $('#f-nombre'),
  rol: $('#f-rol'),
  origen: $('#f-origen'),
  imagen: $('#f-imagen'),
  descripcion: $('#f-descripcion')
};


// ---------- 3. Funciones de ayuda ----------

// Id único: la fecha en milisegundos más un número aleatorio
function crearId() {
  return Date.now() + '-' + Math.floor(Math.random() * 100000);
}

// Quita acentos y mayúsculas para que "rein" encuentre "Reinhardt" y "mai" a "Mai"
function normalizar(texto) {
  const minusculas = String(texto || '').toLowerCase().trim();
  const conAcento = 'áàäâéèëêíìïîóòöôúùüû';
  const sinAcento = 'aaaaeeeeiiiioooouuuu';

  let resultado = '';
  for (let i = 0; i < minusculas.length; i++) {
    const letra = minusculas[i];
    const posicion = conAcento.indexOf(letra);   // -1 si la letra no lleva acento
    if (posicion >= 0) {
      resultado += sinAcento[posicion];
    } else {
      resultado += letra;
    }
  }
  return resultado;
}

// Crea un elemento con clase y texto. Uso textContent (no innerHTML)
// para que nadie pueda meter código HTML en un nombre.
function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function mostrarAviso(texto, esError) {
  aviso.textContent = texto;
  aviso.className = esError ? 'notification is-danger aviso' : 'notification is-dark aviso';
  aviso.hidden = false;
  clearTimeout(mostrarAviso.temporizador);
  mostrarAviso.temporizador = setTimeout(() => { aviso.hidden = true; }, 3500);
}

// Solo una vista visible a la vez: 'grid', 'detalle' o 'form'
function mostrarVista(nombreVista) {
  ['grid', 'detalle', 'form'].forEach((vista) => {
    $('#vista-' + vista).hidden = (vista !== nombreVista);
  });
}

function obtenerIniciales(nombre) {
  const palabras = nombre.split(' ');
  let iniciales = '';

  for (let i = 0; i < palabras.length && iniciales.length < 2; i++) {
    if (palabras[i] !== '') {
      iniciales += palabras[i][0].toUpperCase();
    }
  }
  return iniciales;
}

// Foto del personaje; si no hay foto o no carga, se muestran las iniciales
function crearImagen(personaje) {
  if (!personaje.imagen) return crearIniciales(personaje);

  const img = crearElemento('img');
  img.src = personaje.imagen;
  img.alt = personaje.nombre;
  img.onerror = () => img.replaceWith(crearIniciales(personaje));
  return img;
}

function crearIniciales(personaje) {
  const circulo = crearElemento('div', 'avatar has-ratio', obtenerIniciales(personaje.nombre));
  circulo.setAttribute('aria-label', personaje.nombre);
  return circulo;
}


// ---------- 4. localStorage ----------

function personajesIniciales() {
  const lista = [];

  for (let i = 0; i < PERSONAJES_INICIALES.length; i++) {
    const p = PERSONAJES_INICIALES[i];
    lista.push({
      id: crearId() + '-' + i,   // el número i evita repetidos al crear varios al mismo tiempo
      nombre: p.nombre,
      rol: p.rol,
      origen: p.origen,
      imagen: p.imagen,
      descripcion: p.descripcion,
      fechaCreacion: new Date().toISOString()
    });
  }
  return lista;
}

function cargarPersonajes() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);

    // Primera visita: todavía no hay nada guardado
    if (guardado === null) return personajesIniciales();

    const datos = JSON.parse(guardado);
    if (!Array.isArray(datos)) throw new Error('Los datos no son una lista');

    // Me quedo solo con los que tienen los campos obligatorios
    const validos = [];
    for (let i = 0; i < datos.length; i++) {
      const p = datos[i];
      if (p && p.id && p.nombre && p.rol) {
        validos.push(p);
      }
    }
    return validos;
  } catch (error) {
    mostrarAviso('Los datos guardados estaban dañados. Se restauró la colección inicial.', true);
    return personajesIniciales();
  }
}

// Devuelve true si se guardó bien, false si falló (por ejemplo, almacenamiento lleno)
function guardarPersonajes() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(personajes));
    return true;
  } catch (error) {
    mostrarAviso('No se pudo guardar: el almacenamiento está lleno o bloqueado.', true);
    return false;
  }
}


// ---------- 5. Búsqueda ----------

function filtrarPersonajes(texto) {
  const busqueda = normalizar(texto);
  const resultado = [];

  for (let i = 0; i < personajes.length; i++) {
    const p = personajes[i];
    if (normalizar(p.nombre).includes(busqueda) || normalizar(p.rol).includes(busqueda)) {
      resultado.push(p);
    }
  }
  return resultado;
}

// Ciclo while que pide el proyecto: si no hay coincidencias, acorta la
// búsqueda una letra a la vez hasta encontrar algo. Siempre termina porque
// el texto se hace más corto en cada vuelta. Solo sirve para sugerir.
function buscarSugerencias(texto) {
  let busqueda = normalizar(texto);
  let resultado = [];

  while (resultado.length === 0 && busqueda.length > 1) {
    busqueda = busqueda.slice(0, -1);
    resultado = filtrarPersonajes(busqueda);
  }
  return resultado;
}


// ---------- 6. Pantalla principal (cuadrícula) ----------

function renderizarGrid() {
  const texto = buscador.value;
  const hayBusqueda = texto.trim() !== '';
  const lista = hayBusqueda ? filtrarPersonajes(texto) : personajes;

  grid.replaceChildren();
  mensaje.hidden = true;
  contador.textContent = '';

  if (personajes.length === 0) {
    mostrarEstadoVacio();
    return;
  }

  if (hayBusqueda) {
    contador.textContent = lista.length + (lista.length === 1 ? ' coincidencia' : ' coincidencias');
  }

  if (lista.length === 0) {
    mostrarSinResultados(texto);
    return;
  }

  lista.forEach((personaje) => grid.append(crearTarjeta(personaje)));
}

function crearTarjeta(personaje) {
  // Bulma: cada tarjeta va dentro de una columna (2 por fila en móvil, 3 en tablet, 4 en escritorio)
  const columna = crearElemento('div', 'column is-half-mobile is-one-third-tablet is-one-quarter-desktop');

  const tarjeta = crearElemento('button', 'card is-clickable');
  tarjeta.type = 'button';

  const figura = crearElemento('figure', 'image is-1by1');
  figura.append(crearImagen(personaje));

  const contenido = crearElemento('div', 'card-content');
  contenido.append(
    crearElemento('h3', 'title is-5', personaje.nombre),
    crearElemento('span', 'tag is-link', personaje.rol)
  );

  tarjeta.append(figura, contenido);
  tarjeta.onclick = () => renderizarDetalle(personaje.id);
  columna.append(tarjeta);
  return columna;
}

function mostrarEstadoVacio() {
  const boton = crearElemento('button', 'button is-primary', 'Agregar personaje');
  boton.onclick = () => abrirFormulario();

  mensaje.replaceChildren(
    crearElemento('p', '', 'Aún no tienes personajes. Agrega tu primera heroína.'),
    boton
  );
  mensaje.hidden = false;
}

function mostrarSinResultados(texto) {
  const boton = crearElemento('button', 'button is-primary is-outlined', 'Limpiar búsqueda');
  boton.onclick = () => {
    buscador.value = '';
    renderizarGrid();
  };

  mensaje.replaceChildren(crearElemento('p', '', 'Sin resultados para "' + texto + '".'));

  const sugerencias = buscarSugerencias(texto);
  if (sugerencias.length > 0) {
    let nombres = '';
    for (let i = 0; i < sugerencias.length; i++) {
      if (i > 0) nombres += ', ';
      nombres += sugerencias[i].nombre;
    }
    mensaje.append(crearElemento('p', '', 'Quizá buscabas: ' + nombres));
  }

  mensaje.append(boton);
  mensaje.hidden = false;
}


// ---------- 7. Detalle ----------

function renderizarDetalle(id) {
  const personaje = personajes.find((p) => p.id === id);
  if (!personaje) {
    mostrarVista('grid');
    return;
  }

  const botonVolver = crearElemento('button', 'button is-light', 'Volver a la cuadrícula');
  const botonEditar = crearElemento('button', 'button is-primary', 'Editar');
  const botonEliminar = crearElemento('button', 'button is-danger is-outlined', 'Eliminar');

  botonVolver.onclick = () => mostrarVista('grid');
  botonEditar.onclick = () => abrirFormulario(personaje.id);
  botonEliminar.onclick = () => eliminarPersonaje(personaje.id);

  const acciones = crearElemento('div', 'buttons mt-4');
  acciones.append(botonVolver, botonEditar, botonEliminar);

  const info = crearElemento('div');
  info.append(
    crearElemento('h2', 'title is-3', personaje.nombre),
    crearElemento('span', 'tag is-link is-medium', personaje.rol),
    crearElemento('p', 'mt-3', 'Origen: ' + (personaje.origen || 'Sin especificar')),
    crearElemento('p', '', personaje.descripcion || 'Sin descripción.'),
    acciones
  );

  // Bulma: un recuadro (box) con dos columnas, foto a la izquierda e información a la derecha
  const figura = crearElemento('figure', 'image is-1by1');
  figura.append(crearImagen(personaje));

  const columnaFoto = crearElemento('div', 'column is-one-third-tablet');
  columnaFoto.append(figura);
  const columnaInfo = crearElemento('div', 'column');
  columnaInfo.append(info);

  const fila = crearElemento('div', 'columns');
  fila.append(columnaFoto, columnaInfo);

  const tarjeta = crearElemento('article', 'box');
  tarjeta.append(fila);

  $('#vista-detalle').replaceChildren(tarjeta);
  mostrarVista('detalle');
}


// ---------- 8. Formulario (crear y editar) ----------

// Si recibe un id, edita ese personaje; si no, abre el formulario vacío
function abrirFormulario(id) {
  idEnEdicion = typeof id === 'string' ? id : null;
  const personaje = personajes.find((p) => p.id === idEnEdicion);

  $('#form-titulo').textContent = personaje ? 'Editar personaje' : 'Nuevo personaje';
  campos.nombre.value = personaje ? personaje.nombre : '';
  campos.rol.value = personaje ? personaje.rol : '';
  campos.origen.value = personaje ? personaje.origen : '';
  campos.imagen.value = personaje ? personaje.imagen : '';
  campos.descripcion.value = personaje ? personaje.descripcion : '';

  limpiarErrores();
  mostrarVista('form');
  campos.nombre.focus();
}

function limpiarErrores() {
  document.querySelectorAll('.error').forEach((e) => { e.textContent = ''; });
}

function leerFormulario() {
  return {
    nombre: campos.nombre.value.trim().replace(/\s+/g, ' '),
    rol: campos.rol.value.trim(),
    origen: campos.origen.value.trim(),
    imagen: campos.imagen.value.trim(),
    descripcion: campos.descripcion.value.trim()
  };
}

// Devuelve un objeto con los errores encontrados (vacío si todo está bien)
function validarDatos(datos) {
  const errores = {};

  if (datos.nombre === '') {
    errores.nombre = 'El nombre es obligatorio (no solo espacios).';
  } else {
    // Al editar no cuenta como duplicado el mismo personaje
    const repetido = personajes.some((p) =>
      p.id !== idEnEdicion && normalizar(p.nombre) === normalizar(datos.nombre)
    );
    if (repetido) errores.nombre = 'Ya existe un personaje con ese nombre.';
  }

  if (datos.rol === '') {
    errores.rol = 'El rol es obligatorio.';
  }

  // La imagen puede ser un enlace de internet o una ruta de la carpeta img/
  const esEnlace = /^https?:\/\/\S+$/i.test(datos.imagen);
  const esRutaLocal = /^img\/\S+$/i.test(datos.imagen);
  if (datos.imagen !== '' && !esEnlace && !esRutaLocal) {
    errores.imagen = 'Escribe un enlace (http:// o https://) o una ruta como img/foto.jpg.';
  }

  return errores;
}

function guardarFormulario(evento) {
  evento.preventDefault();

  const datos = leerFormulario();
  const errores = validarDatos(datos);

  limpiarErrores();
  for (const campo in errores) {
    $('#e-' + campo).textContent = errores[campo];
  }
  if (Object.keys(errores).length > 0) return;

  // Guardo una copia por si falla localStorage y hay que deshacer
  const copia = personajes.slice();
  const estabaEditando = idEnEdicion;

  if (estabaEditando) {
    // Busco al personaje y lo reemplazo por uno nuevo con los datos del formulario
    for (let i = 0; i < personajes.length; i++) {
      if (personajes[i].id === estabaEditando) {
        const anterior = personajes[i];
        personajes[i] = {
          id: anterior.id,
          nombre: datos.nombre,
          rol: datos.rol,
          origen: datos.origen,
          imagen: datos.imagen,
          descripcion: datos.descripcion,
          fechaCreacion: anterior.fechaCreacion
        };
      }
    }
  } else {
    personajes.push({
      id: crearId(),
      nombre: datos.nombre,
      rol: datos.rol,
      origen: datos.origen,
      imagen: datos.imagen,
      descripcion: datos.descripcion,
      fechaCreacion: new Date().toISOString()
    });
  }

  if (!guardarPersonajes()) {
    personajes = copia;
    return;
  }

  mostrarAviso(estabaEditando ? 'Cambios guardados.' : 'Personaje agregado.');
  renderizarGrid();

  if (estabaEditando) renderizarDetalle(estabaEditando);
  else mostrarVista('grid');
}


// ---------- 9. Eliminar ----------

function eliminarPersonaje(id) {
  const personaje = personajes.find((p) => p.id === id);
  if (!personaje) return;

  const confirmado = confirm('¿Eliminar a ' + personaje.nombre + '? Esta acción no se puede deshacer.');
  if (!confirmado) return;

  const copia = personajes.slice();
  // Armo una lista nueva con todos menos el que se elimina
  const restantes = [];
  for (let i = 0; i < personajes.length; i++) {
    if (personajes[i].id !== id) {
      restantes.push(personajes[i]);
    }
  }
  personajes = restantes;

  if (!guardarPersonajes()) {
    personajes = copia;
    return;
  }

  mostrarAviso('Personaje eliminado.');
  renderizarGrid();
  mostrarVista('grid');
}


// ---------- 10. Inicio ----------

function iniciar() {
  personajes = cargarPersonajes();
  guardarPersonajes();

  buscador.addEventListener('input', renderizarGrid);   // filtra mientras escribes
  $('#btn-agregar').addEventListener('click', () => abrirFormulario());
  $('#btn-cancelar').addEventListener('click', () => mostrarVista('grid'));
  formulario.addEventListener('submit', guardarFormulario);

  renderizarGrid();
  mostrarVista('grid');
}

document.addEventListener('DOMContentLoaded', iniciar);
