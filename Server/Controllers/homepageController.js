// server/Controllers/homepageController.js
const path = require('path');

const getHomepage = (req, res) => {
  try {
    const htmlPath = path.join(__dirname, '../../Client/homepage.html');
    res.sendFile(htmlPath, (err) => {
      if (err) {
        console.error('Error serving homepage:', err.message);
        res.status(500).send('Error loading homepage');
      }
    });
  } catch (error) {
    console.error('Error rendering homepage:', error.message);
    res.status(500).send('Error loading homepage');
  }
};

module.exports = { getHomepage };