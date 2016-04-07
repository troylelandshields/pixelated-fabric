"use strict";

(function() {
  var $ = $ || function(id) { return document.getElementById(id); }

  var canvas = new fabric.Canvas("example-canvas");

  canvas.setHeight(400);
  canvas.setWidth(400);

  var pixelWidthInput = $("pixel-width");
  var pixelHeightInput = $("pixel-height");

  canvas.pixelate({
    heightInPixels: pixelHeightInput.value,
    widthInPixels: pixelWidthInput.value
  });
  
  var brushColorInput = $("brush-color-input");
  var brushSizeInput = $("brush-size-input");

  canvas.pixelDrawingBrush = new pixelatedFabric.PixelDrawingBrush({
    color: brushColorInput.value,
    size: brushSizeInput.value
  });

  canvas.setIsPixelDrawingMode(true);
  
  canvas.renderAll();
  
  
  //Set up event listeners
  pixelWidthInput.onchange = function() {
    canvas.setPixelWidth(pixelWidthInput.value);
  };
  pixelHeightInput.onchange = function() {
    canvas.setPixelHeight(pixelHeightInput.value);
  };  
      
  brushColorInput.onchange = function() {
    canvas.pixelDrawingBrush.setColor(brushColorInput.value);
  };
  brushSizeInput.onchange = function() {
    canvas.pixelDrawingBrush.setSize(brushSizeInput.value);
  };
  
  
  
})();