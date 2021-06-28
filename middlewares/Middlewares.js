export const isAuth = function(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/unauthorized');
  }
}

export const authAPI = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send({ error: 'No autorizado' });
  }
}