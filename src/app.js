const express =require('express');
const app =express();
const productoRoutes =require('./routes/productoRoutes');
const path = require('path');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.listen(3000,() => {
    console.log('Servidor corriendo en http://localhost:3000');
});