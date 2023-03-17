const express = require('express');

const {
  createClientController,
  deleteClientController,
  editClientController,
  getAllClientController,
  getNameClientController,
  getSpecificClientController
} = require('../controllers/client.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const clientRouter = express.Router();

clientRouter.route('/customer')
  .post(createClientController)
  .get(getAllClientController)
  .all(methodNotAllowed);
  
clientRouter.route('/customer/name')
  .get(getNameClientController)
  .all(methodNotAllowed);
  
clientRouter.route('/customer/:customerId')
  .get(getSpecificClientController)
  .put(editClientController)
  .delete(deleteClientController)
  .all(methodNotAllowed);

module.exports = clientRouter;
