var IP = "40.115.21.196";
//var IP = "192.168.1.41";
//var IP = "localhost";

var map;

function loadMap() {
    var mapOptions = {
      center: new google.maps.LatLng(51.754512, 19.430550),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      tilt: 45,
        rotateControl: true
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);

}

function animateZoom(map, targetZoom) {
    var currentZoom = arguments[2] || map.getZoom();

    if (currentZoom < targetZoom) {
      var e = google.maps.event.addListener(map, 'zoom_changed', function(event){
        google.maps.event.removeListener(e);
        animateZoom(map, targetZoom, currentZoom + (targetZoom > currentZoom ? 1 : -1));
      });
      setTimeout(function(){map.setZoom(currentZoom)}, 80);
    }
}

function animateZoomHelper(map, targetZoom) {
    var currentZoom = map.getZoom();
    if(currentZoom != targetZoom && currentZoom != targetZoom -1 && currentZoom != targetZoom -2) // because map.panTo changes zoom and animate is lagging 
        animateZoom(map, targetZoom);
}


var markerColors = [
    {name: "red", hex: ["e84141", "990000"]}, 
    {name: "blue", hex: ["5dade2", "35586C"]}, 
    {name: "purple", hex: ["9969c7", "633974"]}, 
    {name: "orange", hex: ["ff7f00", "873600"]}, 
    {name: "green", hex: ["46CB18", "145a32"]},
    {name: "yellow", hex: ["fdfd04", "7e5109"]}
  ];

function leadingZero(i) {
    return (i < 10) ? '0' + i : i;
}

function getMonthWithZero(month) {
    return leadingZero((month + 1));
}

function getMonthShortName(month) {
    var monthNames = ["sty", "lut", "marz", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
    return monthNames[month];
}

function prepareDistance(distance, round = true) {
    var value;

    if(distance < 1) {
        
        value = Math.round(distance * 1000);
    }
    else if(distance < 100) {
        if(round)
            value = parseFloat(new Number(distance).toFixed(1)); // parseFloat removes additional zeros; e.g. 10 -> 10.0 -> 10; 21.232 -> 21.2 -> 21.2
        else
            value = parseFloat(new Number(distance).toFixed(3)); 
    }
    else {
        if(round)
            value = Math.round(distance);
        else
            value = parseFloat(new Number(distance).toFixed(3));     
    }

    return {
        value: value,
        unit: getDistanceUnit(distance)
    }

    function getDistanceUnit(distance) {
        return distance >= 1 ? "km" : "m";
    }
}

function formatSpeed(speed) {
    speed = parseFloat(speed);
    return Math.round(speed * 3600 / 1000);
}