function methodNotAllowed(req, res) {
  return res.status(405).send(`method ${req.method} tidak tersedia di endpoint ${req.path}`);
}

function serverErrorHandler(res) {
  return res.status(505).json({
    code: 500,
    message: `server error, silahkan coba lagi nanti`,
  });
}

module.exports = {
  methodNotAllowed,
  serverErrorHandler,
}
