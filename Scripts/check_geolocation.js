const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/check_geolocation/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const task = search.get('task');

const sse = new EventSource(`/get_geolocations/${code}?id=${id}&task=${task}`);

let playerMarkersLayer, coordinates, center, map, checkZone;


//check status
if (search.get('status')) {
    document.getElementById('buttons').remove();
    document.getElementById('messages').remove();
};

//send geolocation
if (document.getElementById('buttons')) {
if (id !== 0) {
    alert('To play this game, this website needs to locate you. Please permit geolocation.');
};
};

setInterval(() => {
    navigator.geolocation.getCurrentPosition(scb, ecb);
    function scb (position) {
        coordinates = [position.coords.latitude, position.coords.longitude];

        xhr.open('POST', `/send_coordinates/${code}?id=${id}`, false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({coordinates});
        xhr.send(data);
        if (document.getElementById('buttons')) {
        dom('.display-geolocation-message').innerHTML = '<p> Geolocation successful! Please check whether your real position matches the one on the map. </p>'
        };
    };

    function ecb (error) {
        if (document.getElementById('buttons')) {
        dom('.display-message').innerHTML = `<p>${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.</p>`;
        };
    };
}, 2000);

//map
xhr.open('GET', `/display_map/${code}`, false);
xhr.send();
if (xhr.status === 500) {
    document.body.innerHTML = '<p> Host canceled game! </p>'
    setTimeout(() => {
        window.location.replace('http://localhost:8000/');
    }, 2000);
};

const gamejson = JSON.parse(xhr.response)
center = gamejson.area.coordinates;

map = L.map('map').setView(center, 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const playingArea = L.circle(center, {
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.25,
    radius: gamejson.area.radius
}).addTo(map);

const startingArea = L.circle(center, {
    color: 'blue',
    fillColor: 'blue',
    fillOpacity: 0.25,
    radius: 20
}).addTo(map);

//display players
sse.onmessage = (response) => {
    console.log(response);
    if (JSON.parse(response.data) === 'canceled') {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        sse.close();
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    } else if (JSON.parse(response.data).exit) {
        alert(`${JSON.parse(response.data).exit} exited the game.`);
    } else if (JSON.parse(response.data) === 'ready') {
        console.log('ready');
        window.location.replace(`http://localhost:8000/play/${code}?id=${id}&task=${task}`);
        sse.close();
    } else {
        const players = JSON.parse(response.data);

        if (playerMarkersLayer) {
            console.log(playerMarkersLayer);
            playerMarkersLayer.clearLayers();
            console.log(playerMarkersLayer);
        };

        playerMarkersLayer = L.layerGroup().addTo(map);
        players.forEach((player) => {
            if (player.coordinates) {
                const marker = L.marker(player.coordinates);
                if (id === player.id) {
                    marker.bindPopup('You');
                } else {
                    marker.bindPopup(player.username);
                };
                marker.addTo(playerMarkersLayer);
            };
        });

        //check ready
        if (document.getElementById('buttons')) {
        if (map.distance(center, coordinates) <= 20) {
            if (checkZone !== 2) {
                dom('.display-message').innerHTML = '';
                dom('.display-ready-button').innerHTML = '<button class="button-ready"> Ready </button>';
                dom('.button-ready').addEventListener('click', () => {
                    window.location.replace(`${window.location}&status=ready`);
                });
                checkZone = 2;
            };
        } else {
            if (checkZone !== 1) {
                dom('.display-message').innerHTML = 'To start the game, please move inside the blue zone on the map. If you already are inside the blue zone and therefore geolocation does not work, please exit.';
                dom('.display-ready-button').innerHTML = '';
                checkZone = 1;
            };
        };
        };
    };
};

//ready button

//exit button
if (document.getElementById('buttons')) {
if (id) {
    dom('.display-exit-cancel-button').innerHTML = '<button class="button-exit"> Exit </button>';
    dom('.button-exit').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            sse.close();
            xhr.open('GET', `/exit/${code}?id=${id}&place=check_geolocation`, true);
            xhr.send();
            window.location.replace('http://localhost:8000/');
        };
    });
};

//cancel button
if (id === 0) {
    dom('.display-exit-cancel-button').innerHTML = '<button class="button-cancel"> Cancel </button>';
    dom('.button-cancel').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel/${code}?place=check_geolocation`, false);
            xhr.send();
        };
    });
};
};