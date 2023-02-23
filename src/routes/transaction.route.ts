import express from 'express';

import { createTransactionController } from '../controllers/transaction.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const transactionRouter = express.Router();

transactionRouter.route('/transaction')
  .post(createTransactionController)
  .all(methodNotAllowed);

export default transactionRouter;
