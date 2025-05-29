// Client/JS/editor.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meme-canvas');
  const ctx = canvas.getContext('2d');
  const generateButton = document.getElementById('generate-meme');
  const editorContainer = document.querySelector('.editor-container');

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateUrl = urlParams.get('template');
  const isLocal = urlParams.get('isLocal') === 'true';

  let img = new Image();
  img.crossOrigin = 'Anonymous'; // For remote images, if needed

  // Array to store text objects (position and content)
  let texts = [];

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

  // Handle canvas clicks to add text
  canvas.addEventListener('click', (e) => {
    // Get the click position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a text input at the clicked position
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'dynamic-text-input';
    input.style.position = 'absolute';
    input.style.left = `${rect.left + x}px`;
    input.style.top = `${rect.top + y}px`;
    input.style.width = '150px'; // Fixed width for the input
    input.placeholder = 'Enter text...';

    // Add the input to the DOM
    editorContainer.appendChild(input);
    input.focus();

    // Save the text when the user presses Enter or the input loses focus
    const saveText = () => {
      const text = input.value.trim();
      if (text) {
        texts.push({ x, y, text }); // Save the text and its position
        drawMeme(); // Redraw the canvas with the new text
      }
      input.remove(); // Remove the input from the DOM
    };

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveText();
      }
    });

    input.addEventListener('blur', saveText); // Save when the input loses focus
  });

  function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw all saved texts
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    texts.forEach(({ x, y, text }) => {
      ctx.fillText(text.toUpperCase(), x, y);
      ctx.strokeText(text.toUpperCase(), x, y);
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