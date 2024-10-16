const express = require('express');
const app = express();
const admin = require('./config/firebase'); //Firebase desde config
const db = admin.firestore();


app.use(express.json());
app.get('/', (req, res) => {
    res.send('Bienvenido al sistema de reservas de salas');
});

// GET: Lista todos los usuarios desde Firestore, se agrego un try/catch para capturar errores y devolver repuesta adecada en caso de fallo.
app.get('/usuarios', async (req, res) => {
    try {
        const snapshot = await db.collection('usuarios').get();
        const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(usuarios);
    } catch (error) {
        res.status(500).send('Error al obtener los usuarios');
    }
});

// GET: Lista todas las salas desde Firestore
app.get('/salas', async (req, res) => {
    try {
        const snapshot = await db.collection('salas').get();
        const salas = snapshot.docs.map(doc => {
            const data = doc.data();
            //se cambio el "true" y el "false" por sala disponible o no disponible.
            data.disponibilidad = data.disponibilidad === true ? 'sala disponible' : 'sala no disponible';
            return { id: doc.id, ...data };
        });
        res.json(salas);
    } catch (error) {
        res.status(500).send('Error al obtener las salas');
    }
});

// GET: Lista la info de un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
    const doc = await db.collection('usuarios').doc(req.params.id).get();
    if (!doc.exists) {
        return res.status(404).send('Usuario no encontrado');
    }
    res.json({ id: doc.id, ...doc.data() });
});

// GET: Obtener info de una sala específica por ID
app.get('/salas/:id', async (req, res) => {
    const doc = await db.collection('salas').doc(req.params.id).get();
    if (!doc.exists) {
        return res.status(404).send('Sala no encontrada');
    }
    res.json({ id: doc.id, ...doc.data() });
});

// POST: Crear nuevo usuario en Firestore
app.post('/usuarios', async (req, res) => {
    const nuevoUsuario = req.body;
    const docRef = await db.collection('usuarios').add(nuevoUsuario);
    res.status(201).json({ id: docRef.id, ...nuevoUsuario });
});

// POST: Agregar nueva sala en Firestore
app.post('/salas', async (req, res) => {
    const nuevaSala = req.body;
    const docRef = await db.collection('salas').add(nuevaSala);
    res.status(201).json({ id: docRef.id, ...nuevaSala });
});

// PUT: Actualizar información de usuario en Firestore
app.put('/usuarios/:id', async (req, res) => {
    const usuarioActualizado = req.body;
    const docRef = db.collection('usuarios').doc(req.params.id);
    await docRef.update(usuarioActualizado);
    res.json({ id: req.params.id, ...usuarioActualizado });
});

// PUT: Actualizar información de sala en Firestore
app.put('/salas/:id', async (req, res) => {
    const salaActualizada = req.body;
    const docRef = db.collection('salas').doc(req.params.id);
    await docRef.update(salaActualizada);
    res.json({ id: req.params.id, ...salaActualizada });
});

// DELETE: Eliminar un usuario de Firestore
app.delete('/usuarios/:id', async (req, res) => {
    const docRef = db.collection('usuarios').doc(req.params.id);
    await docRef.delete();
    res.json({ message: 'Usuario eliminado' });
});

// DELETE: Eliminar una sala de Firestore
app.delete('/salas/:id', async (req, res) => {
    const docRef = db.collection('salas').doc(req.params.id);
    await docRef.delete();
    res.json({ message: 'Sala eliminada' });
});

//5 NUEVOS ENDPOINTS
//Se añadio un endpoints extra de reservacion. +1
//POST: Bloquear o inhabilitar una sala por ID
app.post('/salas/:id/bloquear', async (req, res) => {
    const docRef = db.collection('salas').doc(req.params.id);
    const sala = await docRef.get();
    
    if (!sala.exists) {
        return res.status(404).send('Sala no encontrada');
    }

    //Actualizamos el estado de la sala como "inhabilitada"
    await docRef.update({ disponibilidad: 'inhabilitada' });
    res.json({ message: 'Sala inhabilitada por mantención u otras razones' });
});

//GET: Obtener la disponibilidad de una sala por ID
app.get('/salas/:id/disponibilidad', async (req, res) => {
    const doc = await db.collection('salas').doc(req.params.id).get();
    
    if (!doc.exists) {
        return res.status(404).send('Sala no encontrada');
    }
    
    const data = doc.data();
    let estado;

    //estado de la disponibilidad de la sala
    if (data.disponibilidad === 'inhabilitada') {
        estado = 'Sala inhabilitada';
    } else if (data.ocupada === true) {
        estado = 'Sala ocupada';
    } else {
        estado = 'Sala disponible';
    }

    res.json({ id: doc.id, disponibilidad: estado });
});

//GET:Obtener todas las reservaciones
app.get('/reservacion', async (req, res) => {
    const snapshot = await db.collection('reservaciones').get();
    const reservaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reservaciones);
});

//POST:Calificar una sala
app.post('/salas/:id/calificar', async (req, res) => {
    const calificacion = req.body;
    const docRef = db.collection('salas').doc(req.params.id).collection('calificaciones').add(calificacion);
    
    res.status(201).json({ message: 'Calificación agregada', calificacion: calificacion });
});

//POST: Enviar un reclamo o reporte sobre una sala
app.post('/salas/:id/reporte', async (req, res) => {
    const reporte = req.body;
    const docRef = db.collection('salas').doc(req.params.id).collection('reportes').add(reporte);
    
    res.status(201).json({ message: 'Reporte agregado', reporte: reporte });
});

//POST: Crear una nueva reservación
app.post('/reservacion', async (req, res) => {
    try {
        const nuevaReservacion = req.body;
        const docRef = await db.collection('reservaciones').add(nuevaReservacion);
        res.status(201).json({ id: docRef.id, ...nuevaReservacion });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la reservación', error: error.message });
    }
});























// Servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
