const db = require('../models');
const Report = db.reports;
const Property = db.properties;
const Photo = db.photos;
const User = db.users;

// View report with token (for landlord access)
exports.viewReport = async (req, res) => {
  try {
    const token = req.params.token;
    
    // Find report with token (raw SQL)
    const [report] = await db.sequelize.query(
      `SELECT r.* FROM reports r WHERE r.accessToken = ?`,
      { 
        replacements: [token],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    if (!report) {
      return res.status(404).send({ message: 'Report not found.' });
    }
    
    // Get property information
    const [property] = await db.sequelize.query(
      `SELECT p.*, u.id as userId, u.name, u.email FROM properties p 
       JOIN users u ON p.userId = u.id
       WHERE p.id = ?`,
      { 
        replacements: [report.propertyId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Add user information
    property.user = {
      id: property.userId,
      name: property.name,
      email: property.email
    };
    
    // Add property to report
    report.property = property;
    
    // Get photos
    const photos = await db.sequelize.query(
      `SELECT * FROM photos WHERE reportId = ?`,
      { 
        replacements: [report.id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Return report and photos
    res.status(200).send({
      report,
      photos
    });
  } catch (err) {
    console.error('Report viewing error:', err);
    res.status(500).send({ message: err.message });
  }
};

// Update report viewing status
exports.markReportAsViewed = async (req, res) => {
  try {
    const token = req.params.token;
    
    // Find report with token (raw SQL)
    const [report] = await db.sequelize.query(
      `SELECT * FROM reports WHERE accessToken = ?`,
      { 
        replacements: [token],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    if (!report) {
      return res.status(404).send({ message: 'Report not found.' });
    }
    
    // Update report - viewed status
    if (report.status !== 'viewed') {
      await db.sequelize.query(
        `UPDATE reports SET status = 'viewed', lastViewed = NOW(), reportViewed = NOW() WHERE id = ?`,
        { 
          replacements: [report.id],
        }
      );
      
      // Log the view (raw SQL)
      await db.sequelize.query(
        `INSERT INTO report_logs (reportId, action, timestamp, details) 
        VALUES (?, ?, NOW(), ?)`,
        { 
          replacements: [report.id, 'VIEWED_BY_LANDLORD', JSON.stringify({
            viewedAt: new Date().toISOString(),
            viewedFromIP: req.ip || 'unknown'
          })],
        }
      );
    }
    
    res.status(200).send({ message: 'Report marked as viewed.' });
  } catch (err) {
    console.error('Report viewing update error:', err);
    res.status(500).send({ message: err.message });
  }
};
