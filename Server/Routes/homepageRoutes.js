// server/Routes/homepageRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getHomepage } = require('../Controllers/homepageController');

router.get('/', getHomepage);

// Fetch additional templates (for pagination and search)
router.get('/templates', async (req, res) => {
  try {
    const { page = 1, limit = 5, popular = 'false' } = req.query;
    console.log(`Fetching templates: page=${page}, limit=${limit}, popular=${popular}`);
    const response = await axios.get('https://api.imgflip.com/get_memes');

    if (!response.data.success) {
      throw new Error('Imgflip API request failed');
    }

    const templates = response.data.memes;

    const popularTemplateIds = [
      '181913649', // Drake Hotline Bling
      '112126428', // Distracted Boyfriend
      '87743020',  // Two Buttons
      '129242436', // Change My Mind
      '102156234'  // Mocking Spongebob
    ];

    let filteredTemplates = templates;
    if (popular === 'true') {
      filteredTemplates = templates.filter(template =>
        popularTemplateIds.includes(template.id)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    res.json({
      success: true,
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch templates. Please try again later.' });
  }
});

module.exports = router;