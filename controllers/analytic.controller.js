const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const { graphService, totalDataService, incomeService } = require('../services/analytic.service');

async function graphController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await graphService(token);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

async function totalDataController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await totalDataService(token);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

async function incomeController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await incomeService(token, req.query);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

module.exports = {
  graphController,
  totalDataController,
  incomeController,
}
