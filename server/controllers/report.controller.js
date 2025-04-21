const db = require('../models');
const Property = db.properties;
const Report = db.reports;
const Photo = db.photos;
const User = db.users;
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { generateReportPDF } = require('../utils/pdfGenerator');

// Multer ayarları - dosya yükleme için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (.jpg, .jpeg, .png, .gif) can be uploaded!'));
  }
}).array('photos', 10); // Maksimum 10 dosya

// Mülk oluştur
exports.createProperty = async (req, res) => {
  try {
    const { 
      address, 
      city, 
      postalCode, 
      type, 
      rentalPeriod,
      depositAmount,
      roomCount,
      bathroomCount,
      amenities,
      landlordName, 
      landlordEmail, 
      landlordPhone 
    } = req.body;

    // Raw SQL kullanarak veritabanına ekleme
    const [results, metadata] = await db.sequelize.query(
      `INSERT INTO properties 
        (userId, address, city, postalCode, type, rentalPeriod, depositAmount, 
        roomCount, bathroomCount, amenities, landlordName, landlordEmail, landlordPhone, createdAt, updatedAt) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      { 
        replacements: [
          req.userId, 
          address, 
          city, 
          postalCode, 
          type, 
          rentalPeriod || 12,
          depositAmount || 0,
          roomCount || 1,
          bathroomCount || 1,
          amenities,
          landlordName, 
          landlordEmail, 
          landlordPhone || ''
        ]
      }
    );

    // Eklenen mülkün id'sini al
    const propertyId = metadata;

    // Eklenen mülkü getir
    const [property] = await db.sequelize.query(
      'SELECT * FROM properties WHERE id = ?',
      { 
        replacements: [propertyId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    res.status(201).send(property);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Kullanıcının mülklerini getir
exports.getUserProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { userId: req.userId }
    });
    
    res.status(200).send(properties);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Rapor oluştur
exports.createReport = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    
    // Check if the property belongs to the user (raw SQL)
    const [properties] = await db.sequelize.query(
      `SELECT * FROM properties WHERE id = ? AND userId = ?`,
      { 
        replacements: [propertyId, req.userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    if (!properties || properties.length === 0) {
      return res.status(404).send({ message: 'Property not found or you do not have permission to access it.' });
    }
    
    // Create unique token
    const accessToken = uuidv4();
    
    // Create report (raw SQL)
    const [results, metadata] = await db.sequelize.query(
      `INSERT INTO reports 
        (propertyId, reportType, reportDate, accessToken, status, additionalNotes, walkthrough, createdAt, updatedAt) 
      VALUES 
        (?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
      { 
        replacements: [
          propertyId,
          'move-in',
          accessToken,
          'draft',
          req.body.additionalNotes || null,
          req.body.walkthrough || null
        ]
      }
    );
    
    // Eklenen raporun id'sini al
    const reportId = metadata;
    
    // Rapor bilgilerini getir
    const [report] = await db.sequelize.query(
      `SELECT * FROM reports WHERE id = ?`,
      { 
        replacements: [reportId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    res.status(201).send(report);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Rapor detaylarını getir
exports.getReportDetails = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: Property,
          as: 'property',
          where: { userId: req.userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    if (!report) {
      return res.status(404).send({ message: 'Report not found or you do not have permission to access it.' });
    }
    
    res.status(200).send(report);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Rapora fotoğraf yükle
exports.uploadPhotos = (req, res) => {
  const reportId = req.params.reportId;
  
  // Önce raporu kontrol et
  Report.findOne({
    where: { id: reportId },
    include: [
      {
        model: Property,
        as: 'property',
        where: { userId: req.userId }
      }
    ]
  }).then(report => {
    if (!report) {
      return res.status(404).send({ message: 'Report not found or you do not have permission to access it.' });
    }
    
    // Fotoğrafları yükle
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ message: `File upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).send({ message: err.message });
      }
      
      // Fotoğraf bilgileri
      const { room, damageDescription, location } = req.body;
      
      try {
        // Yüklenen her fotoğraf için veritabanına kayıt
        const photoRecords = [];
        for (const file of req.files) {
          const photo = await Photo.create({
            reportId,
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/${file.filename}`,
            size: file.size,
            room: room || 'Not specified',
            damageDescription: damageDescription || null,
            location: location || null,
            damageMarks: damageMarks || null,
            damageTypes: damageTypes || null
          });
          photoRecords.push(photo);
        }
        
        res.status(201).send(photoRecords);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

// Raporun fotoğraflarını getir
exports.getReportPhotos = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Raporun kullanıcıya ait olup olmadığını kontrol et
    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: Property,
          as: 'property',
          where: { userId: req.userId }
        }
      ]
    });
    
    if (!report) {
      return res.status(404).send({ message: 'Report not found or you do not have permission to access it.' });
    }
    
    // Fotoğrafları getir
    const photos = await Photo.findAll({
      where: { reportId }
    });
    
    res.status(200).send(photos);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Raporu güncelle
exports.updateReport = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Raporu kontrol et
    const report = await Report.findOne({
      where: { id: reportId },
      include: [
        {
          model: Property,
          as: 'property',
          where: { userId: req.userId }
        }
      ]
    });
    
    if (!report) {
      return res.status(404).send({ message: 'Rapor bulunamadı veya erişim yetkiniz yok.' });
    }
    
    // Sadece taslak durumundaki raporlar güncellenebilir
    if (report.status !== 'draft') {
      return res.status(400).send({ message: 'Only reports in draft status can be updated.' });
    }
    
    // Raporu güncelle
    const updatedReport = await report.update({
      additionalNotes: req.body.additionalNotes || report.additionalNotes
    });
    
    res.status(200).send(updatedReport);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Raporu ev sahibine gönder
exports.sendReportToLandlord = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Raporu kontrol et (raw SQL)
    const [reports] = await db.sequelize.query(
      `SELECT r.* FROM reports r 
       JOIN properties p ON r.propertyId = p.id 
       WHERE r.id = ? AND p.userId = ?`,
      { 
        replacements: [reportId, req.userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    if (!reports) {
      return res.status(404).send({ message: 'Rapor bulunamadı veya erişim yetkiniz yok.' });
    }
    
    const report = reports;
    
    // Rapor zaten gönderildi mi kontrolü
    if (report.status !== 'draft') {
      return res.status(400).send({ message: 'This report has already been sent.' });
    }
    
    // Mülk bilgilerini al
    const [property] = await db.sequelize.query(
      `SELECT * FROM properties WHERE id = ?`,
      { 
        replacements: [report.propertyId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Fotoğrafları al
    const photos = await db.sequelize.query(
      `SELECT * FROM photos WHERE reportId = ?`,
      { 
        replacements: [reportId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Kullanıcı bilgilerini al
    const [user] = await db.sequelize.query(
      `SELECT * FROM users WHERE id = ?`,
      { 
        replacements: [req.userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // PDF oluştur
    const pdfBuffer = await generateReportPDF(report, property, photos, user);
    
    // PDF dosyasını kaydet
    const pdfFileName = `report_${reportId}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '../uploads', pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    // PDF URL'ini veritabanına kaydet
    const pdfUrl = `/uploads/${pdfFileName}`;
    await db.sequelize.query(
      `UPDATE reports SET pdfUrl = ?, status = 'sent', reportSent = NOW() WHERE id = ?`,
      { 
        replacements: [pdfUrl, reportId],
      }
    );
    
    // Görüntüleme URL'i
    const viewReportUrl = `${process.env.BASE_URL}/view-report/${report.accessToken}`;
    
    // Nodemailer transporter oluştur
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // E-posta gövdesi
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: property.landlordEmail,
      subject: 'Tenant Move-in Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Tenant Deposit Protection - Move-in Report</h2>
          <p>Dear ${property.landlordName},</p>
          <p>Your tenant ${req.body.tenantName || 'Tenant'} has sent you a move-in report. This report documents the current condition of the rented property.</p>
          <p>To view the report, please click the link below:</p>
          <p>
            <a href="${viewReportUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Report</a>
          </p>
          <p>This link is secure and you don't need to create an account to view the report.</p>
          <p>Best regards,</p>
          <p>Tenant Deposit Protection Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `Move_In_Report_${property.address}.pdf`,
          path: pdfPath
        }
      ]
    };
    
    // E-postayı gönder
    await transporter.sendMail(mailOptions);
    
    // Raporu güncellenmiş haliyle getir
    const [updatedReport] = await db.sequelize.query(
      `SELECT * FROM reports WHERE id = ?`,
      { 
        replacements: [reportId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Loglama (Raw SQL)
    await db.sequelize.query(
      `INSERT INTO report_logs (reportId, action, timestamp, details) 
      VALUES (?, ?, NOW(), ?)`,
      { 
        replacements: [reportId, 'SENT_TO_LANDLORD', JSON.stringify({
          sentBy: user.name,
          sentTo: property.landlordEmail,
          pdfUrl: pdfUrl
        })],
      }
    );
    
    res.status(200).send({ 
      message: 'Report successfully sent to the landlord.',
      report: updatedReport
    });
  } catch (err) {
    console.error('Error sending report:', err);
    res.status(500).send({ message: err.message });
  }
};

// Kullanıcının tüm raporlarını getir
exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { userId: req.userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).send(reports);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
