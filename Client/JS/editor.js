// Client/JS/editor.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meme-canvas');
  const ctx = canvas.getContext('2d');
  const addTextButton = document.getElementById('add-text');
  const generateButton = document.getElementById('generate-meme');
  const editorContainer = document.querySelector('.editor-container');

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateUrl = urlParams.get('template');
  const isLocal = urlParams.get('isLocal') === 'true';

  let img = new Image();
  img.crossOrigin = 'Anonymous';

  // Array to store text objects
  let texts = [];
  let selectedTextObj = null; // Track the selected text for deletion

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    drawMeme();
  };

  img.onerror = () => {
    console.error('Failed to load image');
    canvas.style.display = 'none';
    document.body.innerHTML += '<p>Error loading template image</p>';
  };

  img.src = templateUrl;

  // Add text on button click
  addTextButton.addEventListener('click', () => {
    const rect = canvas.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'text-input';
    input.style.position = 'absolute';
    input.style.left = `${rect.left + x - 75}px`;
    input.style.top = `${rect.top + y - 20}px`;
    input.style.width = '150px';
    input.style.fontWeight = 'bold';

    editorContainer.appendChild(input);
    input.focus();

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = input.value.trim();
        if (text) {
          const textObj = { x, y, size: 30, text };
          texts.push(textObj);
          createDraggableText(textObj);
          drawMeme();
        }
        input.remove();
      }
    });
  });

  function createDraggableText(textObj) {
    const textDiv = document.createElement('div');
    textDiv.className = 'draggable-text';
    textDiv.style.left = `${canvas.offsetLeft + textObj.x - 75}px`; // Center
    textDiv.style.top = `${canvas.offsetTop + textObj.y - 15}px`;
    textDiv.style.width = '150px';
    textDiv.style.height = '30px';
    textDiv.dataset.index = texts.indexOf(textObj);

    editorContainer.appendChild(textDiv);

    let isDragging = false;
    let initialX;
    let initialY;

    textDiv.addEventListener('mousedown', (e) => {
      initialX = e.clientX;
      initialY = e.clientY;
      isDragging = true;
      selectedTextObj = textObj; // Select this text for deletion
      toggleDeleteButton(true);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - initialX;
        const dy = e.clientY - initialY;

        // Update position relative to initial click
        textObj.x += dx / rect.width * canvas.width; // Scale to canvas coordinates
        textObj.y += dy / rect.height * canvas.height;

        // Constrain within canvas bounds
        textObj.x = Math.max(75, Math.min(textObj.x, canvas.width - 75));
        textObj.y = Math.max(15, Math.min(textObj.y, canvas.height - 15));

        textDiv.style.left = `${canvas.offsetLeft + textObj.x - 75}px`;
        textDiv.style.top = `${canvas.offsetTop + textObj.y - 15}px`;
        initialX = e.clientX; // Update initial position for smooth dragging
        initialY = e.clientY;
        drawMeme();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Create and toggle delete button on the left
  function toggleDeleteButton(show) {
    let deleteBtn = document.querySelector('.delete-button');
    if (show && !deleteBtn) {
      deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-button';
      deleteBtn.innerHTML = 'Delete';
      deleteBtn.addEventListener('click', () => {
        if (selectedTextObj) {
          texts = texts.filter(t => t !== selectedTextObj);
          const textDiv = document.querySelector(`[data-index="${texts.indexOf(selectedTextObj)}"]`);
          if (textDiv) textDiv.remove();
          selectedTextObj = null;
          deleteBtn.remove();
          drawMeme();
        }
      });
      editorContainer.appendChild(deleteBtn);
    } else if (!show && deleteBtn) {
      deleteBtn.remove();
    }
  }

  function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    texts.forEach(({ x, y, size, text }) => {
      ctx.font = `bold ${size}px Arial`;
      ctx.fillText(text, x, y);
      ctx.strokeText(text, x, y);
    });
  }

  generateButton.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'meme.png';
    link.click();
  });

  // Clean up blob URL if it's a local file
  if (isLocal) {
    window.addEventListener('unload', () => {
      URL.revokeObjectURL(templateUrl);
    });
  }
});