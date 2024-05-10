import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import Router from './routes/index.js';

const app = express();
const port = 3030;

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

app.use(Router);

app.all('*', (req, res) => res.status(404).send(`method ${req.method} dengan endpoint ${req.path} tidak tersedia`))

app.listen(port, () => console.log(`Server running on port:${port}`));

export default app;
