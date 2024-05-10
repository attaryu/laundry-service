import express from 'express';

import {
  generateNewRequestTokenController,
  loginController,
  logoutUserController,
} from '../controllers/login.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const loginRouter = express.Router();

loginRouter.route('/login')
  .get(generateNewRequestTokenController)
  .post(loginController)
  .delete(logoutUserController)
  .all(methodNotAllowed);

export default loginRouter;
