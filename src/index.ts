import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import Router from './routes/index.js';

const app = express();
const port = 3030;

const server = http.createServer(app);
const io = new Server(server);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

app.use(Router);

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.all('*', (req, res) => res.status(404).send(`method ${req.method} dengan endpoint ${req.path} tidak tersedia`))

app.listen(port, () => console.log(`Server running on port:${port}`));
