// Client/js/editor.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meme-canvas');
  const ctx = canvas.getContext('2d');
  const topTextInput = document.getElementById('top-text');
  const bottomTextInput = document.getElementById('bottom-text');
  const generateButton = document.getElementById('generate-meme');

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateUrl = urlParams.get('template');
  const isLocal = urlParams.get('isLocal') === 'true';

  let img = new Image();
  img.crossOrigin = 'Anonymous'; // For remote images, if needed

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

  // Load the image (local or remote)
  img.src = templateUrl;

  function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Add text (basic example)
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    // Draw top text
    ctx.fillText(topText, canvas.width / 2, 50);
    ctx.strokeText(topText, canvas.width / 2, 50);

    // Draw bottom text
    ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
  }

  topTextInput.addEventListener('input', drawMeme);
  bottomTextInput.addEventListener('input', drawMeme);

  generateButton.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'meme.png';
    link.click();
  });
});