const jwt = require('jsonwebtoken');

const { serverError } = require('../lib/responseReuse');
const {
  logTransaksi
} = require('../models/index');

async function getAllLogService(requestToken) {
  const token = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
    }
  }

  try {
    const transaction = await logTransaksi.findMany({ take: 30, orderBy: { dateNow: 'desc' } });

    return {
      code: 200,
      message: 'success',
      payload: transaction,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

module.exports = { getAllLogService };
