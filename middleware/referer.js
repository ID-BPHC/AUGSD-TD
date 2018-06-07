module.exports = {
  referHandler: function(req, res, next) {
    res.send(req.session);
    console.log(req);
    if (!req.session.Session.passport.user) {
      res.session.redirectTo = req.baseUrl;
      next();
    } else {
      next();
    }
  }
};
