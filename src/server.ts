import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// Librerias que implementan el sistema de chat
import http from 'http';
import io from 'socket.io';

// manejadores de rutas
import { userRouter, groupRouter, meetingRouter } from './routes';
import { CLIENT_URL, DB_URL } from './utils/config';

// express maneja el ruteo y la funcionalida del servidor
// http administra el servidor por encima, encapsulando express
// esto es para que socket.io pueda agarrarse al servidor http
const expressApp = express();
const httpServer = new http.Server(expressApp);
const ioService = io(httpServer);

// conectar a la db mongo
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// opciones de conexion cors (cross origin resource sharing)
// cors es una forma de seguridad que no da acceso a request que no sean GET
// y se tiene que poner explicitamente a quien si se le da permiso y que metodos
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
    'Access-Control-Allow-Origin',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: CLIENT_URL,
  preflightContinue: false,
};

// middleware que intercepta todos los requests
expressApp.use(cors(options));
expressApp.use(bodyParser.json());
expressApp.use(express.urlencoded({ extended: true }));

expressApp.use(userRouter);
expressApp.use(groupRouter);
expressApp.use(meetingRouter);

// servicio de chat mediante sockets
// al conectarse un socket
ioService.on('connection', (socket) => {
  console.log('Connected');

  // si manda "join-room", asignarlo a un room especifico
  socket.on('join-room', (room) => {
    console.log('Joined room ', room);
    if (!socket.rooms[room]) {
      socket.join(room);
    }

    // si un socket entra a un room agregarle un listener para que
    // cuando manda "message", emitir el dato enviado a los demas en el room
    socket.on('message', (data) => {
      console.log(socket.rooms, data);
      socket.in(room).emit('message', data);
    });
  });
});

expressApp.options('*', cors());

export { httpServer as app };
