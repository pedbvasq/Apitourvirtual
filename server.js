const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para sesiones
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/videos', express.static(path.join(__dirname, 'src', 'videos')));
app.use('/images', express.static(path.join(__dirname, 'src', 'images')));

// Ruta para la raíz
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Ruta para login
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        res.redirect('/administrador');
    } else {
        const error = req.query.error ? req.query.error : '';
        res.sendFile(path.join(__dirname, 'src', 'public', 'login.html'));
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile(path.join(__dirname, 'src', 'users.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer los datos de usuario' });
        } else {
            let users;
            try {
                users = JSON.parse(data);
            } catch (parseError) {
                return res.status(500).json({ error: 'Error al parsear los datos de usuario' });
            }

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                req.session.user = user;
                res.redirect('/administrador');
            } else {
                res.redirect('/login?error=Usuario o contraseña incorrectos');
            }
        }
    });
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ error: 'Error al cerrar sesión' });
        } else {
            res.redirect('/login');
        }
    });
});

// Ruta para administrador
app.get('/administrador', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// Middleware para verificar autenticación
function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Configuración del almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, path.join(__dirname, 'src', 'videos'));
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, path.join(__dirname, 'src', 'images'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Rutas CRUD para títulos
let titles = {
    1: "Título del Video 1",
    2: "Título del Video 2",
};

app.get('/api/titles', checkAuth, (req, res) => {
    res.json(titles);
});

app.get('/api/titles/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const title = titles[id];
    if (title) {
        res.json({ id, title });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

app.post('/api/titles', checkAuth, (req, res) => {
    const newId = Object.keys(titles).length + 1;
    const newTitle = req.body.title;
    titles[newId] = newTitle;
    res.json({ id: newId, title: newTitle });
});

app.put('/api/titles/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const newTitle = req.body.title;
    if (titles[id]) {
        titles[id] = newTitle;
        res.json({ id, title: newTitle });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

app.delete('/api/titles/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    if (titles[id]) {
        delete titles[id];
        res.json({ id });
    } else {
        res.status(404).json({ error: "Título no encontrado" });
    }
});

// Rutas CRUD para videos
app.get('/api/videos', checkAuth, (req, res) => {
    fs.readdir(path.join(__dirname, 'src', 'videos'), (err, files) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el directorio de videos' });
        } else {
            res.json(files);
        }
    });
});

app.post('/api/videos', checkAuth, upload.single('video'), (req, res) => {
    res.json({ filename: req.file.filename });
});

app.delete('/api/videos/:filename', checkAuth, (req, res) => {
    const filename = req.params.filename;
    fs.unlink(path.join(__dirname, 'src', 'videos', filename), (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar el video' });
        } else {
            res.json({ filename });
        }
    });
});

// Rutas CRUD para imágenes
app.get('/api/images', checkAuth, (req, res) => {
    fs.readdir(path.join(__dirname, 'src', 'images'), (err, files) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el directorio de imágenes' });
        } else {
            res.json(files);
        }
    });
});

app.post('/api/images', checkAuth, upload.single('image'), (req, res) => {
    res.json({ filename: req.file.filename });
});

app.delete('/api/images/:filename', checkAuth, (req, res) => {
    const filename = req.params.filename;
    fs.unlink(path.join(__dirname, 'src', 'images', filename), (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar la imagen' });
        } else {
            res.json({ filename });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
