# Pixel Processor

## Description
This tool applies a callback function on every pixels of an existing canvas, or a newly created canvas.
The callback function may change the color of the current iterated pixel.
This allows the creation of very simple canvas filters.

## How to use

### example 1 : filter
The filter static method will provide the callback function with the pixel existing color so the function may freely modify the resulting color.
If the callback function does not alter the ".color" object components ("r", "g", "b" and "a") then the existing pixel remain unchanged.
The following example will produce a negative-colored image of the canvas which id is "my-canvas".
```js
const cvs = document.getElementById('my-canvas');
PixelProcessor.filter(cvs, function(pctx) {
    pctx.color.r = 255 - pctx.color.r;
    pctx.color.g = 255 - pctx.color.g;
    pctx.color.b = 255 - pctx.color.b;
    pctx.color.a = 255;
});
```

### example 1 : paint
The paint method provide an array of blank pixels. It's up to the callback to define which cololr must be applied to each pixel.
The following example will fill an existing canvas with red pixels.
```js
const cvs = document.getElementById('my-canvas');
PixelProcessor.paint(cvs, function(pctx) {
    pctx.color.r = 255;
    pctx.color.g = 0;
    pctx.color.b = 0;
    pctx.color.a = 255;
});
```




### Callback function
The provided callback function brings a processor context as parameter. The context format is detailed below :
```
{
    "canvas": { // canvas original size
        "width": number,  
        "heigh"t: number
    },
    "region: { // region size and position
        "x": number,   
        "y": number
        "width": number,
        "height": number
    }
    "x": number, // current pixel coordinates
    "y": number,
    "color": { // current pixel color
        "r": number,
        "g": number,
        "b": number,
        "a": number
    },
    pixel: function(x: number, y: number) // a function that can retrieve another pixel color
}
``` 