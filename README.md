# Pixel Processor

## Description
This tool applies a callback function on every pixels of an existing canvas, or a newly created canvas.
The callback function may change the color of the current iterated pixel.
This allows the creation of very simple canvas filters.

## How to use

### example 1

```js
const cvs = document.getElementById('my-canvas');
PixelProcessor.process(cvs, function(pctx) {
    pctx.color.r = 255 - pctx.color.r;
    pctx.color.g = 255 - pctx.color.g;
    pctx.color.b = 255 - pctx.color.b;
    pctx.color.a = 255;
});
```

The above example will produce a negative-colored image of the canvas which id is "my-canvas".


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