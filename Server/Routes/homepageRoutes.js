
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getHomepage,getMoretemplates, searchTemplates, editorPage } = require('../Controllers/homepageController');

router.get('/', getHomepage);
router.get('/api/moreTemplates', getMoretemplates);
router.get('/api/searchTemplates', searchTemplates);
router.get('/api/editorPage', editorPage);


module.exports = router;