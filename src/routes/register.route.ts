import express from 'express';

import { registerController } from '../controllers/register.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const registerRouter = express.Router();

registerRouter.route('/register')
  .post(registerController)
  .all(methodNotAllowed);

export default registerRouter;
