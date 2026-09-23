// ===== REGISTRO DE USUARIO (conectado a la API) =====
const formRegistro = document.getElementById('form-registro');
const mensajeRegistro = document.getElementById('registro-mensaje');

if (formRegistro) {
  formRegistro.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById('registro-nombre').value.trim();
    const email = document.getElementById('registro-email').value.trim();
    const password = document.getElementById('registro-password').value;

    mensajeRegistro.textContent = 'Registrando...';
    mensajeRegistro.className = 'registro-mensaje';

    try {
      const respuesta = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No fue posible completar el registro.');
      }

      mensajeRegistro.textContent = `¡Bienvenido/a, ${datos.nombre}! Tu cuenta fue creada correctamente.`;
      mensajeRegistro.className = 'registro-mensaje exito';
      formRegistro.reset();
    } catch (error) {
      mensajeRegistro.textContent = error.message;
      mensajeRegistro.className = 'registro-mensaje error';
    }
  });
}

// ===== INICIO DE SESIÓN (conectado a la API) =====
const formLogin = document.getElementById('form-login');
const mensajeLogin = document.getElementById('login-mensaje');

if (formLogin) {
  formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    mensajeLogin.textContent = 'Ingresando...';
    mensajeLogin.className = 'registro-mensaje';

    try {
      const respuesta = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No fue posible iniciar sesión.');
      }

      // Guarda el token para futuras peticiones autenticadas (catálogo, compras, préstamos)
      localStorage.setItem('vpds_token', datos.token);
      localStorage.setItem('vpds_usuario', JSON.stringify(datos.usuario));

      mensajeLogin.textContent = `¡Hola de nuevo, ${datos.usuario.nombre}! Entrando...`;
      mensajeLogin.className = 'registro-mensaje exito';
      formLogin.reset();
      setTimeout(() => { window.location.href = 'app.html'; }, 600);
    } catch (error) {
      mensajeLogin.textContent = error.message;
      mensajeLogin.className = 'registro-mensaje error';
    }
  });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach((q) => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');

    // Cerrar todos los demás
    document.querySelectorAll('.faq-item').forEach((i) => {
      i.classList.remove('open');
    });

    // Abrir el actual solo si estaba cerrado
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});
