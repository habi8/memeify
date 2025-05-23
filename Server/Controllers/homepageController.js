// server/Controllers/homepageController.js
const path = require('path');
const fs = require('fs').promises; // Use promises for async file reading
const axios = require('axios');

const getHomepage = async (req, res) => {
  try {
    // Fetch meme templates from Imgflip API
    const response = await axios.get('https://api.imgflip.com/get_memes');
    if (!response.data.success) {
      throw new Error('Imgflip API request failed');
    }

    const templates = response.data.data.memes.slice(0, 20);
    const popularTemplateIds = [
      '181913649', // Drake Hotline Bling
      '112126428', // Distracted Boyfriend
      '87743020',  // Two Buttons
      '129242436', // Change My Mind
      '102156234'  // Mocking Spongebob
    ];

    const sortedTemplates = [
      ...templates.filter(template => popularTemplateIds.includes(template.id)),
      ...templates.filter(template => !popularTemplateIds.includes(template.id))
    ].slice(0, 20);

    console.log('Templates fetched:', sortedTemplates.length); // Debug log

    // Read homepage.html
    const htmlPath = path.join(__dirname, '../../Client/homepage.html');
    let htmlContent = await fs.readFile(htmlPath, 'utf-8');

    // Inject templates as a script tag before the closing </html> tag
    const scriptTag = `<script>window.memeTemplates = ${JSON.stringify(sortedTemplates)};</script>`;
    htmlContent = htmlContent.replace('</html>', `${scriptTag}</html>`);

    // Send the modified HTML
    res.set('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error rendering homepage:', error.message);
    res.status(500).send('Error loading homepage');
  }
};

module.exports = { getHomepage };