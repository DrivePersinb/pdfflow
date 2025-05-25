// At the very top of script.js, add these imports:
import { GlobalWorkerOptions, getDocument } from './lib/pdfjs/build/pdf.mjs';
import { PDFViewer, EventBus, PDFLinkService } from './lib/pdfjs/web/pdf_viewer.mjs';

// Configure the worker source. This path is relative to script.js
// Ensure 'pdf.worker.mjs' is in 'lib/pdfjs/build/'
GlobalWorkerOptions.workerSrc = './lib/pdfjs/build/pdf.worker.mjs';

// The rest of your script.js remains the same, starting with:
document.addEventListener('DOMContentLoaded', () => {
    // --- PDF.js setup ---
    // We no longer need: const { pdfjsLib, pdfjsViewer } = window;
    // We will use the imported 'getDocument', 'PDFViewer', 'EventBus', 'PDFLinkService' directly.

    const viewerContainer = document.getElementById('viewerContainer');
    const pdfViewerWrapper = document.getElementById('pdf-viewer-wrapper');
    
    // Use the imported EventBus
    const eventBus = new EventBus(); 
    
    // Use the imported PDFLinkService
    const pdfLinkService = new PDFLinkService({ eventBus }); 

    // Use the imported PDFViewer
    const pdfViewerInstance = new PDFViewer({
        container: viewerContainer,
        eventBus: eventBus,
        linkService: pdfLinkService,
        textLayerMode: 1,
        removePageBorders: true,
        useOnlyCssZoom: true,
    });
    pdfLinkService.setViewer(pdfViewerInstance);

    eventBus.on('pagesinit', () => {
        pdfViewerInstance.currentScaleValue = 'page-width';
    });

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = function() {
                const typedarray = new Uint8Array(this.result);
                // Use the imported getDocument
                getDocument({ data: typedarray }).promise.then(pdfDoc => {
                    pdfViewerInstance.setDocument(pdfDoc);
                    pdfLinkService.setDocument(pdfDoc, null);
                }).catch(error => {
                    console.error("Error loading PDF document:", error);
                    alert("Error loading PDF: " + error.message);
                });
            };
            fileReader.readAsArrayBuffer(file);
        }
    });

    // --- Feature Toggles & State (remains the same) ---
    let isFluidMode = false;
    let isDrawingMode = false;
    let isAutoDisappear = false;
    let drawingClearTimeout = null;

    const toggleFluidBtn = document.getElementById('toggle-fluid');
    const toggleDrawingBtn = document.getElementById('toggle-drawing');
    const drawingControlsEl = document.getElementById('drawing-controls');
    const toggleAutoDisappearBtn = document.getElementById('toggle-auto-disappear');
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');

    // --- Fluid/Ripple Mode (remains the same) ---
    toggleFluidBtn.addEventListener('click', () => {
        isFluidMode = !isFluidMode;
        toggleFluidBtn.classList.toggle('active', isFluidMode);
    });

    pdfViewerWrapper.addEventListener('mousedown', (e) => {
        if (isFluidMode && e.target.closest('#viewerContainer')) {
            createRipple(e);
        }
    });
    pdfViewerWrapper.addEventListener('touchstart', (e) => {
        if (isFluidMode && e.target.closest('#viewerContainer')) {
            createRipple(e.touches[0]);
        }
    });


    function createRipple(event) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        pdfViewerWrapper.appendChild(ripple);

        const rect = pdfViewerWrapper.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        const r = Math.floor(Math.random() * 100 + 100);
        const g = Math.floor(Math.random() * 100 + 100);
        const b = Math.floor(Math.random() * 100 + 155);
        ripple.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.4)`;

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // --- Drawing Mode (remains the same) ---
    const drawingCanvas = document.getElementById('drawing-canvas');
    const ctx = drawingCanvas.getContext('2d');
    const strokeColorInput = document.getElementById('stroke-color');
    const strokeWidthInput = document.getElementById('stroke-width');
    const fillColorInput = document.getElementById('fill-color'); 

    let isDrawing = false;
    let lastX, lastY;

    function resizeDrawingCanvas() {
        const rect = pdfViewerWrapper.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;
    }
    window.addEventListener('resize', resizeDrawingCanvas);
    

    toggleDrawingBtn.addEventListener('click', () => {
        isDrawingMode = !isDrawingMode;
        toggleDrawingBtn.classList.toggle('active', isDrawingMode);
        drawingControlsEl.classList.toggle('controls-hidden', !isDrawingMode);
        
        if (isDrawingMode) {
            resizeDrawingCanvas(); 
            drawingCanvas.style.pointerEvents = 'auto';
            viewerContainer.style.overflow = 'hidden'; 
        } else {
            drawingCanvas.style.pointerEvents = 'none';
            viewerContainer.style.overflow = 'auto'; 
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); 
            if (drawingClearTimeout) clearTimeout(drawingClearTimeout);
        }
    });

    toggleAutoDisappearBtn.addEventListener('click', () => {
        isAutoDisappear = !isAutoDisappear;
        toggleAutoDisappearBtn.classList.toggle('active', isAutoDisappear);
        if (!isAutoDisappear && drawingClearTimeout) {
             clearTimeout(drawingClearTimeout);
        } else if (isAutoDisappear && !isDrawing) { 
            if (drawingClearTimeout) clearTimeout(drawingClearTimeout);
            drawingClearTimeout = setTimeout(clearDrawing, 1000);
        }
    });

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX);
        const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY);
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); 

        const { x, y } = getMousePos(drawingCanvas, e);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColorInput.value;
        ctx.lineWidth = strokeWidthInput.value;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }

    function startDrawing(e) {
        if (!isDrawingMode) return;
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getMousePos(drawingCanvas, e);
        [lastX, lastY] = [x, y];
        
        if (isAutoDisappear && drawingClearTimeout) {
            clearTimeout(drawingClearTimeout);
        }
    }

    function stopDrawing(e) {
        if (!isDrawing) return;
        e.preventDefault();
        isDrawing = false;
        ctx.beginPath(); 

        if (isAutoDisappear) {
            if (drawingClearTimeout) clearTimeout(drawingClearTimeout); 
            drawingClearTimeout = setTimeout(clearDrawing, 1000);
        }
    }
    
    function clearDrawing() {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing); 

    drawingCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    drawingCanvas.addEventListener('touchmove', draw, { passive: false });
    drawingCanvas.addEventListener('touchend', stopDrawing);

    // --- Fullscreen (remains the same) ---
    toggleFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // --- Landscape Enforcement (remains the same) ---
    function lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
                console.warn("Cannot lock orientation:", err);
            });
        } else {
            console.warn("Screen Orientation API not fully supported.");
        }
    }
    if (window.innerHeight < window.innerWidth) { 
        lockOrientation();
    }
    window.addEventListener('orientationchange', () => { 
        setTimeout(() => {
            if (window.innerHeight < window.innerWidth) { 
                 lockOrientation();
            }
        }, 200);
    });
    
    // Initial setup call
    resizeDrawingCanvas(); 
});