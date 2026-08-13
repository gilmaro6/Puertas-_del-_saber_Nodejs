// server.js (arranque)
const app = require('./src/app');
const { verificarConexion } = require('./src/config/database');

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, async () => {
  console.log(`🚀 Servidor Virtual Puertas del Saber corriendo en http://localhost:${PUERTO}`);
  await verificarConexion();
});
