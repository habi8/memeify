// client/js/templates.js
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const templateGrid = document.querySelector('.template-grid');
  const moreButton = document.querySelector('.more-button');
  let page = 1; // Start from page 2 for "More" since page 1 is injected
  const limit = 5; // Match the number of popular templates injected (5)

  // Display injected popular templates
  if (window.popularTemplates && window.popularTemplates.length > 0) {
    displayTemplates(window.popularTemplates);
    page = 1; // Adjust page for pagination
  } else {
    console.error('No popular templates injected');
  }

  // Search form submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    templateGrid.innerHTML = '';
    page = 1;
    if (query) {
      searchTemplates(query);
    } else if (window.popularTemplates) {
      displayTemplates(window.popularTemplates); // Reload injected templates
    }
  });

  // More button click
  moreButton.addEventListener('click', () => {
    page++;
    fetchTemplates(false);
  });

  // Fetch additional templates for pagination
  async function fetchTemplates(popular = false) {
    try {
      const url = popular 
        ? `/api/templates?popular=true&page=${page}&limit=${limit}`
        : `/api/templates?page=${page}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        displayTemplates(data.templates);
        moreButton.style.display = data.templates.length < limit || (page * limit) >= data.total ? 'none' : 'block';
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  // Display templates in grid
  function displayTemplates(templates) {
    templates.forEach(template => {
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

  // Search templates (client-side)
  async function searchTemplates(query) {
    try {
      const response = await fetch(`/api/templates?page=1&limit=100`);
      const data = await response.json();
      if (data.success) {
        const filteredTemplates = data.templates.filter(template =>
          template.name.toLowerCase().includes(query)
        );
        templateGrid.innerHTML = '';
        displayTemplates(filteredTemplates);
        moreButton.style.display = filteredTemplates.length < data.total ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error searching templates:', error);
    }
  }
});