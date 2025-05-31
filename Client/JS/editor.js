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
    input.style.left = `${rect.left + x - 75}px`;
    input.style.top = `${rect.top + y - 20}px`;
    input.style.width = '150px';

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
            rotation: 0,
            text,
            color: '#ffffff',
            font: 'Arial'
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

    selectedTextObj = null;
    for (let i = texts.length - 1; i >= 0; i--) {
      const textObj = texts[i];
      ctx.save();
      ctx.translate(textObj.x, textObj.y);
      ctx.rotate((textObj.rotation * Math.PI) / 180);
      ctx.font = `bold ${textObj.size}px ${textObj.font}`;
      const width = ctx.measureText(textObj.text).width;
      const height = textObj.size;
      ctx.restore();

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
        toggleControls(true);
        return;
      }
    }

    toggleControls(false);
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

  function toggleControls(show) {
    const existing = document.querySelector('.text-controls');
    if (existing) existing.remove();

    if (show && selectedTextObj) {
      const panel = document.createElement('div');
      panel.className = 'text-controls';

      const createButton = (label, onClick) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        return btn;
      };

      // Control Buttons
      panel.appendChild(createButton('Delete', () => {
        texts = texts.filter(t => t !== selectedTextObj);
        selectedTextObj = null;
        drawMeme();
        toggleControls(false);
      }));

      panel.appendChild(createButton('Size+', () => {
        selectedTextObj.size += 2;
        drawMeme();
      }));

      panel.appendChild(createButton('Size-', () => {
        if (selectedTextObj.size > 10) {
          selectedTextObj.size -= 2;
          drawMeme();
        }
      }));

      panel.appendChild(createButton('⟲', () => {
        selectedTextObj.rotation -= 5;
        drawMeme();
      }));

      panel.appendChild(createButton('⟳', () => {
        selectedTextObj.rotation += 5;
        drawMeme();
      }));

      // Color Picker
      const colorLabel = document.createElement('label');
      colorLabel.textContent = 'Color: ';
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.value = selectedTextObj.color || '#ffffff';
      colorPicker.addEventListener('input', (e) => {
        selectedTextObj.color = e.target.value;
        drawMeme();
      });
      colorLabel.appendChild(colorPicker);
      panel.appendChild(colorLabel);

      // Font Selector
      const fontLabel = document.createElement('label');
      fontLabel.textContent = ' Font: ';
      const fontSelect = document.createElement('select');

      ['Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'].forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        if (selectedTextObj.font === font) {
          option.selected = true;
        }
        fontSelect.appendChild(option);
      });

      fontSelect.addEventListener('change', (e) => {
        selectedTextObj.font = e.target.value;
        drawMeme();
      });

      fontLabel.appendChild(fontSelect);
      panel.appendChild(fontLabel);

      editorContainer.appendChild(panel);
    }
  }

  function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    texts.forEach(({ x, y, size, text, rotation, color, font }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.font = `bold ${size}px ${font}`;
      ctx.fillStyle = color;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.strokeText(text, 0, 0);
      ctx.restore();
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
