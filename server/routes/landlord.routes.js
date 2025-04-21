module.exports = app => {
  const landlordController = require('../controllers/landlord.controller');

  const router = require('express').Router();

  // Token ile raporu görüntüle (ev sahibi erişimi için)
  router.get('/view-report/:token', landlordController.viewReport);

  // Rapor görüntüleme durumunu güncelle
  router.post('/viewed-report/:token', landlordController.markReportAsViewed);

  app.use('/api', router);
};
