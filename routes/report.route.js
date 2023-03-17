const express = require('express');

const {
  generateTransactionReportController,
} = require('../controllers/report.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const reportRouter = express.Router();

reportRouter.route('/report/transaction')
  .get(generateTransactionReportController)
  .all(methodNotAllowed);

module.exports = reportRouter;
