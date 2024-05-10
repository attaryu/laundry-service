import express from 'express';

import {
  deleteSpecificUserController,
  editUserController,
  getAllUserController,
  getSpecificUserController,
} from '../controllers/user.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const userRouter = express.Router();

userRouter.route('/user')
  .get(getAllUserController)
  .all(methodNotAllowed);

userRouter.route('/user/:userId')
  .get(getSpecificUserController)
  .put(editUserController)
  .delete(deleteSpecificUserController)
  .all(methodNotAllowed);

export default userRouter;
