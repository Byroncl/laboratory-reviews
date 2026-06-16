const express = require('express');
const path = require('path');

const app = express();
const PORT = 4200;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Para Angular SPA - redirigir todas las rutas a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend corriendo en http://0.0.0.0:${PORT}`);
});
