$(function() {
  var map;
  var marker;
  var interval;
  var isRunning = false;
  var isFollow = false;
  var lastLatLong;
  var URL = $("#URL").val();

  loadMap();
  function loadMap() {
    
  var mapOptions = {
    center: new google.maps.LatLng(50.65, 18),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
     tilt: 45,
      rotateControl: true
  };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);
    
    
  }

  function animateZoom(map, targetZoom) {
      var currentZoom = arguments[2] || map.getZoom();
    
    if (currentZoom != targetZoom) {
      var e = google.maps.event.addListener(map, 'zoom_changed', function(event){
        google.maps.event.removeListener(e);
        animateZoom(map, targetZoom, currentZoom + (targetZoom > currentZoom ? 1 : -1));
      });
      setTimeout(function(){map.setZoom(currentZoom)}, 80);
    }
  }


  function creteMarker(latLong) {
    return new google.maps.Marker({
                  position: latLong
              });
  }

  function setMarker(location) {
    var latLong = new google.maps.LatLng(location.lat, location.lon);
    lastLatLong = latLong;
    
    if(!marker) {
      marker = creteMarker(latLong);
      marker.setMap(map);
    }

    marker.setPosition(latLong);
    
    console.log("asfsafsaf");																	
    if(isFollow){
      //map.setCenter(marker.getPosition());
      map.panTo(latLong);
    }
      
    
    //console.log("aa");
  }

  function startTracking() {
    
    getLastLocation();
    
    interval = setInterval(function() {
      if(isRunning)
        getLastLocation();
    }, 3000);
  }

  function stopTracking() {
    clearInterval(interval);
  }


  function getLastLocation() {
    var url = URL

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        console.log(xhr.response);
        setMarker(xhr.response);
      } else {
        console.log("error");
      }
    };
    
    xhr.send();
  }

  $("#start").click(function () {
    if(isRunning) {
      isRunning = false;
      $("#start").text("Start");
      stopTracking();
    }
    else {
      isRunning = true;
      startTracking();
      $("#start").text("Stop");
    }
    
  });


  $("#follow").click(function () {
    if(isFollow) {
      isFollow = false;
      $("#follow").text("Follow");
    }
    else {
      $("#follow").text("Unfollow");
      isFollow = true;
      if(lastLatLong) {
        map.panTo(lastLatLong);
        animateZoom(map, 15);
      }
        
    }
  });


});
