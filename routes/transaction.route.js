const express = require('express');

const {
  cancelTransactionController,
  changeStatusTransactionController,
  createTransactionController,
  getAllTransactionController,
  getSpecificTransactionController,
  paidOffTransactionController,
} = require('../controllers/transaction.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const transactionRouter = express.Router();

transactionRouter.route('/transaction')
  .get(getAllTransactionController)
  .post(createTransactionController)
  .all(methodNotAllowed);
  
transactionRouter.route('/transaction/:kode_invoice')
  .get(getSpecificTransactionController)
  .delete(cancelTransactionController)
  .all(methodNotAllowed);

transactionRouter.route('/transaction/:kode_invoice/status')
  .put(changeStatusTransactionController)
  .all(methodNotAllowed);

transactionRouter.route('/transaction/:kode_invoice/bill/:paid_off')
  .put(paidOffTransactionController)
  .all(methodNotAllowed);

module.exports = transactionRouter;
