const express = require('express');

const {
  archiveEmailController,
  cancelEmailController,
  createEmailController,
  getAllEmailController,
  getSpecificEmailController,
  readEmailController,
} = require('../controllers/email.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const emailRouter = express.Router();

emailRouter.route('/email')
  .get(getAllEmailController)
  .post(createEmailController)
  .all(methodNotAllowed);
  
emailRouter.route('/email/:emailId')
  .get(getSpecificEmailController)
  .delete(cancelEmailController)
  .all(methodNotAllowed);

emailRouter.route('/email/:emailId/archive/:archive')
  .put(archiveEmailController)
  .all(methodNotAllowed);

emailRouter.route('/email/:emailId/read/:reader')
  .put(readEmailController)
  .all(methodNotAllowed);

module.exports = emailRouter;
