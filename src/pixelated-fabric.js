"use strict";



(function() {
  var pixelatedFabric = pixelatedFabric || { version: "1.0" };

  //Set it on the window
  window.pixelatedFabric = pixelatedFabric;

  var getDimOfPixel = function(totalLength, numPixels) {
    return Math.floor(totalLength / numPixels);
  }

  fabric.Canvas.prototype.pixelate = function(pixelDimensions) {
    this.renderOnAddRemove = false;

    var pixelHeightAndWidth;

    //Figure height/width of each logical pixel in terms of on screen pixels
    if (this.getHeight() > this.getWidth()) {
      pixelHeightAndWidth = getDimOfPixel(this.getWidth(), pixelDimensions.widthInPixels);
    }
    else {
      pixelHeightAndWidth = getDimOfPixel(this.getHeight(), pixelDimensions.heightInPixels);
    }

    //Change height/width of canvas
    var newHeight = pixelHeightAndWidth * pixelDimensions.heightInPixels;
    var newWidth = pixelHeightAndWidth * pixelDimensions.widthInPixels;

    this.setHeight(newHeight);
    this.setWidth(newWidth);

    //Build and plot each pixel
    for (var i = 0; i < pixelDimensions.widthInPixels; i++) {
      for (var j = 0; j < pixelDimensions.heightInPixels; j++) {
        var left = i * pixelHeightAndWidth;
        var top = j * pixelHeightAndWidth;
        var pxl = new fabric.Rect({
          left: left,
          top: top,
          fill: "rgba(0, 0, 0, 0)",
          stroke: "black",
          width: pixelHeightAndWidth,
          height: pixelHeightAndWidth,
          selectable: false
        });

        this.add(pxl);
      }
    }

    var brushCursor;
    this.on('mouse:move', function(e) {
      if (this.isPixelDrawingMode) {
        if (!brushCursor) {
          brushCursor = new fabric.Rect({
            left: left,
            top: top,
            fill: this.pixelDrawingBrush.color,
            width: pixelHeightAndWidth * this.pixelDrawingBrush.size,
            height: pixelHeightAndWidth * this.pixelDrawingBrush.size,
            selectable: false
          });
          
          this.add(brushCursor);
        }
        
        
        var offset = pixelHeightAndWidth * (this.pixelDrawingBrush.size/2);
        brushCursor.setTop(e.target.top - offset);
        brushCursor.setLeft(e.target.left - offset);
        this.renderAll();
      }
    });

    this.pixelDrawingBrush = new pixelatedFabric.PixelDrawingBrush({});
  };

  fabric.Canvas.prototype.setIsPixelDrawingMode = function(turnOn) {
    this.isPixelDrawingMode = turnOn;
  };

  //Pixel Drawing Brush definition
  function PixelDrawingBrush(options) {
    this.color = options.color || "black";
    this.size = options.size || 1;
  }

  PixelDrawingBrush.prototype.setColor = function(color) {
    this.color = color;
  };

  PixelDrawingBrush.prototype.setSize = function(size) {
    this.size = size;
  };

  pixelatedFabric.PixelDrawingBrush = PixelDrawingBrush;
})();