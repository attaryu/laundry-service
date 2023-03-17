const express = require('express');

const {
  generateNewRequestTokenController,
  loginController,
  logoutUserController,
} = require('../controllers/login.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const loginRouter = express.Router();

loginRouter.route('/login')
  .get(generateNewRequestTokenController)
  .post(loginController)
  .delete(logoutUserController)
  .all(methodNotAllowed);

module.exports = loginRouter;
