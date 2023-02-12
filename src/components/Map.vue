<template>
  <div id='map' :class='{ invisible: !props.active }'></div>
</template>

<script setup>

// Vue imports.
import { watch, ref, onMounted } from 'vue'

// Import API.
import Api from '../Api'

// Define props.
const props = defineProps(['active', 'targetId', 'targetLabel', 'buddies'])

// Map variables to be accessible from the entire component.
let map
let layerGroup

// Flags to determine if targetLabel and buddies have been caluclated yet
let targetLabelChanged = ref(false)
let buddiesChanged = ref(false)

// Initializes the map when the component is mounted.
onMounted(async () => {
    map = L.map('map').setView([0, 0], getZoom() )
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map)
})

// Determines how far the map should be zoomed in.
// The map should be zoomed out further on mobile than on desktop.
function getZoom() {
    return (window.innerWidth > 900) ? 2 : 1
}

// Add markers on the map at the locations of the target and buddy cities.
async function addMarkers() {
    // Add target marker.
    let targetLatlong = await idToLatlong(props.targetId)
    addMarker(targetLatlong, props.targetLabel, true)

    // Add buddy markers.
    for (let i = 0; i < props.buddies.length; i++) {
        let buddy = props.buddies[i]
        let buddyLatlong = await idToLatlong(buddy.id)
        addMarker(buddyLatlong, buddy.label, false)
    }
}

// Add a single marker to the map with the given coordinate and label.
// If the marker represents the target city, the marker is orange. 
// Otherwise, the marker is green.
function addMarker(latlong, label, isTarget) {
    let icon = L.icon({
        iconUrl: isTarget ? '/map-marker-orange.png' : '/map-marker-green.png' ,
        shadowUrl: '/marker-shadow.png',

        iconSize:     [25, 40], // size of the icon
        shadowSize:   [40, 50], // size of the shadow
        iconAnchor:   [12.5, 40], // point of the icon which will correspond to marker's location
        shadowAnchor: [12.5, 50],  // the same for the shadow
    });

    let marker = L.marker(latlong, {icon: icon}).addTo(layerGroup);
    if (label) {
        marker.bindTooltip(label, {permanent: true, offset: [15, -20] });
    }
}

// Get the latitude and longitude of a city given its ID.
async function idToLatlong(targetId) {
    let latlong = (await Api().get(`id/${targetId}/latlong`)).data
    return L.latLng(latlong.lat, latlong.long)
}

// Whenever the targetLabel is changed, check if the buddies have also been changed.
// If so, add the markers.
watch(() => props.targetLabel, async (newLabel) => {
    targetLabelChanged.value = true
    if (buddiesChanged.value) {
        await addMarkers()
    }
})

// Whenever the buddies are changed, check if the targetLabel has also been changed.
// If so, add the markers.
watch(() => props.buddies, async (newBuddies) => {
    buddiesChanged.value = true
    if (targetLabelChanged.value) {
        await addMarkers()
    }
})

</script>

<style>

#map { 
    display: block;
    height: 500px; 
    max-height: 500px; 
    margin-top: 40px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden
}

</style>