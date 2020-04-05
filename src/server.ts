import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// chat implementation libraries
import http from 'http';
import io from 'socket.io';

import { userRouter } from './routes';
import { CLIENT_URL, DB_URL } from './utils/config';

// express handles routing and functionality
// http manages server
const expressApp = express();

// web server on top of express
const httpServer = new http.Server(expressApp);
const ioService = io(httpServer);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: CLIENT_URL,
  preflightContinue: false,
};

expressApp.use(cors(options));
expressApp.use(bodyParser.json());
expressApp.use(express.urlencoded({ extended: true }));

expressApp.use(userRouter);

expressApp.get('/', (req, res) => {
  res.send('Hello world');
});

expressApp.options('*', cors(options));

export { httpServer as app };
