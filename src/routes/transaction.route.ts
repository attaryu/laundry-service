import express from 'express';

import {
  cancelTransactionController,
  changeStatusTransactionController,
  createTransactionController,
  getAllTransactionController,
  getSpecificTransactionController,
  paidOffTransactionController,
} from '../controllers/transaction.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

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

export default transactionRouter;
