import express from 'express';

import {
  deleteMuplipleUserController,
  deleteSpecificUserController,
  editUserController,
  getAllUserController,
  getSpecificUserController,
} from '../controllers/user.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const userRouter = express.Router();

userRouter.route('/user')
  .get(getAllUserController)
  .delete(deleteMuplipleUserController)
  .all(methodNotAllowed);

userRouter.route('/user/:userId')
  .get(getSpecificUserController)
  .put(editUserController)
  .delete(deleteSpecificUserController)
  .all(methodNotAllowed);

export default userRouter;
