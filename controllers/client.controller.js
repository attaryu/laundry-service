const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const {
  createClientService,
  deleteClientService,
  editClientService,
  getAllClientService,
  getNameClientService,
  getSpecificClientService
} = require('../services/client.service');

async function createClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await createClientService(token, req.body);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getAllClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getAllClientService(req.query);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function getSpecificClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getSpecificClientService(req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function editClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await editClientService(token, req.body, req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

async function deleteClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await deleteClientService({
      requestToken: token,
      params: req.params,
    });
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

async function getNameClientController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getNameClientService();
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

module.exports = {
  createClientController,
  getAllClientController,
  getSpecificClientController,
  editClientController,
  deleteClientController,
  getNameClientController,
}
