const { createNewAccountService } = require('../services/register.service');
const { serverErrorHandler } = require('../lib/handlerReuse');

async function registerController(req, res) {
  try {
    const payloads = await createNewAccountService(req.body);

    return res.status(payloads.code).json(payloads);
  } catch (message) {
    console.log(message);

    return serverErrorHandler(res);
  }
}

module.exports = { registerController }
