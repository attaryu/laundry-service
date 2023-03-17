const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { setHeaderCookies } = require('./middlewares/setHeader');
const Router = require('./routes');

const app = express();
const port = 3030;

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

app.use(setHeaderCookies);
app.use(Router);
app.all('*', (req, res) => res.status(404).send(`method ${req.method} dengan endpoint ${req.path} tidak tersedia`))

app.listen(port, () => console.log(`Server running on port:${port}`));

module.exports = app;
