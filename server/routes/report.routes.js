module.exports = app => {
  const reportController = require('../controllers/report.controller');
  const authJwt = require('../middlewares/authJwt');

  const router = require('express').Router();

  // Middleware olarak JWT kontrolü ekle
  router.use(authJwt.verifyToken);

  // Mülk ekle
  router.post('/properties', reportController.createProperty);

  // Kullanıcının mülklerini getir
  router.get('/properties', reportController.getUserProperties);

  // Rapor oluştur
  router.post('/properties/:propertyId/reports', reportController.createReport);

  // Rapor detaylarını getir
  router.get('/reports/:reportId', reportController.getReportDetails);

  // Rapora fotoğraf ekle
  router.post('/reports/:reportId/photos', reportController.uploadPhotos);

  // Raporun fotoğraflarını getir
  router.get('/reports/:reportId/photos', reportController.getReportPhotos);

  // Raporu güncelle
  router.put('/reports/:reportId', reportController.updateReport);

  // Raporu ev sahibine gönder
  router.post('/reports/:reportId/send', reportController.sendReportToLandlord);

  // Kullanıcının tüm raporlarını getir
  router.get('/reports', reportController.getUserReports);

  app.use('/api', router);
};
