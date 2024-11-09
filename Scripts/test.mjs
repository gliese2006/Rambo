//import { getGameInfo, getUsername, waitSeeker, displayTime, transformTime } from './Scripts_modules/play_customized.js';
console.log('hello from test');
function dom (c) {
    return document.querySelector(c);
};

let coordinates, players, map, seekerMarkersLayer, runawayMarkersLayer, insideArea = true, outsideTimeout, timeInterval, waitInterval, checkCentered;

map = L.map('map').setView(center, 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);