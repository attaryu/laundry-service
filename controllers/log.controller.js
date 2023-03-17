const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const {
  getAllLogService
} = require('../services/log.service');

async function getAllLogController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getAllLogService(token);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

module.exports = { getAllLogController }
