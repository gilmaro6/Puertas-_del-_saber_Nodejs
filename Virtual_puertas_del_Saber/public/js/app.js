// public/js/app.js — Panel autenticado de Virtual Puertas del Saber

const token = localStorage.getItem('vpds_token');
const usuarioRaw = localStorage.getItem('vpds_usuario');

// ===== GUARDIA DE AUTENTICACIÓN =====
if (!token || !usuarioRaw) {
  window.location.href = 'index.html';
}
const usuario = JSON.parse(usuarioRaw);

document.getElementById('app-user-nombre').textContent = usuario.nombre;
document.getElementById('app-user-rol').textContent = usuario.rol;
if (usuario.rol === 'admin') {
  document.querySelectorAll('.admin-only').forEach((el) => (el.style.display = ''));
}

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('vpds_token');
  localStorage.removeItem('vpds_usuario');
  window.location.href = 'index.html';
});

// ===== FETCH AUTENTICADO (maneja 401 expulsando al login) =====
async function apiFetch(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opciones.headers || {}),
    },
  });

  if (respuesta.status === 401) {
    localStorage.removeItem('vpds_token');
    localStorage.removeItem('vpds_usuario');
    window.location.href = 'index.html';
    return null;
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json();
  if (!respuesta.ok) {
    throw new Error((datos && datos.mensaje) || 'Ocurrió un error.');
  }
  return datos;
}

function mostrarAlerta(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('app-alerta-global');
  contenedor.innerHTML = `<div class="app-alerta ${tipo}">${mensaje}</div>`;
  setTimeout(() => (contenedor.innerHTML = ''), 4000);
}

// ===== NAVEGACIÓN DE PESTAÑAS =====
const tabs = document.querySelectorAll('.app-tab');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.app-view').forEach((v) => (v.style.display = 'none'));
    document.getElementById(`tab-${tab.dataset.tab}`).style.display = '';

    if (tab.dataset.tab === 'catalogo') cargarCatalogo();
    if (tab.dataset.tab === 'mis-transacciones') cargarMisTransacciones();
    if (tab.dataset.tab === 'admin-libros') cargarAdminLibros();
    if (tab.dataset.tab === 'admin-usuarios') cargarAdminUsuarios();
  });
});

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

// ===== CATÁLOGO =====
function renderLibroCard(libro, { modoAdmin = false } = {}) {
  const div = document.createElement('div');
  div.className = 'book-card';
  const sinStock = libro.stock <= 0;

  div.innerHTML = `
    <h4>${libro.titulo}</h4>
    <div class="autor">${libro.autor}</div>
    <div class="meta"><span class="tag">${libro.genero}</span><span class="tag">${libro.categoria}</span></div>
    <div class="precios">Compra: ${formatoMoneda(libro.precio_compra)} · Alquiler: ${formatoMoneda(libro.precio_alquiler)}</div>
    <div class="stock">Stock: ${libro.stock}</div>
    <div class="acciones">
      ${
        modoAdmin
          ? `<button class="btn-alquilar" data-accion="eliminar" data-id="${libro.id}">Eliminar</button>`
          : `<button class="btn-comprar" data-accion="compra" data-id="${libro.id}" ${sinStock ? 'disabled' : ''}>Comprar</button>
             <button class="btn-alquilar" data-accion="alquiler" data-id="${libro.id}" ${sinStock ? 'disabled' : ''}>Alquilar</button>
             <button class="btn-prestar" data-accion="prestamo" data-id="${libro.id}" ${sinStock ? 'disabled' : ''}>Pedir prestado</button>`
      }
    </div>
  `;
  return div;
}

async function cargarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  grid.innerHTML = '<p class="vacio">Cargando catálogo...</p>';
  try {
    const q = document.getElementById('catalogo-buscar').value.trim();
    const libros = await apiFetch(`/api/libros${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    grid.innerHTML = '';
    if (!libros || libros.length === 0) {
      grid.innerHTML = '<p class="vacio">No hay libros que coincidan con tu búsqueda.</p>';
      return;
    }
    libros.forEach((libro) => grid.appendChild(renderLibroCard(libro)));
  } catch (error) {
    grid.innerHTML = `<p class="vacio">${error.message}</p>`;
  }
}

document.getElementById('catalogo-buscar').addEventListener('input', () => {
  clearTimeout(window._buscarTimeout);
  window._buscarTimeout = setTimeout(cargarCatalogo, 350);
});

document.getElementById('catalogo-grid').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;
  const { accion, id } = boton.dataset;

  boton.disabled = true;
  try {
    await apiFetch('/api/transacciones', {
      method: 'POST',
      body: JSON.stringify({ usuario_id: usuario.id, libro_id: Number(id), tipo: accion }),
    });
    mostrarAlerta('¡Transacción registrada correctamente!');
    cargarCatalogo();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
    boton.disabled = false;
  }
});

// ===== MIS TRANSACCIONES =====
async function cargarMisTransacciones() {
  const cuerpo = document.getElementById('mis-transacciones-body');
  cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">Cargando...</td></tr>';
  try {
    const transacciones = await apiFetch(`/api/transacciones?usuario_id=${usuario.id}`);
    cuerpo.innerHTML = '';
    if (!transacciones || transacciones.length === 0) {
      cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">Todavía no tienes transacciones.</td></tr>';
      return;
    }
    transacciones.forEach((t) => {
      const fila = document.createElement('tr');
      const puedeDevolver = t.estado === 'activa' && t.tipo !== 'compra';
      fila.innerHTML = `
        <td>${t.libro_titulo}</td>
        <td>${t.tipo}</td>
        <td>${formatoMoneda(t.monto)}</td>
        <td>${t.fecha_limite ? new Date(t.fecha_limite).toLocaleDateString('es-CO') : '—'}</td>
        <td><span class="estado-pill estado-${t.estado}">${t.estado}</span></td>
        <td>${puedeDevolver ? `<button data-id="${t.id}">Marcar devuelto</button>` : ''}</td>
      `;
      cuerpo.appendChild(fila);
    });
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="6" class="vacio">${error.message}</td></tr>`;
  }
}

document.getElementById('mis-transacciones-body').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button[data-id]');
  if (!boton) return;
  try {
    await apiFetch(`/api/transacciones/${boton.dataset.id}/devolucion`, { method: 'PATCH' });
    mostrarAlerta('Devolución registrada.');
    cargarMisTransacciones();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
  }
});

// ===== ADMIN: LIBROS =====
async function cargarAdminLibros() {
  const grid = document.getElementById('admin-libros-grid');
  grid.innerHTML = '<p class="vacio">Cargando...</p>';
  try {
    const libros = await apiFetch('/api/libros');
    grid.innerHTML = '';
    libros.forEach((libro) => grid.appendChild(renderLibroCard(libro, { modoAdmin: true })));
  } catch (error) {
    grid.innerHTML = `<p class="vacio">${error.message}</p>`;
  }
}

document.getElementById('form-nuevo-libro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await apiFetch('/api/libros', {
      method: 'POST',
      body: JSON.stringify({
        titulo: document.getElementById('nl-titulo').value,
        autor: document.getElementById('nl-autor').value,
        genero: document.getElementById('nl-genero').value,
        categoria: document.getElementById('nl-categoria').value,
        precio_compra: Number(document.getElementById('nl-precio-compra').value || 0),
        precio_alquiler: Number(document.getElementById('nl-precio-alquiler').value || 0),
        stock: Number(document.getElementById('nl-stock').value || 1),
      }),
    });
    mostrarAlerta('Libro agregado al catálogo.');
    evento.target.reset();
    cargarAdminLibros();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
  }
});

document.getElementById('admin-libros-grid').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button[data-accion="eliminar"]');
  if (!boton) return;
  if (!confirm('¿Eliminar este libro del catálogo?')) return;
  try {
    await apiFetch(`/api/libros/${boton.dataset.id}`, { method: 'DELETE' });
    mostrarAlerta('Libro eliminado.');
    cargarAdminLibros();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
  }
});

// ===== ADMIN: USUARIOS =====
async function cargarAdminUsuarios() {
  const cuerpo = document.getElementById('admin-usuarios-body');
  cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">Cargando...</td></tr>';
  try {
    const usuarios = await apiFetch('/api/usuarios');
    cuerpo.innerHTML = '';
    usuarios.forEach((u) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td>${u.num_visitas}</td>
        <td>${new Date(u.fecha_registro).toLocaleDateString('es-CO')}</td>
        <td>${u.id !== usuario.id ? `<button data-id="${u.id}">Eliminar</button>` : ''}</td>
      `;
      cuerpo.appendChild(fila);
    });
  } catch (error) {
    cuerpo.innerHTML = `<tr><td colspan="6" class="vacio">${error.message}</td></tr>`;
  }
}

document.getElementById('admin-usuarios-body').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button[data-id]');
  if (!boton) return;
  if (!confirm('¿Eliminar este usuario?')) return;
  try {
    await apiFetch(`/api/usuarios/${boton.dataset.id}`, { method: 'DELETE' });
    mostrarAlerta('Usuario eliminado.');
    cargarAdminUsuarios();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
  }
});

// ===== CARGA INICIAL =====
cargarCatalogo();
