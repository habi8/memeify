// server/Controllers/homepageController.js
const path = require('path');
const fs = require('fs').promises; // Use promises for async file reading
const axios = require('axios');

const getHomepage = async (req, res) => {
  try {
    const response = await axios.get('https://api.imgflip.com/get_memes');
    if (!response.data.success) {
      throw new Error('Imgflip API request failed');
    }

    const allTemplates = response.data.data.memes;
    const popularTemplateIds = [
      '181913649', '112126428', '87743020', '129242436', '102156234'
    ];

    const sortedTemplates = [
      ...allTemplates.filter(template => popularTemplateIds.includes(template.id)),
      ...allTemplates.filter(template => !popularTemplateIds.includes(template.id))
    ];

    // Fetch first 10 templates (page 1)
    const templates = sortedTemplates.slice(0, 10);
    console.log('Templates fetched:', templates.length);

    const htmlPath = path.join(__dirname, '../../Client/homepage.html');
    let htmlContent = await fs.readFile(htmlPath, 'utf-8');

    const scriptTag = `<script>window.memeTemplates = ${JSON.stringify(templates)};</script>`;
    htmlContent = htmlContent.replace('</html>', `${scriptTag}</html>`);

    res.set('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error rendering homepage:', error.message);
    res.status(500).send('Error loading homepage');
  }
};

const getMoretemplates =  async (req, res) => {
  try {
    const { page = 1 } = req.query; // Page number for pagination
    const limit = 10; // Fetch 10 templates per request

    // Fetch all templates from Imgflip API
    const response = await axios.get('https://api.imgflip.com/get_memes');
    if (!response.data.success) {
      throw new Error('Imgflip API request failed');
    }

    const allTemplates = response.data.data.memes;
    const totalTemplates = allTemplates.length;

    // Paginate templates
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const templates = allTemplates.slice(startIndex, endIndex);

    res.json({
      success: true,
      templates,
      hasMore: endIndex < totalTemplates, // Indicate if more templates are available
      total: totalTemplates
    });
  } catch (error) {
    console.error('Error fetching more templates:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch more templates' });
  }
};

// server/app.js (or your routes file)
const searchTemplates =  async (req, res) => {
  try {
    const { query = '' } = req.query; // Get the search query from the request
    const response = await axios.get('https://api.imgflip.com/get_memes');
    if (!response.data.success) {
      throw new Error('Imgflip API request failed');
    }

    const allTemplates = response.data.data.memes;
    const filteredTemplates = query
      ? allTemplates.filter(template => template.name.toLowerCase().includes(query.toLowerCase()))
      : allTemplates;

    res.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length
    });
  } catch (error) {
    console.error('Error searching templates:', error.message);
    res.status(500).json({ success: false, error: 'Failed to search templates' });
  }
};

module.exports = { getHomepage, getMoretemplates, searchTemplates };