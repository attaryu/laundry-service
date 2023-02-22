import express from 'express';

import loginRouter from './login.route.js';
import outletRouter from './outlet.route.js';
import registerRouter from './register.route.js';
import userRouter from './user.route.js';

const Router = express.Router();

Router.use(loginRouter);
Router.use(outletRouter);
Router.use(registerRouter);
Router.use(userRouter);

export default Router;
