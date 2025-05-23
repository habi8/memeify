// Client/js/templates.js
document.addEventListener('DOMContentLoaded', () => {
  const templateGrid = document.querySelector('.template-grid');
  const moreButton = document.querySelector('.more-button');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  let templates = window.memeTemplates || []; // Fallback to empty array if undefined
  let visibleRows = 3; // Start with 3 rows (15 templates)
  const templatesPerRow = 5;
  const maxRows = 6; // Max 6 rows (3 initial + 3 more)

  // If no templates are injected, fetch them (optional fallback)
  if (!templates.length) {
    fetchTemplates();
  } else {
    displayTemplates(templates.slice(0, visibleRows * templatesPerRow));
  }

  // More button click
  moreButton.addEventListener('click', () => {
    visibleRows += 3; // Add 3 more rows
    templateGrid.innerHTML = ''; // Clear grid
    displayTemplates(templates.slice(0, visibleRows * templatesPerRow));
    if (visibleRows >= maxRows || visibleRows * templatesPerRow >= templates.length) {
      moreButton.style.display = 'none';
    }
  });

  // Search form submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    templateGrid.innerHTML = ''; // Clear grid
    visibleRows = 3; // Reset to 3 rows
    moreButton.style.display = 'block';
    const filteredTemplates = query
      ? templates.filter(template => template.name.toLowerCase().includes(query))
      : templates;
    displayTemplates(filteredTemplates.slice(0, visibleRows * templatesPerRow));
    if (filteredTemplates.length <= visibleRows * templatesPerRow) {
      moreButton.style.display = 'none';
    }
  });

  // Display templates in grid
  function displayTemplates(templatesToShow) {
    if (!templatesToShow.length) {
      templateGrid.innerHTML = '<p>No templates available</p>';
      return;
    }
    templatesToShow.forEach(template => {
      const img = document.createElement('img');
      img.src = template.url;
      img.alt = template.name;
      img.className = 'template-img';
      img.addEventListener('click', () => {
        window.location.href = `editor.html?template=${encodeURIComponent(template.url)}`;
      });
      templateGrid.appendChild(img);
    });
  }

  // Fallback function to fetch templates if not injected
  async function fetchTemplates() {
    try {
      const response = await fetch('/api/templates'); // Optional fallback endpoint
      const data = await response.json();
      if (data.success) {
        templates = data.templates.slice(0, 20); // Limit to 20
        displayTemplates(templates.slice(0, visibleRows * templatesPerRow));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      templateGrid.innerHTML = '<p>Error loading templates</p>';
    }
  }
});