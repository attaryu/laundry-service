const { serverErrorHandler } = require('../lib/handlerReuse.js');
const { verifyRequestToken } = require('../lib/responseReuse.js');
const {
  deleteUserService,
  editUserService,
  getAllUserService,
  getSpecificUserService,
} = require('../services/user.service.js');

async function getAllUserController(req, res) {
  const payloads = verifyRequestToken(req.headers.authorization?.split(' ')[1]);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getAllUserService(req.query);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.log(error);

    return serverErrorHandler(res);
  }
}

async function getSpecificUserController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getSpecificUserService(req.params);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

async function editUserController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await editUserService({
      requestToken: token,
      body: req.body,
      params: req.params,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

async function deleteSpecificUserController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await deleteUserService({
      requestToken: token,
      params: req.params,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

module.exports = {
  getAllUserController,
  getSpecificUserController,
  editUserController,
  deleteSpecificUserController,
}
