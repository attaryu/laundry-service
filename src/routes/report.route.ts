import express from 'express';

import {
  generateTransactionReportController,
} from '../controllers/report.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const reportRouter = express.Router();

reportRouter.route('/report/transaction')
  .get(generateTransactionReportController)
  .all(methodNotAllowed);

export default reportRouter;
