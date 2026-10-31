(function() {
  'use strict';

  function initAnnotationTool() {
    if (document.getElementById('annotationCanvas')) return;

    // 1. Create Overlay Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'annotationCanvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let isAnnotMode = false;
    let isEraser = false;
    let currentColor = '#ef4444'; // Red default for teacher marking
    let currentWidth = 4;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Save existing drawing
      let tempCanvas = null;
      if (canvas.width > 0 && canvas.height > 0) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      // Restore drawing if existed
      if (tempCanvas) {
        ctx.drawImage(tempCanvas, 0, 0, w, h);
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 2. Helper to get OrbitControls instance
    function getOrbitControls() {
      if (window._activeControls && typeof window._activeControls === 'object') {
        return window._activeControls;
      }
      if (typeof controls !== 'undefined' && controls && typeof controls === 'object') {
        return controls;
      }
      return null;
    }

    function setAnnotationMode(active) {
      isAnnotMode = active;
      const ctrl = getOrbitControls();
      if (ctrl) {
        ctrl.enabled = !active;
      }
      canvas.style.pointerEvents = active ? 'auto' : 'none';
      const toggleBtn = document.getElementById('annotToggleBtn');
      if (toggleBtn) {
        if (active) {
          toggleBtn.classList.add('active');
          toggleBtn.innerHTML = '✏️ Đang vẽ';
        } else {
          toggleBtn.classList.remove('active');
          toggleBtn.innerHTML = '✏️ Bút vẽ';
        }
      }
    }

    // 3. Drawing Events (Mouse + Touch)
    function startDraw(e) {
      if (!isAnnotMode) return;
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      lastX = clientX - rect.left;
      lastY = clientY - rect.top;
      if (e.cancelable && e.touches) e.preventDefault();
    }

    function draw(e) {
      if (!isDrawing || !isAnnotMode) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(currentX, currentY);

      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentWidth * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.stroke();
      lastX = currentX;
      lastY = currentY;

      if (e.cancelable) e.preventDefault();
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    // 4. Create Toolbar HTML
    const toolbar = document.createElement('div');
    toolbar.id = 'annotationToolbar';
    toolbar.innerHTML = `
      <button type="button" class="annot-btn annot-toggle-btn" id="annotToggleBtn" title="Bật/Tắt bút vẽ chú thích trên màn hình">
        ✏️ Bút vẽ
      </button>

      <div class="annot-colors annot-item">
        <div class="annot-color-dot selected" data-color="#ef4444" style="background:#ef4444;" title="Màu Đỏ"></div>
        <div class="annot-color-dot" data-color="#f59e0b" style="background:#f59e0b;" title="Màu Vàng"></div>
        <div class="annot-color-dot" data-color="#22c55e" style="background:#22c55e;" title="Màu Xanh lá"></div>
        <div class="annot-color-dot" data-color="#38bdf8" style="background:#38bdf8;" title="Màu Xanh lam"></div>
        <div class="annot-color-dot" data-color="#ffffff" style="background:#ffffff;" title="Màu Trắng"></div>
      </div>

      <div class="annot-sizes annot-item">
        <button type="button" class="annot-size-btn" data-size="2" title="Nét mảnh">S</button>
        <button type="button" class="annot-size-btn selected" data-size="4" title="Nét vừa">M</button>
        <button type="button" class="annot-size-btn" data-size="8" title="Nét đậm">L</button>
      </div>

      <button type="button" class="annot-btn annot-item" id="annotEraserBtn" title="Chế độ tẩy xóa">
        🧹 Tẩy
      </button>

      <button type="button" class="annot-btn annot-item" id="annotClearBtn" title="Xóa toàn bộ nét vẽ">
        🗑️
      </button>

      <button type="button" class="annot-btn annot-item" id="annotCollapseBtn" style="padding:6px 8px;font-size:11px;" title="Thu gọn thanh công cụ">
        ✕
      </button>
    `;

    document.body.appendChild(toolbar);

    // 5. Wire Toolbar Events
    const toggleBtn = document.getElementById('annotToggleBtn');
    toggleBtn.addEventListener('click', () => {
      setAnnotationMode(!isAnnotMode);
      if (isAnnotMode && toolbar.classList.contains('collapsed')) {
        toolbar.classList.remove('collapsed');
      }
    });

    // Colors
    const colorDots = toolbar.querySelectorAll('.annot-color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        isEraser = false;
        document.getElementById('annotEraserBtn').classList.remove('active');
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        currentColor = dot.dataset.color;
        if (!isAnnotMode) setAnnotationMode(true);
      });
    });

    // Sizes
    const sizeBtns = toolbar.querySelectorAll('.annot-size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentWidth = parseInt(btn.dataset.size, 10);
      });
    });

    // Eraser
    const eraserBtn = document.getElementById('annotEraserBtn');
    eraserBtn.addEventListener('click', () => {
      isEraser = !isEraser;
      eraserBtn.classList.toggle('active', isEraser);
      if (isEraser && !isAnnotMode) setAnnotationMode(true);
    });

    // Clear All
    const clearBtn = document.getElementById('annotClearBtn');
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Collapse / Expand
    const collapseBtn = document.getElementById('annotCollapseBtn');
    collapseBtn.addEventListener('click', () => {
      toolbar.classList.toggle('collapsed');
      collapseBtn.textContent = toolbar.classList.contains('collapsed') ? '➕' : '✕';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnnotationTool);
  } else {
    initAnnotationTool();
  }
})();
