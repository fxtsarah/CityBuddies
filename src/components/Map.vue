<template>
  <div :class="{ invisible: !props.active }" id="map"></div>
</template>

<script setup>
import { watch, onMounted } from 'vue'
import {use_submit_query} from '../composables/use_submit_query.js'

const props = defineProps(['active', 'target_id', 'buddy_id', 'target_label', 'buddy_label'])

let { submit_query } = use_submit_query()

var map
var layerGroup

onMounted(async () => {
  map = L.map('map').setView([0, 0], get_zoom() )
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  layerGroup = L.layerGroup().addTo(map)
})

// When the user makes a new search, call this function to re-center the map and get rid of the old buddy markers.
async function reset_map() {
  layerGroup.clearLayers()
  map.setView([0, 0], get_zoom() )
}

function get_zoom() {
  if (window.innerWidth > 900) {return 2}
  return 1
}

// add markers on the map at the locations of the target and buddy cities
async function add_markers() {
  
  var icon = L.icon({
    iconUrl: 'map-marker.png',
    shadowUrl: 'marker-shadow.png',

    iconSize:     [25, 40], // size of the icon
    shadowSize:   [40, 50], // size of the shadow
    iconAnchor:   [12.5, 40], // point of the icon which will correspond to marker's location
    shadowAnchor: [12.5, 50],  // the same for the shadow
});

  let target_latlong = await id_to_latlong(props.target_id)
  let buddy_latlong = await id_to_latlong(props.buddy_id)
  var t_marker = L.marker(target_latlong, {icon: icon}).addTo(layerGroup);
  var b_marker = L.marker(buddy_latlong, {icon: icon}).addTo(layerGroup);
  t_marker.bindTooltip(props.target_label, {permanent: true, offset: [15, -20] });
  b_marker.bindTooltip(props.buddy_label, {permanent: true, offset: [15, -20] });
  
}

// get the latitude and longitude of a city given its ID.
async function id_to_latlong(target_id) {
  var query = `SELECT ?city ?long ?lat
              WHERE
              {
              VALUES ?city { wd:${target_id}} 
              ?city p:P625 ?coordinate.
              ?coordinate psv:P625 ?coordinate_node.
              ?coordinate_node wikibase:geoLongitude ?long.
              ?coordinate_node wikibase:geoLatitude ?lat.  
              }`
  var result = await submit_query(query)
  return L.latLng(result[0]["lat"], result[0]["long"])
}

watch(()=>props.target_label, async (new_label) => {
  await reset_map()
  await add_markers()
})

watch(()=>props.buddy_label, async (new_label) => {
  await reset_map()
  await add_markers()
})

</script>

<style>
#map { 
    display: block;
    height: 500px; 
    max-height: 500px; 
    margin-top: 50px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden
}

</style>