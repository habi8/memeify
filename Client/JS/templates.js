// Client/js/templates.js
document.addEventListener('DOMContentLoaded', () => {
  const templateGrid = document.querySelector('.template-grid');
  const moreButton = document.querySelector('.more-button');
  const moreButtonText = moreButton.querySelector('p');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const clearButton = document.getElementById('clear-templates');
  const uploadIcon = document.querySelector('.upload-icon');
  const uploadInput = document.getElementById('upload-input');

  let templates = JSON.parse(localStorage.getItem('memifyTemplates')) || window.memeTemplates || [];
  let page = Math.ceil((templates.length + 1) / 10) || 1;
  let hasMore = true;
  let isSearching = false;

  if (templates.length > 0 && !isSearching) {
    displayTemplates(templates);
  } else {
    templateGrid.innerHTML = '<p>No templates available. Check console for errors.</p>';
    console.error('memeTemplates is empty or undefined');
  }

  // Trigger file input when upload icon is clicked
  uploadIcon.addEventListener('click', () => {
    uploadInput.click(); // Programmatically click the hidden file input
  });

  // Handle file selection
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the selected file to preview or pass to editor
      const fileUrl = URL.createObjectURL(file);
      console.log('Selected file URL:', fileUrl);

      // Redirect to editor with the selected file URL
      window.location.href = `/memeify/api/editorPage?template=${encodeURIComponent(fileUrl)}&isLocal=true`;

      // Optionally revoke the URL after use to free memory
      // URL.revokeObjectURL(fileUrl); // Uncomment if you don't need the URL after redirect
    }
  });

  moreButton.addEventListener('click', async () => {
    if (!hasMore || isSearching) return;

    page++;
    try {
      const response = await fetch(`http://localhost:7000/memeify/api/moreTemplates?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      if (data.success) {
        templates = [...templates, ...data.templates];
        localStorage.setItem('memifyTemplates', JSON.stringify(templates));
        templateGrid.innerHTML = '';
        displayTemplates(templates);
        hasMore = data.hasMore;
        if (!hasMore) {
          moreButtonText.textContent = 'No More Templates';
          moreButton.disabled = true;
        }
      } else {
        console.error('Failed to fetch more templates:', data.error);
        templateGrid.innerHTML = '<p>Error loading more templates</p>';
      }
    } catch (error) {
      console.error('Error fetching more templates:', error.message);
      templateGrid.innerHTML = '<p>Error loading more templates. Check console for details.</p>';
    }
  });

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    templateGrid.innerHTML = '';

    if (!query) {
      isSearching = false;
      displayTemplates(templates);
      return;
    }

    try {
      isSearching = true;
      const response = await fetch(`http://localhost:7000/memeify/api/searchTemplates?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      if (data.success) {
        displayTemplates(data.templates);
      } else {
        console.error('Failed to search templates:', data.error);
        templateGrid.innerHTML = '<p>Error searching templates</p>';
      }
    } catch (error) {
      console.error('Error searching templates:', error.message);
      templateGrid.innerHTML = '<p>Error searching templates. Check console for details.</p>';
    }
  });

  clearButton.addEventListener('click', () => {
    localStorage.removeItem('memifyTemplates');
    templates = window.memeTemplates || [];
    page = 1;
    hasMore = true;
    isSearching = false;
    templateGrid.innerHTML = '';
    displayTemplates(templates);
    moreButtonText.textContent = 'More';
    moreButton.disabled = false;
  });

  function displayTemplates(templatesToShow) {
    if (!templatesToShow.length) {
      templateGrid.innerHTML = '<p>No templates found</p>';
      return;
    }
    templateGrid.innerHTML = '';
    templatesToShow.forEach(template => {
      const img = document.createElement('img');
      img.src = template.url;
      img.alt = template.name;
      img.className = 'template-img';
      img.addEventListener('click', () => {
        window.location.href = `/memeify/api/editorPage?template=${encodeURIComponent(template.url)}`;
      });
      templateGrid.appendChild(img);
    });
  }
});