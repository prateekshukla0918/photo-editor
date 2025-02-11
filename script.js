class PhotoEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.history = new History();
        
        this.setupEventListeners();
        this.currentImage = null;
        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };

        feather.replace();
    }

    setupEventListeners() {
        // File input handling
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag and drop
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });

        // Adjustment controls
        document.getElementById('brightness').addEventListener('input', (e) => this.updateAdjustment('brightness', e.target.value));
        document.getElementById('contrast').addEventListener('input', (e) => this.updateAdjustment('contrast', e.target.value));
        document.getElementById('saturation').addEventListener('input', (e) => this.updateAdjustment('saturation', e.target.value));

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', () => this.applyFilter(button.dataset.filter));
        });

        // History controls
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // Download and reset
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.resetCanvas();
                this.history.push(this.canvas.toDataURL());
                document.querySelector('.canvas-container').classList.add('image-loaded');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetCanvas() {
        // Set canvas size while maintaining aspect ratio
        const maxWidth = this.canvas.parentElement.clientWidth * 0.9;
        const maxHeight = this.canvas.parentElement.clientHeight * 0.9;
        
        let width = this.currentImage.width;
        let height = this.currentImage.height;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.render();
    }

    render() {
        if (!this.currentImage) return;

        this.ctx.filter = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);

        // Apply adjustments
        this.ctx.filter = `brightness(${100 + parseInt(this.adjustments.brightness)}%) ` +
                         `contrast(${100 + parseInt(this.adjustments.contrast)}%) ` +
                         `saturate(${100 + parseInt(this.adjustments.saturation)}%)`;
        
        this.ctx.drawImage(this.canvas, 0, 0);
    }

    updateAdjustment(type, value) {
        this.adjustments[type] = value;
        this.render();
        this.history.push(this.canvas.toDataURL());
        this.updateHistoryButtons();
    }

    applyFilter(filterName) {
        if (!this.currentImage) return;

        const filters = new Filters(this.ctx, this.canvas.width, this.canvas.height);
        filters.apply(filterName);
        this.history.push(this.canvas.toDataURL());
        this.updateHistoryButtons();
    }

    undo() {
        const previousState = this.history.undo();
        if (previousState) {
            this.loadHistoryState(previousState);
        }
        this.updateHistoryButtons();
    }

    redo() {
        const nextState = this.history.redo();
        if (nextState) {
            this.loadHistoryState(nextState);
        }
        this.updateHistoryButtons();
    }

    loadHistoryState(state) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = state;
    }

    updateHistoryButtons() {
        document.getElementById('undoBtn').disabled = !this.history.canUndo();
        document.getElementById('redoBtn').disabled = !this.history.canRedo();
    }

    downloadImage() {
        if (!this.currentImage) return;

        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    resetAll() {
        if (!this.currentImage) return;

        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };

        // Reset range inputs
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('saturation').value = 0;

        this.resetCanvas();
        this.history.push(this.canvas.toDataURL());
        this.updateHistoryButtons();
    }
}

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoEditor();
});