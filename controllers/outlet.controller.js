const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const {
  createOutletService,
  deleteOutletService,
  editOutletService,
  getAllOutletService,
  getSpecificOutletService,
  getNameOutletService,
} = require('../services/outlet.service');

async function createOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await createOutletService(token, req.body);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getAllOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getAllOutletService(req.query);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getSpecificOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getSpecificOutletService(req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function editOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await editOutletService(token, req.body, req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function deleteOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await deleteOutletService({
      requestToken: token,
      params: req.params,
    });
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

async function getNameOutletController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getNameOutletService();
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

module.exports = {
  createOutletController,
  getAllOutletController,
  getSpecificOutletController,
  editOutletController,
  deleteOutletController,
  getNameOutletController,
}
