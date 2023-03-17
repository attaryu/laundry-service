const express = require('express');

const {
  getAllLogController,
} = require('../controllers/log.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const logRouter = express.Router();

logRouter.route('/log')
  .get(getAllLogController)
  .all(methodNotAllowed);

module.exports = logRouter;
