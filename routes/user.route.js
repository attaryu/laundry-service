const express = require('express');

const {
  deleteSpecificUserController,
  editUserController,
  getAllUserController,
  getSpecificUserController,
} = require('../controllers/user.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const userRouter = express.Router();

userRouter.route('/user')
  .get(getAllUserController)
  .all(methodNotAllowed);

userRouter.route('/user/:userId')
  .get(getSpecificUserController)
  .put(editUserController)
  .delete(deleteSpecificUserController)
  .all(methodNotAllowed);

module.exports = userRouter;
