import express from 'express';

import clientRouter from './client.route.js';
import loginRouter from './login.route.js';
import outletRouter from './outlet.route.js';
import packageRouter from './package.route.js';
import registerRouter from './register.route.js';
import transactionRouter from './transaction.route.js';
import userRouter from './user.route.js';

const Router = express.Router();

Router.use(clientRouter);
Router.use(loginRouter);
Router.use(outletRouter);
Router.use(packageRouter);
Router.use(registerRouter);
Router.use(transactionRouter);
Router.use(userRouter);

export default Router;
