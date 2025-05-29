document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meme-canvas');
  const ctx = canvas.getContext('2d');
  const addTextButton = document.getElementById('add-text');
  const generateButton = document.getElementById('generate-meme');
  const editorContainer = document.querySelector('.editor-container');

  const urlParams = new URLSearchParams(window.location.search);
  const templateUrl = urlParams.get('template');
  const isLocal = urlParams.get('isLocal') === 'true';

  let img = new Image();
  img.crossOrigin = 'Anonymous';

  let texts = [];
  let selectedTextObj = null;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

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
          const textObj = {
            x: x * (canvas.width / rect.width),
            y: y * (canvas.height / rect.height),
            size: 30,
            text
          };
          texts.push(textObj);
          drawMeme();
        }
        input.remove();
      }
    });
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = texts.length - 1; i >= 0; i--) {
      const textObj = texts[i];
      ctx.font = `bold ${textObj.size}px Arial`;
      const width = ctx.measureText(textObj.text).width;
      const height = textObj.size;

      if (
        mouseX >= textObj.x - width / 2 &&
        mouseX <= textObj.x + width / 2 &&
        mouseY >= textObj.y - height &&
        mouseY <= textObj.y
      ) {
        selectedTextObj = textObj;
        dragOffsetX = mouseX - textObj.x;
        dragOffsetY = mouseY - textObj.y;
        isDragging = true;
        toggleDeleteButton(true);
        break;
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectedTextObj) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    selectedTextObj.x = mouseX - dragOffsetX;
    selectedTextObj.y = mouseY - dragOffsetY;

    drawMeme();
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  function toggleDeleteButton(show) {
    let deleteBtn = document.querySelector('.delete-button');

    if (show && !deleteBtn) {
      deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-button';
      deleteBtn.innerHTML = 'Delete';

      deleteBtn.addEventListener('click', () => {
        if (selectedTextObj) {
          const index = texts.indexOf(selectedTextObj);
          if (index !== -1) {
            texts.splice(index, 1);
            drawMeme();
          }

          selectedTextObj = null;
          toggleDeleteButton(false);
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

  if (isLocal) {
    window.addEventListener('unload', () => {
      URL.revokeObjectURL(templateUrl);
    });
  }
});
