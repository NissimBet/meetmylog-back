import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import { userRouter } from './routes';
import { CLIENT_URL, DB_URL } from './utils/config';

const app = express();

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

app.use(cors(options));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.options('*', cors(options));

export { app };
