const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');

const filters = {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    saturation: document.getElementById('saturation'),
    grayscale: document.getElementById('grayscale'),
};

let image = new Image();

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

image.onload = function() {
    canvas.width = image.width;
    canvas.height = image.height;
    applyFilters();
};

Object.values(filters).forEach(filter => {
    filter.addEventListener('input', applyFilters);
});

function applyFilters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `
        brightness(${filters.brightness.value}%) 
        contrast(${filters.contrast.value}%) 
        saturate(${filters.saturation.value}%) 
        grayscale(${filters.grayscale.value}%)
    `;
    ctx.drawImage(image, 0, 0);
}

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
});