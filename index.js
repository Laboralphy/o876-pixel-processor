const PP_METHOD_CREATE = 0;
const PP_METHOD_GET = 1;

/**
 * @typedef Region {object}
 * @property [x {number}]
 * @property [y {number}]
 * @property width {number}
 * @property height {number}
 *
 * @typedef Color {object}
 * @property r {number}
 * @property g {number}
 * @property b {number}
 * @property a {number}
 *
 * @typedef PixelContext {object}
 * @property canvas {Canvas}
 * @property region {Region}
 * @property x {number}
 * @property y {number}
 * @property color {Color}
 * @property pixel {function}
 */

class PixelProcessor {

    /**
     * Create a new region that fit inside the given canvas dimensions
     * The region limits will never outbound the given width and height
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

    static _process(oCanvas, nMethod, cb, region) {
        const ctx = oCanvas.getContext('2d');
        const oImageData = nMethod === 0
            ? ctx.createImageData(region.width, region.height)
            : ctx.getImageData(region.x, region.y, region.width, region.height);
        const pixels = oImageData.data;
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
    }

    /**
     * Use an existing canvas
     * read README.md
     * @param oCanvas {HTMLCanvasElement}
     * @param cb {function(PixelContext)} callback
     * @param region {Region|undefined}
     */
    static filter(oCanvas, cb, region = undefined) {
        let h = oCanvas.height;
        let w = oCanvas.width;
        if (region === undefined || region === null) {
            region = {x: 0, y: 0, width: w, height: h};
        }
        region = PixelProcessor.fit(w, h, region);
        PixelProcessor._process(oCanvas, PP_METHOD_GET, cb, region);
        return oCanvas;
    }

    /**
     * read README.md
     * @param oCanvas {HTMLCanvasElement}
     * @param cb {function(PixelContext)} callback
     * @param region {Region|undefined}
     * @returns {HTMLCanvasElement}
     */
    static paint(oCanvas, cb, region = undefined) {
        if (oCanvas === null) {
            if (region !== undefined && region !== null) {
                // region not null : x and y must be 0
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
            } else {
                throw new Error('either canvas or region must be defined')
            }
        } else {
            if (region === undefined || region === null) {
                region = {x: 0, y: 0, width: oCanvas.width, height: oCanvas.height};
            }
        }
        PixelProcessor._process(oCanvas, PP_METHOD_CREATE, cb, region);
        return oCanvas;
    }
}

export default PixelProcessor;