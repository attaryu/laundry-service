const { serverErrorHandler } = require('../lib/handlerReuse');
const { verifyRequestToken } = require('../lib/responseReuse');
const {
  generateTransactionReportService
} = require('../services/report.service');

async function generateTransactionReportController(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await generateTransactionReportService({
      requestToken: token,
      query: req.query,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

module.exports = { generateTransactionReportController }
