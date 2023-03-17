function setHeaderCookies(req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}

module.exports = { setHeaderCookies };
