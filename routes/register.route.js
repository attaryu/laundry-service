const express = require('express');

const { registerController } = require('../controllers/register.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const registerRouter = express.Router();

registerRouter.route('/register')
  .post(registerController)
  .all(methodNotAllowed);

module.exports = registerRouter;
