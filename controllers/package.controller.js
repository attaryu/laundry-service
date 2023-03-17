const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const {
  createPackageService,
  deletePackageService,
  editPackageService,
  getAllPackageService,
  getNamePackageService,
  getSpecificPackageService,
} = require('../services/package.service');

async function createPackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await createPackageService({
      requestToken: token,
      body: req.body,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getAllPackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getAllPackageService(req.query);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getSpecificPackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getSpecificPackageService(req.params);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function editPackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await editPackageService(token, req.body, req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function deletePackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await deletePackageService({
      requestToken: token,
      params: req.params
    });
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getNamePackageController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getNamePackageService(token);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

module.exports = {
  createPackageController,
  getAllPackageController,
  getSpecificPackageController,
  editPackageController,
  deletePackageController,
  getNamePackageController,
}
