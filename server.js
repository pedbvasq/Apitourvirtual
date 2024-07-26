const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 3000;

// Configuración del almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, 'videos/');
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, 'images/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware para parsear JSON
app.use(express.json());

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Datos de ejemplo para títulos
let titles = {
    1: "Título del Video 1",
    2: "Título del Video 2",
};

// Rutas CRUD para títulos
app.get('/api/titles', (req, res) => {
    res.json(titles);
});

app.get('/api/titles/:id', (req, res) => {
    const id = req.params.id;
    const title = titles[id];
    if (title) {
        res.json({ id, title });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

app.post('/api/titles', (req, res) => {
    const newId = Object.keys(titles).length + 1;
    const newTitle = req.body.title;
    titles[newId] = newTitle;
    res.json({ id: newId, title: newTitle });
});

app.put('/api/titles/:id', (req, res) => {
    const id = req.params.id;
    const newTitle = req.body.title;
    if (titles[id]) {
        titles[id] = newTitle;
        res.json({ id, title: newTitle });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

app.delete('/api/titles/:id', (req, res) => {
    const id = req.params.id;
    if (titles[id]) {
        delete titles[id];
        res.json({ id });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

// Rutas CRUD para videos
app.get('/api/videos', (req, res) => {
    fs.readdir('videos', (err, files) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el directorio de videos' });
        } else {
            res.json(files);
        }
    });
});

app.post('/api/videos', upload.single('video'), (req, res) => {
    res.json({ filename: req.file.filename });
});

app.delete('/api/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    fs.unlink(path.join(__dirname, 'videos', filename), (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar el video' });
        } else {
            res.json({ filename });
        }
    });
});

// Rutas CRUD para imágenes
app.get('/api/images', (req, res) => {
    fs.readdir('images', (err, files) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el directorio de imágenes' });
        } else {
            res.json(files);
        }
    });
});

app.post('/api/images', upload.single('image'), (req, res) => {
    res.json({ filename: req.file.filename });
});

app.delete('/api/images/:filename', (req, res) => {
    const filename = req.params.filename;
    fs.unlink(path.join(__dirname, 'images', filename), (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar la imagen' });
        } else {
            res.json({ filename });
        }
    });
});

// Ruta para la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
