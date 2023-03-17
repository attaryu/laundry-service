const express = require('express');

const {
  graphController,
  totalDataController,
  incomeController,
} = require('../controllers/analytic.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const analyticRouter = express.Router();

analyticRouter
  .route('/analytic/transaction/graph')
  .get(graphController)
  .all(methodNotAllowed);

analyticRouter.route('/analytic/total-data')
  .get(totalDataController)
  .all(methodNotAllowed);

analyticRouter.route('/analytic/income')
  .get(incomeController)
  .all(methodNotAllowed);

module.exports = analyticRouter;
