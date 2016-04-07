"use strict";

(function() {

  var canvas = new fabric.Canvas("example-canvas");

  canvas.setHeight(512);
  canvas.setWidth(512);

  canvas.pixelate({
    heightInPixels: 32,
    widthInPixels: 32
  });
  
  canvas.pixelDrawingBrush = new pixelatedFabric.PixelDrawingBrush({
    color: "red",
    size: 3
  });
  
  canvas.setIsPixelDrawingMode(true);
  
  canvas.renderAll();
})();