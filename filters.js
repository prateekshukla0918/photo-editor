class Filters {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    apply(filterName) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const pixels = imageData.data;

        switch (filterName) {
            case 'grayscale':
                this.grayscale(pixels);
                break;
            case 'sepia':
                this.sepia(pixels);
                break;
            case 'invert':
                this.invert(pixels);
                break;
            case 'blur':
                this.blur(imageData);
                break;
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    grayscale(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            pixels[i] = avg;     // Red
            pixels[i + 1] = avg; // Green
            pixels[i + 2] = avg; // Blue
        }
    }

    sepia(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            pixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            pixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            pixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }

    invert(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];         // Red
            pixels[i + 1] = 255 - pixels[i + 1]; // Green
            pixels[i + 2] = 255 - pixels[i + 2]; // Blue
        }
    }

    blur(imageData) {
        const kernel = [
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9]
        ];
        
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side/2);
        
        const src = imageData.data;
        const tmpCanvas = document.createElement('canvas');
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = this.width;
        tmpCanvas.height = this.height;
        
        tmpCtx.putImageData(imageData, 0, 0);
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        
                        if (scy >= 0 && scy < this.height && scx >= 0 && scx < this.width) {
                            const srcOff = (scy * this.width + scx) * 4;
                            const wt = kernel[cy][cx];
                            
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                
                const dstOff = (y * this.width + x) * 4;
                imageData.data[dstOff] = r;
                imageData.data[dstOff + 1] = g;
                imageData.data[dstOff + 2] = b;
                imageData.data[dstOff + 3] = a;
            }
        }
    }
}