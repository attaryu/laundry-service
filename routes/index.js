const express = require('express');

const clientRouter = require('./client.route');
const emailRouter = require('./email.route');
const analyticRouter = require('./analytic.route');
const logRouter = require('./log.route');
const loginRouter = require('./login.route');
const outletRouter = require('./outlet.route');
const packageRouter = require('./package.route');
const registerRouter = require('./register.route');
const reportRouter = require('./report.route');
const transactionRouter = require('./transaction.route');
const userRouter = require('./user.route');

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

module.exports = Router;
