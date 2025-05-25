document.addEventListener('DOMContentLoaded', () => {
    const pdfFile = document.getElementById('pdfFile');
    const pdfCanvas = document.getElementById('pdfCanvas');
    const pdfCtx = pdfCanvas.getContext('2d');
    const fluidCanvas = document.getElementById('fluidCanvas');
    const fluidCtx = fluidCanvas.getContext('2d');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const drawingCtx = drawingCanvas.getContext('2d');

    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumDisplay = document.getElementById('page_num');
    const pageCountDisplay = document.getElementById('page_count');

    const toggleFluid = document.getElementById('toggleFluid');
    const toggleDraw = document.getElementById('toggleDraw');
    const toggleDisappearingDraw = document.getElementById('toggleDisappearingDraw');
    const clearDrawingBtn = document.getElementById('clearDrawing');

    let pdfDoc = null;
    let currentPageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;

    let isFluidActive = false;
    let isDrawActive = false;
    let isDisappearingDrawActive = false;

    let isDrawing = false;
    let lastX, lastY;
    let currentPath = []; // For disappearing ink or current stroke
    let permanentStrokes = []; // Array of paths (each path is an array of points)
    let disappearingTimeout = null;

    // --- PDF.js Setup ---
    pdfFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = function() {
                const typedarray = new Uint8Array(this.result);
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    pdfDoc = pdf;
                    currentPageNum = 1;
                    pageCountDisplay.textContent = pdfDoc.numPages;
                    renderPage(currentPageNum);
                    updateNavButtons();
                    clearAllDrawings(); // Clear drawings from previous PDF
                }).catch(err => console.error("Error loading PDF:", err));
            };
            fileReader.readAsArrayBuffer(file);
        } else {
            alert('Please select a valid PDF file.');
        }
    });

    function renderPage(num) {
        if (!pdfDoc) return;
        pageRendering = true;
        pageNumDisplay.textContent = num;

        pdfDoc.getPage(num).then(page => {
            const desiredWidth = pdfCanvas.clientWidth;
            const viewport = page.getViewport({ scale: 1 });
            const scale = desiredWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale: scale });

            pdfCanvas.height = scaledViewport.height;
            pdfCanvas.width = scaledViewport.width;
            
            // Match overlay canvas sizes
            fluidCanvas.height = scaledViewport.height;
            fluidCanvas.width = scaledViewport.width;
            drawingCanvas.height = scaledViewport.height;
            drawingCanvas.width = scaledViewport.width;


            const renderContext = {
                canvasContext: pdfCtx,
                viewport: scaledViewport
            };
            page.render(renderContext).promise.then(() => {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                redrawAllPermanentStrokes(); // Redraw on new page/resize
            }).catch(err => console.error("Error rendering page:", err));
        });
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPageNum <= 1) return;
        currentPageNum--;
        queueRenderPage(currentPageNum);
        updateNavButtons();
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPageNum >= pdfDoc.numPages) return;
        currentPageNum++;
        queueRenderPage(currentPageNum);
        updateNavButtons();
    });

    function updateNavButtons() {
        prevPageBtn.disabled = !pdfDoc || currentPageNum <= 1;
        nextPageBtn.disabled = !pdfDoc || currentPageNum >= pdfDoc.numPages;
    }
    
    // Call renderPage on window resize to adjust PDF scale
    // Debounce resize for performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (pdfDoc) renderPage(currentPageNum);
        }, 250);
    });


    // --- Feature Toggles ---
    toggleFluid.addEventListener('change', (e) => {
        isFluidActive = e.target.checked;
        fluidCanvas.style.pointerEvents = isFluidActive ? 'auto' : 'none';
        if (!isFluidActive) fluidCtx.clearRect(0, 0, fluidCanvas.width, fluidCanvas.height);
    });

    toggleDraw.addEventListener('change', (e) => isDrawActive = e.target.checked);
    toggleDisappearingDraw.addEventListener('change', (e) => isDisappearingDrawActive = e.target.checked);

    // --- Drawing Logic ---
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        // For touch events, use changedTouches
        const clientX = evt.clientX || (evt.changedTouches && evt.changedTouches[0].clientX);
        const clientY = evt.clientY || (evt.changedTouches && evt.changedTouches[0].clientY);

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        if (!isDrawActive && !isDisappearingDrawActive) return;
        isDrawing = true;
        const pos = getMousePos(drawingCanvas, e);
        lastX = pos.x;
        lastY = pos.y;
        currentPath = [{ x: lastX, y: lastY }]; // Start new path
        drawingCtx.beginPath();
        drawingCtx.moveTo(lastX, lastY);

        // Stop PDF scrolling/interaction while drawing
        if (pdfDoc) { // only if a PDF is loaded
            document.getElementById('pdf-viewer-box').style.pointerEvents = 'none';
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling while drawing
        const pos = getMousePos(drawingCanvas, e);

        drawingCtx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Red color for drawing
        drawingCtx.lineWidth = 3;
        drawingCtx.lineCap = 'round';
        drawingCtx.lineJoin = 'round';

        drawingCtx.lineTo(pos.x, pos.y);
        drawingCtx.stroke();
        
        currentPath.push({ x: pos.x, y: pos.y }); // Add to current path

        lastX = pos.x;
        lastY = pos.y;
        drawingCtx.beginPath(); // Start a new sub-path for smoother lines on HTML canvas
        drawingCtx.moveTo(lastX, lastY);

    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        drawingCtx.closePath();

        if (currentPath.length > 1) { // Only save/process if something was drawn
            if (isDisappearingDrawActive) {
                // Path is already drawn, set timeout to clear it
                clearTimeout(disappearingTimeout); // Clear any existing timeout
                const pathDrawn = [...currentPath]; // Copy the path
                disappearingTimeout = setTimeout(() => {
                    // Clear entire canvas and redraw permanent strokes
                    // This effectively removes the temporary stroke
                    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                    redrawAllPermanentStrokes();
                }, 1000);
            } else if (isDrawActive) {
                permanentStrokes.push([...currentPath]); // Save a copy of the path
            }
        }
        currentPath = []; // Reset current path

        // Re-enable PDF interaction
        if (pdfDoc) {
             document.getElementById('pdf-viewer-box').style.pointerEvents = 'auto';
        }
    }

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing); // Stop if mouse leaves canvas

    drawingCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
    drawingCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
    drawingCanvas.addEventListener('touchend', (e) => { e.preventDefault(); stopDrawing(e); }, { passive: false });


    function redrawAllPermanentStrokes() {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        drawingCtx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        drawingCtx.lineWidth = 3;
        drawingCtx.lineCap = 'round';
        drawingCtx.lineJoin = 'round';

        permanentStrokes.forEach(path => {
            if (path.length < 2) return;
            drawingCtx.beginPath();
            drawingCtx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                drawingCtx.lineTo(path[i].x, path[i].y);
            }
            drawingCtx.stroke();
        });
    }

    function clearAllDrawings() {
        permanentStrokes = [];
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
    clearDrawingBtn.addEventListener('click', clearAllDrawings);

    // --- Fluid Effect (Simple Particle Trail) ---
    let fluidParticles = [];
    function animateFluid() {
        if (isFluidActive) {
            fluidCtx.fillStyle = 'rgba(52, 52, 52, 0.1)'; // Fading effect for trail on #343434
            fluidCtx.fillRect(0, 0, fluidCanvas.width, fluidCanvas.height);

            fluidParticles.forEach((p, index) => {
                p.life--;
                if (p.life <= 0) {
                    fluidParticles.splice(index, 1);
                } else {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.size *= 0.95; // Shrink

                    fluidCtx.beginPath();
                    fluidCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    fluidCtx.fillStyle = `rgba(0, 150, 255, ${p.life / 50})`; // Blue, fades out
                    fluidCtx.fill();
                }
            });
        }
        requestAnimationFrame(animateFluid);
    }
    
    // Only add particles if fluid is active
    // Use pdf-viewer-box for fluid mousemove to cover the whole area
    document.getElementById('pdf-viewer-box').addEventListener('mousemove', (e) => {
        if (isFluidActive) {
            const pos = getMousePos(fluidCanvas, e); // Use fluidCanvas for coords
            for(let i = 0; i < 2; i++) { // Add a couple of particles
                 fluidParticles.push({
                    x: pos.x,
                    y: pos.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 5 + 2,
                    life: 30 + Math.random() * 20 // Frames
                });
            }
        }
    });
    // Start fluid animation loop
    animateFluid();


    // --- Scrolling Lock When Drawing ---
    // This is partially handled by setting pointerEvents='none' on pdf-viewer-box
    // For wheel events, which might bubble up:
    document.addEventListener('wheel', (e) => {
        // Check if the event target is within the pdf viewer area
        // and if drawing is active
        if (isDrawing && document.getElementById('pdf-viewer-box').contains(e.target)) {
            e.preventDefault();
        }
    }, { passive: false });


    // Initial setup
    updateNavButtons();
    // Ensure canvas sizes are set on load (important if CSS sets initial size in %/vh/vw)
    // Use a small timeout to let CSS fully apply
    setTimeout(() => {
        if (pdfDoc) {
            renderPage(currentPageNum);
        } else {
            // Set a placeholder size if no PDF loaded yet
            const box = document.getElementById('pdf-viewer-box');
            const w = box.clientWidth;
            const h = box.clientHeight;
            [pdfCanvas, fluidCanvas, drawingCanvas].forEach(c => {
                c.width = w; c.height = h;
            });
        }
    }, 100);

});