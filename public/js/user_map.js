function initMap() {
  var map = new google.maps.Map(document.getElementById('truckmap'), {
    zoom: 17,
    center: {lat: -34.397, lng: 150.644}
  });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      // var inRadius = [];
      var inBound = []

      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'YOU!',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });

      map.setCenter(pos);
      
      var sessionPosition = {lat: marker.position.lat(), lng: marker.position.lng()};

      var sessionData = {
          location: JSON.stringify(sessionPosition),
        };

      $.ajax({
        method: 'put',
        url: '/sessions/set-location',
        data: sessionData
      })

      .done(function(response){
        console.log(response);
      });

      var userPosition = {lat: marker.position.lat(), lng: marker.position.lng()};

      var userData = {
          location: JSON.stringify(userPosition),
        };

      $.ajax({
        method: 'put',
        url: '/users/set-location',
        data: userData
      })

      .done(function(response){
        console.log(response);
      });


      var trucks = [];

      $.ajax({
        method: 'get',
        url: '/users/get-truck-info',
        dataType: 'json'
      })

      .done(function(response){
        var truckCoordinates = response.map(function(object){
          if (object.location){
            var coordinate = JSON.parse(object.location);
            return coordinate;
          }
        });

        for(var i = 0; i < response.length; i++){
          if(truckCoordinates[i]){
            trucks.push(new google.maps.Marker({
              position: truckCoordinates[i],
              map: map,
              title: response[i].name,
              id: response[i].id,
              label: ' '
            }));
          }
        };

        findInBound(trucks);
        showInBound();
      });



      map.setCenter(pos);

      function findInBound(trucks){
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var labelIndex = 0;

        for(var i = 0; i < trucks.length; i++){
          if (map.getBounds().contains(trucks[i].position)){
            trucks[i].label = labels[labelIndex++ % labels.length];
            inBound.push(trucks[i]);
          };
        };
      }

      function showInBound(){
        for(var i = 0; i < inBound.length; i++){
          inBound[i].setMap(map);
        }
      }

      google.maps.event.addListener(map, 'zoom_changed', function(){
        zoom = map.getZoom();
        if(zoom < 13){
          for(var i = 0; i < trucks.length; i++){
            trucks[i].setMap(null)
          }

        } else{
          inBound = [];

          for(var i = 0; i < trucks.length; i++){
            trucks[i].setMap(null)
          };

          findInBound(trucks);
          showInBound();
        }
      })

      google.maps.event.addListener(map, 'dragend', function(){
        inBound = [];

        for(var i = 0; i < trucks.length; i++){
          trucks[i].setMap(null)
        };

        findInBound(trucks);
        showInBound();
      })
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  };
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
