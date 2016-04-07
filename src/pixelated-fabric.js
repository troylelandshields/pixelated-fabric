"use strict";



(function() {
  var theCanvas;
  var pixelatedFabric = pixelatedFabric || { version: "1.0" };

  //Set it on the window
  window.pixelatedFabric = pixelatedFabric;

  var getDimOfPixel = function(totalLength, numPixels) {
    return Math.floor(totalLength / numPixels);
  }

  var addNewPixel = function(x, y) {
    var left = x * theCanvas.pixelHeightAndWidth;
    var top = y * theCanvas.pixelHeightAndWidth;

    var pxl = new fabric.Rect({
      left: left,
      top: top,
      fill: "rgba(0, 0, 0, 0)",
      stroke: theCanvas.options.stroke,
      width: theCanvas.pixelHeightAndWidth,
      height: theCanvas.pixelHeightAndWidth,
      selectable: false
    });

    theCanvas.pixels[x + "," + y] = pxl;
    theCanvas.add(pxl);
  }

  fabric.Canvas.prototype.pixelate = function(pixelDimensions, options) {
    theCanvas = this;
    this.renderOnAddRemove = false;

    var pixelDimensions = {
      widthInPixels: parseInt(pixelDimensions.widthInPixels),
      heightInPixels: parseInt(pixelDimensions.heightInPixels)
    };
    this.heightInPixels = pixelDimensions.heightInPixels;
    this.widthInPixels = pixelDimensions.widthInPixels;

    this.options = options || { stroke: "gray" };

    //Figure height/width of each logical pixel in terms of on screen pixels
    if (this.getHeight() > this.getWidth()) {
      this.pixelHeightAndWidth = getDimOfPixel(this.getWidth(), pixelDimensions.widthInPixels);
    }
    else {
      this.pixelHeightAndWidth = getDimOfPixel(this.getHeight(), pixelDimensions.heightInPixels);
    }

    //Change height/width of canvas
    var newHeight = this.pixelHeightAndWidth * pixelDimensions.heightInPixels;
    var newWidth = this.pixelHeightAndWidth * pixelDimensions.widthInPixels;

    this.setHeight(newHeight);
    this.setWidth(newWidth);

    this.pixels = {};
    //Build and plot each pixel
    for (var i = 0; i < pixelDimensions.widthInPixels; i++) {
      for (var j = 0; j < pixelDimensions.heightInPixels; j++) {
        addNewPixel(i, j);
      }
    }

    var paint = function(brushLeft, brushTop, brushSize, brushColor) {
      //get top-left pixel
      var topX = brushLeft / theCanvas.pixelHeightAndWidth;
      var leftY = brushTop / theCanvas.pixelHeightAndWidth;
      console.log(topX, leftY);

      for (var i = topX; i < (topX + brushSize); i++) {
        for (var j = leftY; j < (leftY + brushSize); j++) {
          var pxl = theCanvas.pixels[i + "," + j];
          if (pxl) {
            pxl.setColor(brushColor);
          }
        }
      }
    }

    var brushCursor;
    var dragging = false;
    this.on('mouse:move', function(e) {
      if (this.isPixelDrawingMode) {
        //Create brush cursor if it doesn't exist
        if (brushCursor) {
          this.remove(brushCursor);
        }

        brushCursor = new fabric.Rect({
          fill: this.pixelDrawingBrush.color,
          width: this.pixelHeightAndWidth * this.pixelDrawingBrush.size,
          height: this.pixelHeightAndWidth * this.pixelDrawingBrush.size,
          selectable: false
        });
        this.add(brushCursor);

        //Move brush cursor
        var offset = this.pixelHeightAndWidth * Math.floor(this.pixelDrawingBrush.size / 2);
        var leftMostPoint = e.target.left - offset;
        var topMostPoint = e.target.top - offset;
        brushCursor.setTop(topMostPoint);
        brushCursor.setLeft(leftMostPoint);

        //If user is clicked down, color pixels
        if (dragging) {
          paint(leftMostPoint, topMostPoint, this.pixelDrawingBrush.size, this.pixelDrawingBrush.color);
        }

        this.renderAll();
      }
    });

    this.on('mouse:down', function(e) {
      dragging = true;
      paint(brushCursor.getLeft(), brushCursor.getTop(), this.pixelDrawingBrush.size, this.pixelDrawingBrush.color);
    });
    this.on('mouse:up', function(e) {
      dragging = false;
    })

  };

  var changeDimension = function(oldDim, newDim, otherDim, isWidth) {
    var diff = newDim - oldDim;

    if (diff > 0) {
      //Add new row/col of pixels to bottom or right
      for (var i = 0; i < otherDim; i++) {
        for (var j = oldDim; j < newDim; j++) {
          if (isWidth) {
            var x = j;
            var y = i;
          }
          else {
            x = i;
            y = j;
          }
          addNewPixel(x, y);
        }
      }
    }
    else if (diff < 0) {
      for (var i = 0; i < otherDim; i++) {
        for (var j = newDim; j < oldDim; j++) {
          if (isWidth) {
            x = j;
            y = i;
          }
          else {
            x = i;
            y = j;
          }
          
          var pxl = theCanvas.pixels[x + "," + y];
          theCanvas.pixels[x + "," + y] = undefined;

          if (pxl) {
            theCanvas.remove(pxl);
          }
        }
      }
    }

    return diff * theCanvas.pixelHeightAndWidth;
  }

  fabric.Canvas.prototype.setPixelHeight = function(newHeightInPixels) {
    var oldHeightInPixels = this.heightInPixels;
    newHeightInPixels = parseInt(newHeightInPixels);

    var diffInCanvasSize = changeDimension(oldHeightInPixels, newHeightInPixels, this.widthInPixels);

    this.setHeight(this.getHeight() + diffInCanvasSize);
    this.heightInPixels = newHeightInPixels;
    this.renderAll();
  };

  fabric.Canvas.prototype.setPixelWidth = function(newWidthInPixels) {
    var oldWidthInPixels = this.widthInPixels;
    newWidthInPixels = parseInt(newWidthInPixels);

    var diffInCanvasSize = changeDimension(oldWidthInPixels, newWidthInPixels, this.heightInPixels, true);

    this.setWidth(this.getWidth() + diffInCanvasSize);
    this.widthInPixels = newWidthInPixels;
    this.renderAll();
  };

  fabric.Canvas.prototype.setIsPixelDrawingMode = function(turnOn) {
    this.isPixelDrawingMode = turnOn;
  };

  //Pixel Drawing Brush definition
  function PixelDrawingBrush(options) {
    this.color = options.color || "black";
    this.size = parseInt(options.size) || 1;
  }

  PixelDrawingBrush.prototype.setColor = function(color) {
    this.color = color;
  };

  PixelDrawingBrush.prototype.setSize = function(size) {
    this.size = parseInt(size);
  };

  pixelatedFabric.PixelDrawingBrush = PixelDrawingBrush;
})();