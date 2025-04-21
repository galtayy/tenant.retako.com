const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake');
const moment = require('moment');

// Font dosyalarını tanımla
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf')
  }
};

// PDF üreticisini oluştur
const printer = new pdfMake(fonts);

/**
 * Rapor ve fotoğraflarından PDF oluşturur
 * @param {Object} report - Rapor bilgileri
 * @param {Object} property - Daire bilgileri
 * @param {Array} photos - Fotoğraf listesi
 * @param {Object} user - Kiracı bilgileri
 * @returns {Promise<Buffer>} - Oluşturulan PDF'in buffer'ı
 */
const generateReportPDF = async (report, property, photos, user) => {
  try {
    // Fotoğrafları odalara göre grupla
    const photosByRoom = {};
    photos.forEach(photo => {
      if (!photosByRoom[photo.room]) {
        photosByRoom[photo.room] = [];
      }
      photosByRoom[photo.room].push(photo);
    });

    // PDF doküman içeriği
    const documentDefinition = {
      info: {
        title: `Taşınma Raporu - ${property.address}`,
        author: user.name,
        subject: 'Daire Durum Raporu',
        keywords: 'taşınma, rapor, depozito, daire',
        creator: 'Kiracı Depozito Koruma'
      },
      content: [
        // Rapor başlığı
        {
          text: 'KİRACI DEPOZİTO KORUMA',
          style: 'header',
          alignment: 'center',
          color: '#2563EB'
        },
        {
          text: 'Daire Durum Raporu',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        
        // Rapor ve daire bilgileri
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Rapor Bilgileri', style: 'tableHeader', colSpan: 2, alignment: 'center' }, {}
              ],
              [
                { text: 'Rapor Tipi:', bold: true }, 
                { text: report.reportType === 'move-in' ? 'Taşınma Girişi' : 'Taşınma Çıkışı' }
              ],
              [
                { text: 'Rapor Tarihi:', bold: true }, 
                { text: moment(report.reportDate).format('DD.MM.YYYY') }
              ],
              [
                { text: 'Rapor Durumu:', bold: true }, 
                { text: report.status === 'draft' ? 'Taslak' : (report.status === 'sent' ? 'Gönderildi' : 'Görüntülendi') }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Mülk bilgileri
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Mülk Bilgileri', style: 'tableHeader', colSpan: 2, alignment: 'center' }, {}
              ],
              [
                { text: 'Adres:', bold: true }, 
                { text: property.address }
              ],
              [
                { text: 'Şehir:', bold: true }, 
                { text: property.city }
              ],
              [
                { text: 'Mülk Tipi:', bold: true }, 
                { text: property.type === 'apartment' ? 'Daire' : 
                         property.type === 'house' ? 'Müstakil Ev' : 
                         property.type === 'villa' ? 'Villa' : 
                         property.type === 'office' ? 'Ofis' : 
                         property.type === 'store' ? 'Dükkan' : 'Diğer' }
              ],
              [
                { text: 'Oda Sayısı:', bold: true }, 
                { text: property.roomCount || '1' }
              ],
              [
                { text: 'Banyo Sayısı:', bold: true }, 
                { text: property.bathroomCount || '1' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Taraflar
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Taraflar', style: 'tableHeader', colSpan: 2, alignment: 'center' }, {}
              ],
              [
                { text: 'Kiracı:', bold: true }, 
                { text: user.name }
              ],
              [
                { text: 'Ev Sahibi:', bold: true }, 
                { text: property.landlordName }
              ],
              [
                { text: 'Ev Sahibi İletişim:', bold: true }, 
                { text: property.landlordEmail + (property.landlordPhone ? `, ${property.landlordPhone}` : '') }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Rapor notları
        report.additionalNotes ? {
          text: 'Ek Notlar',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        } : {},
        
        report.additionalNotes ? {
          text: report.additionalNotes,
          margin: [0, 0, 0, 20],
          italics: true
        } : {},
        
        // Oda bazlı fotoğraflar
        {
          text: 'Oda Durumları ve Fotoğraflar',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#2563EB',
          margin: [0, 15, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#2563EB',
          fillColor: '#f3f4f6'
        }
      },
      defaultStyle: {
        font: 'Roboto'
      },
      footer: function(currentPage, pageCount) {
        return {
          text: `Sayfa ${currentPage} / ${pageCount}`,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        };
      }
    };
    
    // Her oda için fotoğrafları ekle
    Object.keys(photosByRoom).forEach(room => {
      // Oda başlığı
      documentDefinition.content.push({
        text: room,
        style: 'subheader',
        margin: [0, 5, 0, 10]
      });
      
      // Oda fotoğrafları
      const roomPhotos = photosByRoom[room];
      
      // Her fotoğraf için
      for (let i = 0; i < roomPhotos.length; i++) {
        const photo = roomPhotos[i];
        
        // Fotoğraf bilgisi
        const photoInfo = [];
        
        // Fotoğraf açıklaması
        if (photo.damageDescription) {
          photoInfo.push({
            text: 'Hasar Açıklaması: ' + photo.damageDescription,
            margin: [0, 5, 0, 0]
          });
        }
        
        // Konum bilgisi
        if (photo.location) {
          photoInfo.push({
            text: 'Konum: ' + photo.location,
            margin: [0, 5, 0, 0]
          });
        }
        
        // Hasar tipleri
        if (photo.damageTypes) {
          try {
            const types = JSON.parse(photo.damageTypes);
            if (types && types.length > 0) {
              photoInfo.push({
                text: 'Hasar Tipleri: ' + types.join(', '),
                margin: [0, 5, 0, 0]
              });
            }
          } catch (e) {
            console.error('Hasar tipleri JSON parse hatası:', e);
          }
        }
        
        // Fotoğrafı ve bilgileri ekle
        documentDefinition.content.push({
          columns: [
            {
              width: '50%',
              stack: [
                {
                  // Resim bilgisi
                  text: '[Fotoğraf]',
                  alignment: 'center',
                  margin: [0, 50, 0, 50]
                }
              ]
            },
            {
              width: '50%',
              stack: photoInfo
            }
          ],
          margin: [0, 0, 0, 20]
        });
      }
    });
    
    // Özet
    documentDefinition.content.push({
      text: 'Özet',
      style: 'sectionHeader',
      margin: [0, 20, 0, 10]
    });
    
    documentDefinition.content.push({
      text: `Bu rapor, kiracı ${user.name} tarafından ${moment(report.reportDate).format('DD.MM.YYYY')} tarihinde oluşturulmuştur. 
      Raporda toplam ${photos.length} adet fotoğraf bulunmakta ve ${Object.keys(photosByRoom).length} oda/alanın durumu belgelenmiştir.`,
      margin: [0, 0, 0, 20]
    });
    
    // İmza alanı
    documentDefinition.content.push({
      columns: [
        {
          width: '45%',
          text: 'Kiracı İmzası:',
          alignment: 'center',
          margin: [0, 40, 0, 0]
        },
        {
          width: '10%',
          text: ''
        },
        {
          width: '45%',
          text: 'Ev Sahibi İmzası:',
          alignment: 'center',
          margin: [0, 40, 0, 0]
        }
      ]
    });
    
    documentDefinition.content.push({
      columns: [
        {
          width: '45%',
          text: '______________________',
          alignment: 'center'
        },
        {
          width: '10%',
          text: ''
        },
        {
          width: '45%',
          text: '______________________',
          alignment: 'center'
        }
      ],
      margin: [0, 15, 0, 0]
    });
    
    // PDF oluştur
    const pdfDoc = printer.createPdfKitDocument(documentDefinition);
    return new Promise((resolve, reject) => {
      const chunks = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Resmi base64'e çevirir
 * @param {string} imgPath - Resim dosya yolu
 * @returns {Promise<string>} - Base64 formatında resim
 */
const imageToBase64 = (imgPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(imgPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString('base64'));
      }
    });
  });
};

module.exports = { generateReportPDF };
