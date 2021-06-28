import express from "express";
import passport from "passport";
import { isAuth } from '../middlewares/Middlewares.js';

const router = express.Router();
router.use(passport.initialize());
router.use(passport.session());

router.post('/login', passport.authenticate('login', { failureRedirect: '/login-error', successRedirect: '/index' }))
router.post('/register', passport.authenticate('register', { failureRedirect: '/register-error', successRedirect: '/index' }))

router.get('/', function(req, res){
  res.redirect('/index');
});

router.get("/index", isAuth, (req, res) => {
  res.render("index", { username: req.session.passport.user });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index", { username: req.session.passport.user });
  } else {
    res.render("login");
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  // res.redirect('/');
  res.render("logout", { username: req.session.passport.user });
})

router.get("/unauthorized", (req, res) => {
  res.render("unauthorized");
});

router.get("/login-error", (req, res) => {
  res.render("login-error");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/register-error", (req, res) => {
  res.render("register-error");
});

export default router;