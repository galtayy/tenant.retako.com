module.exports = app => {
  const authController = require('../controllers/auth.controller');

  const router = require('express').Router();

  // Kayıt ol
  router.post('/register', authController.register);

  // Giriş yap
  router.post('/login', authController.login);

  app.use('/api/auth', router);
};
