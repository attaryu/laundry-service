const express = require('express');

const {
  createPackageController,
  deletePackageController,
  editPackageController,
  getAllPackageController,
  getSpecificPackageController,
  getNamePackageController,
} = require('../controllers/package.controller');
const { methodNotAllowed } = require('../lib/handlerReuse');

const packageRouter = express.Router();

packageRouter.route('/package/name')
  .get(getNamePackageController)
  .all(methodNotAllowed);

packageRouter.route('/package/:paketId')
  .get(getSpecificPackageController)
  .put(editPackageController)
  .delete(deletePackageController)
  .all(methodNotAllowed);


packageRouter.route('/package')
  .get(getAllPackageController)
  .post(createPackageController)
  .all(methodNotAllowed);

module.exports = packageRouter;
