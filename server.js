import express from 'express';
import handlebars from 'express-handlebars';
import fetch from "node-fetch";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import session from "express-session";
import bCrypt from 'bcrypt';
import passport from "passport";
import { Strategy as LocalStrategy} from 'passport-local';

import prodRoutes from './routes/ProductRoutes.js';
import mensRoutes from './routes/MensajesRoutes.js';
import frontRoutes from './routes/FrontRoutes.js';

import {MONGO_URI} from './utils.js';
import User from './models/User.js';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
    	useUnifiedTopology: true,
    	useCreateIndex: true,
			useFindAndModify: false
    });
    console.log("Base de datos conectada");
		// Una vez conectado me conecto al socket porque este levanta al iniciar datos de la base
		connectSocket();
  } catch (err) {
    console.log(err.message);
  }
})();

const PORT = 8080;
const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(cookieParser())
app.use(
	session({
		store: MongoStore.create({
			mongoUrl: MONGO_URI,
			mongoOptions: {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		}),
		secret: 'clavesecreta',
		resave: false,
		saveUninitialized: false,
    rolling: true,
		cookie: { maxAge: 600 * 1000 },
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', frontRoutes);
app.use('/api/productos', prodRoutes);
app.use('/api/mensajes', mensRoutes);
app.get('*', function (req, res) { res.render('404'); });

app.engine('hbs', handlebars({
  extname: 'hbs',
  defaultLayout: 'layout.hbs'
}));
app.set("views", "./views");
app.set('view engine', 'hbs');

app.use(passport.initialize());
app.use(passport.session());

/* ------------------ PASSPORT -------------------- */
passport.use('register', new LocalStrategy(
	{ passReqToCallback: true }, (req, username, password, done) => {
    const findOrCreateUser = function() {
      User.findOne({ 'username': username }, (err, user) => {
        if (err) {
          console.log('Error de registro: ' + err);
          return done(err);
        }
        if (user) {
          console.log('Usuario existente');
          return done(null, false, console.log('message', 'El usuario ya existe.'));
        } else {
          const usuario = new User();
          usuario.username = username;
          usuario.password = createHash(password);

          usuario.save(function(err) {
            if (err) {
              console.log(`Error grabando al usuario ${user}`);
              throw err;
            }
            console.log('Usuario creado');
            return done(null, usuario);
          });
        }
      });
    }
    process.nextTick(findOrCreateUser);
	})
);

passport.use('login', new LocalStrategy(
	{ passReqToCallback: true }, (req, username, password, done) => {
    User.findOne({ 'username': username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				console.log('Usuario no encontrado');
				return done(
					null,
					false,
					console.log('message', 'Usuario no encontrado')
				);
			}
			if (!isValidPassword(user, password)) {
				console.log('Password invalido');
				return done(null, false, console.log('message', 'Password invalido'));
			}
      user.contador = 0
			return done(null, user);
		});
	})
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
	const usuario = User.findOne({ username: username }, (err, user) => {
		if (err) {
			return done('error');
		}
		return done(null, usuario);
	});
});




// Funcion que carga los productos y emite el llamado a "listProducts"
async function getProducts() {
	try {
		const response = await fetch("http://localhost:8080/api/productos");
		io.sockets.emit("listProducts", await response.json());
	} catch (err) {
		console.log(err);
	}
};

// Funcion que devuelve el listado de mensajes
async function getMensajes() {
	try {
		const response = await fetch("http://localhost:8080/api/mensajes");
		io.sockets.emit("listMensajes", await response.json());
	} catch (err) {
		console.log(err);
	}
};

function connectSocket() {
	io.on("connection", (socket) => {
		console.log("Nuevo cliente conectado!");
		getProducts();
		getMensajes();

		/* Escucho los mensajes enviado por el cliente y se los propago a todos */
		socket.on("postProduct", () => {
			getProducts();
		}).on("updateProduct", () => {
			getProducts();
		}).on("deleteProduct", () => {
			getProducts();
		}).on("postMensaje", data => {
			getMensajes();
		}).on('disconnect', () => {
			console.log('Usuario desconectado')
		});
	});
}

// Conexion a server con callback avisando de conexion exitosa
httpServer.listen(PORT, () => { console.log(`Ya me conecte al puerto ${PORT}.`); })
.on("error", (error) => console.log("Hubo un error inicializando el servidor.") );



const createHash = (password) => {
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

const isValidPassword = (user, password) => {
	return bCrypt.compareSync(password, user.password);
};