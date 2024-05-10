import express from 'express';

import clientRouter from './client.route.js';
import emailRouter from './email.route.js';
import analyticRouter from './analytic.route.js';
import logRouter from './log.route.js';
import loginRouter from './login.route.js';
import outletRouter from './outlet.route.js';
import packageRouter from './package.route.js';
import registerRouter from './register.route.js';
import reportRouter from './report.route.js';
import transactionRouter from './transaction.route.js';
import userRouter from './user.route.js';

const Router = express.Router();

Router.use(clientRouter);
Router.use(loginRouter);
Router.use(outletRouter);
Router.use(packageRouter);
Router.use(registerRouter);
Router.use(transactionRouter);
Router.use(emailRouter);
Router.use(logRouter);
Router.use(analyticRouter);
Router.use(reportRouter);
Router.use(userRouter);

export default Router;
