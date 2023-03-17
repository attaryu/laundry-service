const {
  generateNewRequestTokenService,
  loginService,
  logoutService,
} = require('../services/login.service');
const { serverErrorHandler } = require('../lib/handlerReuse');

async function loginController(req, res) {
  try {
    const payloads = await loginService(req.body);

    if (payloads.code !== 201) {
      return res.status(payloads.code).json({
        code: payloads.code,
        message: payloads.message,
      });
    }

    return res
      .status(payloads.code)
      .cookie('refresh-token', payloads.token.refreshToken, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain: 'https://laundry-view.vercel.app'
      })
      .json({
        ...payloads,
        payload: payloads.payload,
        token: {
          requestToken: payloads.token.requestToken,
        },
      });
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}

async function generateNewRequestTokenController(req, res) {
  try {
    const payloads = await generateNewRequestTokenService();

    return res.status(payloads.code).json(payloads);
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}

async function logoutUserController(req, res) {
  try {
    const payloads = await logoutService(req.cookies['refresh-token']);
    
    return res
      .status(payloads.code)
      .clearCookie('refresh-token')
      .json(payloads);
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}

module.exports = {
  loginController,
  generateNewRequestTokenController,
  logoutUserController,
}
