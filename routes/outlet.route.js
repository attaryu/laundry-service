const express = require('express');

const {
  createOutletController,
  deleteOutletController,
  editOutletController,
  getAllOutletController,
  getSpecificOutletController,
  getNameOutletController,
} = require('../controllers/outlet.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const outletRouter = express.Router();

outletRouter.route('/outlet/nama')
  .get(getNameOutletController)
  .all(methodNotAllowed);

outletRouter.route('/outlet/:outletId')
  .get(getSpecificOutletController)
  .put(editOutletController)
  .delete(deleteOutletController)
  .all(methodNotAllowed);

outletRouter.route('/outlet')
  .post(createOutletController)
  .get(getAllOutletController)
  .all(methodNotAllowed);
  
  

module.exports = outletRouter;
