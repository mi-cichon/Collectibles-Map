let map = $(".map");
let overlay = $(".overlay");
let mapImage = $(".map img");
let holding = false;
let pinching = false;
let markers = [];
let error = false;
let imageSize = {
    x: 0,
    y: 0
}
let startHoldPos = {
    x: 0,
    y: 0
}
let startHoldMapPos = {
    x: 0,
    y: 0
}
let mouse = {
    x: 0,
    y: 0
}

let lastPinchPos = null;

let zoom = 1;
const maxZoom = 4;

//when documents ready set the image default size
jQuery(() => {
    imageSize.x = map.width();
    mapImage.css("width", `${imageSize.x}px`);
    imageSize.y = mapImage.height();
    map.css("width", `${imageSize.x}px`);
    map.css("height", `${imageSize.y}px`);
    mapImage.css("width", `${imageSize.x}px`);
    mapImage.css("height", `${imageSize.y}px`);
});

//prevent default drag event
$('.map img').on('dragstart', function(event) { event.preventDefault(); });

//on left mouse button click start simulating a drag event
map.on("mousedown", () => {
    holding = true;
    startHoldPos.x = mouse.x;
    startHoldPos.y = mouse.y;
    startHoldMapPos.x = parseInt(mapImage.css("left").replace('px', ''));
    startHoldMapPos.y = parseInt(mapImage.css("top").replace('px', ''));
});

map.on("touchstart", (e) => {
    //starts simulation of drag event but for mobile devices
    if(e.targetTouches.length == 1){
        holding = true;
        startHoldPos.x = e.targetTouches[0].pageX;
        startHoldPos.y = e.targetTouches[0].pageY;
        startHoldMapPos.x = parseInt(mapImage.css("left").replace('px', ''));
        startHoldMapPos.y = parseInt(mapImage.css("top").replace('px', ''));
    }
    //simulation of 'pinching'
    else if(e.targetTouches.length == 2){
        pinching = true;
    }
});

//zooming feature based on mouse scroll event
map.on('mousewheel DOMMouseScroll', function(e){
    let imagePos = {
        x: parseInt(mapImage.css("left").replace('px', '')),
        y: parseInt(mapImage.css("top").replace('px', ''))
    }
    zoom = clamp(zoom + parseInt(e.originalEvent.deltaY) / 1000 * -1, 1, maxZoom);
    mapImage.css("width", `${imageSize.x * zoom}px`);
    mapImage.css("height", `${imageSize.y * zoom}px`);
    overlay.css("width", zoom * 100 + "%");
    overlay.css("height", zoom * 100 + "%");
    let posx = clamp(imagePos.x, -1 * (map.width() * (zoom) - map.width()), 0);
    let posy = clamp(imagePos.y, -1 * (map.height() * (zoom) - map.height()),0);
    mapImage.css("left", `${posx}px`);
    mapImage.css("top", `${posy}px`);
    moveOverlay(posx, posy);
    let markersSize = 2/3*((maxZoom - zoom)/maxZoom) + 0.5;
    markers.forEach(marker => {
        marker.object.css("width", (marker.size.x * markersSize) + "px");
        marker.object.css("height", (marker.size.y * markersSize) + "px");
    });
});

//when mouse moves update its position, and if the dragging event is on, move the map object relatively to the mouse movement
document.onmousemove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if(holding){
        let posx = clamp((startHoldMapPos.x + mouse.x - startHoldPos.x), -1 * (map.width() * (zoom) - map.width()), 0);
        let posy = clamp((startHoldMapPos.y + mouse.y - startHoldPos.y), -1 * (map.height() * (zoom) - map.height()),0);
        mapImage.css("left", posx.toString() + "px")
        mapImage.css("top", posy.toString() + "px")

        moveOverlay(posx, posy);
    }
}

document.addEventListener("touchmove", function(e){
    //if there is only 1 touch input, move the map object relatively to the touch position
    if(e.targetTouches.length == 1){
        mouse.x = e.targetTouches[0].pageX;
        mouse.y = e.targetTouches[0].pageY;
        if(holding){
            let posx = clamp((startHoldMapPos.x + mouse.x - startHoldPos.x), -1 * (map.width() * (zoom) - map.width()), 0);
            let posy = clamp((startHoldMapPos.y + mouse.y - startHoldPos.y), -1 * (map.height() * (zoom) - map.height()),0);
            mapImage.css("left", posx.toString() + "px")
            mapImage.css("top", posy.toString() + "px")
            moveOverlay(posx, posy);
        }
    }
    //if there are multiple touches and pinching event is on, calculate touch inputs positions and zoom map relatively to them
    else if(pinching){
        let touch = {
            a: {x: e.targetTouches[0].pageX, y: e.targetTouches[0].pageY},
            b: {x: e.targetTouches[1].pageX, y: e.targetTouches[1].pageY}
        }
        if(lastPinchPos == null){
            lastPinchPos = touch;
        }
        else if(touch != lastPinchPos){
            let dist = Math.hypot(
                touch.a.x - touch.b.x,
                touch.a.y - touch.b.y);
            let lastDist = Math.hypot(
                lastPinchPos.a.x - lastPinchPos.b.x,
                lastPinchPos.a.y - lastPinchPos.b.y);

            let offset = lastDist - dist;

            let imagePos = {
                x: parseInt(mapImage.css("left").replace('px', '')),
                y: parseInt(mapImage.css("top").replace('px', ''))
            }
            zoom = clamp(zoom + offset / 200 * -1, 1, maxZoom);
            mapImage.css("width", `${imageSize.x * zoom}px`);
            mapImage.css("height", `${imageSize.y * zoom}px`);
            overlay.css("width", zoom * 100 + "%");
            overlay.css("height", zoom * 100 + "%");
            let posx = clamp(imagePos.x, -1 * (map.width() * (zoom) - map.width()), 0);
            let posy = clamp(imagePos.y, -1 * (map.height() * (zoom) - map.height()),0);
            mapImage.css("left", `${posx}px`);
            mapImage.css("top", `${posy}px`);
            moveOverlay(posx, posy);
            let markersSize = 2/3*((maxZoom - zoom)/maxZoom) + 0.5;
            markers.forEach(marker => {
                marker.object.css("width", (marker.size.x * markersSize) + "px");
                marker.object.css("height", (marker.size.y * markersSize) + "px");
            });

            lastPinchPos = touch;
        }
    }
});

//if touch event ended or left mouse buttons state changed to "up", stop events

$(document).on("mouseup", function () {  
    holding = false;
});

$(document).on("touchend", () => {
    holding = false;
    pinching = false;
    lastPinchPos = null;
});


  function moveOverlay(x, y){
    $(".overlay").css("top", y.toString() + "px");
    $(".overlay").css("left", x.toString() + "px");
  }

  //converts position from GTA V to positions relative to the maps dimensions
  function gamePosToMap(vector){
    let pos = {
        x: (vector.x + 4000) / 8500,
        y: (vector.y - 8000) / -12000
    }
    return pos;
  }

  //adds Marker on position based on given id
  function addMarkerForCollectible(id){
      if(id == "all"){
        collectibles.forEach(collectible => {
            let pos = gamePosToMap(collectible);
            new Marker(pos.x, pos.y, collectibles.indexOf(collectible));
        });
      }
      else{
        if(collectibles[id] && !isNaN(parseInt(id))){
            let pos = gamePosToMap(collectibles[id]);
            new Marker(pos.x, pos.y, id);
          }
          else{
              $(".text").val("Error!");
              error = true;
          }
      }
  }

  //class that represents a Marker object. 
  class Marker{
      constructor(posx, posy, id){
        this.posx = posx;
        this.posy = posy;
        this.object = $(`<div class="marker" title="Collectible #${id}"></div>`);
        this.object.css("top", posy * 100 + "%");
        this.object.css("left", posx * 100 + "%");
        overlay.append(this.object);
        markers.push(this);
        let t = this;
        this.object.on("click", function(){
            t.delete();
        });
        this.size = {
            x: parseInt(this.object.css("width").replace("px", "")),
            y: parseInt(this.object.css("height").replace("px", ""))
        }
        let markersSize = 2/3*((maxZoom - zoom)/maxZoom) + 0.5;
        
        this.object.css("width", (this.size.x * markersSize) + "px");
        this.object.css("height", (this.size.y * markersSize) + "px");
      }
      delete(){
        markers[markers.indexOf(this.object)] = null;
        this.object.remove();
        delete this;
    }
  }

  //click events handling html controls
  $(".text").on("click", function(){if(error){$(this).val(""); error = false}});
  $(".add").on("click", function(){addMarkerForCollectible($(".text").val())});
  $(".clear").on("click", function(){markers.forEach(marker => {if(marker != null)marker.delete()}); markers = []});

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  };