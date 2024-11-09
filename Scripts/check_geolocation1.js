const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
const code = window.location.pathname.split('/check_geolocation/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const sse = new EventSource(`/display_coordinates/${code}`);
let map, popup, playingArea, startingArea, distance, center, layergroup;
let tryagainbutton;

//check if ready
window.addEventListener('load', () => {
    if (localStorage.getItem("ready")) {
        document.getElementById('buttons').remove();
    };
});


//SSE-------------------------------------------------------------------------
//get coordinates
sse.onmessage = function (response) {
    const gamejson = JSON.parse(response.data);
    if (gamejson) {
        if (!playingArea) {
            //display map
            map = L.map('map').setView(gamejson.area.coordinates, 15);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            popup = L.popup().setLatLng(gamejson.area.coordinates).setContent('Click on marker to see who it is.').openOn(map);
            playingArea = createcircle(gamejson.area.coordinates, gamejson.area.radius, 'red', '#f03', 0.3);
            startingArea = createcircle(gamejson.area.coordinates, 25, 'blue', 'blue', 0.3);

            //when refreshing page, delete all markers
            if (layergroup) {
                layergroup.clearLayers();
            };
            layergroup = L.layerGroup().addTo(map);

            checkDistance(getDistance(gamejson, id));
            //display players
            displaymarkers(gamejson, id);
        } else {
            if (layergroup) {
                layergroup.clearLayers();
            };
            layergroup = L.layerGroup().addTo(map);

            displaymarkers(gamejson, id);
        };
    } else {
        window.location.replace(`http://localhost:8000/play/${code}${window.location.search}`);
        localStorage.clear();
    }
};


//geolocation-------------------------------------------------------------------------------
function geolocation () {
    if (id) {
        alert('To play this game, this website needs to locate you. Please permit geolocation.');
    };
    navigator.geolocation.getCurrentPosition(scb, ecb);
    
    function scb (position) {
        const coordinates = [position.coords.latitude, position.coords.longitude]
        xhr.open('POST', `/send_coordinates/${code}${window.location.search}`, false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({coordinates});
        xhr.send(data);
        console.log(position.coords.accuracy);
    };
    
    function ecb (error) {
        console.log(error);
        alert(`${error.message}! Without geolocation it is not possible to play the game. Please try again or exit the game.`);
    };
};

geolocation();

dom('.button-try-again').addEventListener('click', () => {
    geolocation();
});


//exit game
dom('.button-exit').addEventListener('click', () => {
    if (confirm('Are you sure you want to exit this game?')) {
        xhr.open('GET', `/exit/${code}${window.location.search}`, false);
        xhr.send();
        window.location.replace('http://localhost:8000/');
    };
});


//functions--------------------------------------------------------------
//display player position
function displaymarkers (gamejson, id) {
    gamejson.players.forEach((player) => {
        if (player.id == id) {
            layergroup.addLayer(createmarker('You', player.geolocation));
        } else {
            layergroup.addLayer(createmarker(player.username, player.geolocation));
        }
    });
};

function createmarker (username, coordinates) {
    const marker = L.marker(coordinates).addTo(map);
    marker.bindPopup(username).openPopup();
    //return marker;
    return marker;
};

function createcircle (coordinates, radius, color, fillcolor, opacity) {
    const circle = L.circle(coordinates, {color: color, fillColor: fillcolor, fillOpacity: opacity, radius: radius}).addTo(map);
    return circle;
};

//check player position
function getDistance (gamejson, id) {
    gamejson.players.forEach((player) => {
        if (player.id == id) {
            distance = map.distance(gamejson.area.coordinates, player.geolocation);
        }
    });
    return distance;
};

function checkDistance (distance) {
    if (distance <= 25) {
        dom('.display-message').innerHTML = 'Position on map ok! Please stay here until game starts. Waiting for other players...';
        dom('.display-ready-button').innerHTML = '<button class="button-ready">Ready</button>'
        //ready---------------------------------------------------------------
        dom('.button-ready').addEventListener('click', () => {
            xhr.open('GET', `/ready/${code}?id=${id}`, false);
            xhr.send();
            document.getElementById('buttons').remove();
            localStorage.setItem("ready", 1);
        });
    } else {
        dom('.display-message').innerHTML = 'It seems like you are not inside the starting area. Please move inside the blue circle displayed on the map. As soon as you are there click "Try again". If geolocation is not working or if there is another issue, please exit the game.';
    };
};