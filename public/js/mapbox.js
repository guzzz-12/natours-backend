const mapContainer = document.querySelector("#map");
const locations = JSON.parse(mapContainer.dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiamVncSIsImEiOiJjazBlYjlib2QwZ2E3M2xxZXFuemdieHRkIn0._w3SjVHpaShA4X8KP4ol9w';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jegq/ck0ebd6do1jl01co0wzgnbwrm'
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(location => {
  //Crear los marcadores del mapa
  const el = document.createElement("div");
  el.className = "marker";

  //Agregar los marcadores al mapa
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom"
  })
  .setLngLat(location.coordinates)
  .addTo(map);

  //Agregar popup con la ubicación a los markers
  new mapboxgl.Popup({
    offset: 30
  })
  .setLngLat(location.coordinates)
  .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
  .addTo(map);

  //Extender el área del mapa a las coordenadas especificadas
  bounds.extend(location.coordinates)
});

//Hacer zoom al área especificada del mapa
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});