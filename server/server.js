require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Express uygulamasını oluştur
const app = express();

// CORS ayarları
app.use(cors());

// JSON ve URL-encoded verilerini ayrıştırma
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads klasörünü statik olarak servis et
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Uploads klasörünün varlığını kontrol et, yoksa oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Veritabanı bağlantısını kur
const db = require('./models');

// Veritabanını senkronize et
db.sequelize.sync().then(() => {
  console.log('Veritabanı senkronize edildi.');
}).catch(err => {
  console.error('Veritabanı senkronizasyonu başarısız:', err);
});

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'Kiracı Depozito Koruma API çalışıyor.' });
});

// API rotalarını ekle
require('./routes/auth.routes')(app);
require('./routes/report.routes')(app);
require('./routes/landlord.routes')(app);

// Port belirleme
const PORT = process.env.PORT || 8080;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
