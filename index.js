/**
 * @typedef {object} Region
 * @property [x {number}]
 * @property [y {number}]
 * @property width {number}
 * @property height {number}
 */
class PixelProcessor {

    constructor() {

    }

    /**
     * Create a new region that fit inside the given canvas dimensions
     * @param width {number}
     * @param height {number}
     * @param region {Region}
     * @return {Region}
     */
    static fit(width, height, region) {
        let xReg = region.x;
        let wReg = region.width;
        let yReg = region.y;
        let hReg = region.height;
        if (xReg < 0) {
            wReg += xReg;
            xReg = 0;
        }
        if ((xReg + wReg) > width) {
            wReg = width - xReg;
        }
        if (yReg < 0) {
            hReg += yReg;
            yReg = 0;
        }
        if ((xReg + wReg) > width) {
            wReg = width - xReg;
        }
        return {
            x: xReg,
            y: yReg,
            width: wReg,
            height: hReg
        };
    }

    /**
     *
     * @param oCanvas {HTMLCanvasElement}
     * @param cb {function({
     *  canvas: {
     *      width: number,
     *      height: number
     *  },
     *  region: {
     *      x: number,
     *      y: number
     *      width: number,
     *      height: number
     *  }
     *  x: number,
     *  y: number,
     *  color: {
     *      r: number,
     *      g: number,
     *      b: number,
     *      a: number
     *  },
     *  pixel: function(x: number, y: number)
     *  })} callback
     * @param region {Region}
     */
    static process(oCanvas, cb, region = undefined) {
        let oImageData;
        let ctx;
        if (oCanvas !== null) {
            let h = oCanvas.height;
            let w = oCanvas.width;
            if (region === undefined || region === null) {
                region = {x: 0, y: 0, width: w, height: h};
            }
            region = PixelProcessor.fit(w, h, region);

            ctx = oCanvas.getContext('2d');
            oImageData = ctx.getImageData(region.x, region.y, region.width, region.height);
        } else {
            if (('x' in region) && region.x !== 0) {
                throw new Error('region.x must be set to 0 when "canvas" parameter is null');
            } else {
                region.x = 0;
            }
            if (('y' in region) && region.y !== 0) {
                throw new Error('region.y must be set to 0 when "canvas" parameter is null');
            } else {
                region.y = 0;
            }
            oCanvas = document.createElement('canvas');
            oCanvas.width = region.width;
            oCanvas.height = region.height;
            ctx = oCanvas.getContext('2d');
            oImageData = ctx.createImageData(region.width, region.height);
        }
        let pixels = oImageData.data;
        const hReg = region.height;
        const wReg = region.width;

        let oPixelCtx = {
            canvas: {
                width: oCanvas.width,
                height: oCanvas.height
            },
            region: {
                x: region.x,
                y: region.y,
                width: region.width,
                height: region.height
            },
            x: 0,
            y: 0,
            color: {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            },
            pixel: (x, y) => {
                let nOffset = (y * wReg + x) << 2;
                return {
                    r: pixels[nOffset],
                    g: pixels[nOffset + 1],
                    b: pixels[nOffset + 2],
                    a: pixels[nOffset + 3]
                };
            }
        };
        let aColors = [];
        const pcolor = oPixelCtx.color;
        for (let y = 0; y < hReg; ++y) {
            for (let x = 0; x < wReg; ++x) {
                let nOffset = (y * wReg + x) << 2;
                oPixelCtx.x = x;
                oPixelCtx.y = y;
                pcolor.r = pixels[nOffset];
                pcolor.g = pixels[nOffset + 1];
                pcolor.b = pixels[nOffset + 2];
                pcolor.a = pixels[nOffset + 3];
                cb(oPixelCtx);
                if (!oPixelCtx.color) {
                    throw new Error('pixelprocessor : callback destroyed the color');
                }
                aColors.push({
                    offset: nOffset,
                    r: pcolor.r,
                    g: pcolor.g,
                    b: pcolor.b,
                    a: pcolor.a
                });
            }
        }
        aColors.forEach(({offset, r, g, b, a}) => {
            pixels[offset] = r;
            pixels[offset + 1] = g;
            pixels[offset + 2] = b;
            pixels[offset + 3] = a;
        });
        ctx.putImageData(oImageData, region.x, region.y);
        return oCanvas;
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.info(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    createProgram(gl, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.info(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    processShader(oCanvas, oFragment) {
    }
}

export default PixelProcessor;