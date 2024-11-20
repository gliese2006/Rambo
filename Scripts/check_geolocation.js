const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/check_geolocation/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const stat = search.get('status');
const task = search.get('task');

const sse = new EventSource(`/get_geolocations/${code}?id=${id}&task=${task}`);

let playerMarkersLayer, coordinates, center, map, checkZone, checkCentered;


//check status
if (stat) {
    document.getElementById('buttons').remove();
    document.getElementById('messages').remove();
};

//send geolocation
if (document.getElementById('buttons')) {
//if (window.navigator.getCurrentPosition) {
    window.navigator.permissions.query({name: 'geolocation'}).then((PermissionStatus) => {
        if (id !== 0 && !stat && PermissionStatus.state !== "granted") {
            alert('To play this game, this website needs to locate you. Please permit geolocation.');
        };
    });
//}
};

setInterval(() => {
    navigator.geolocation.getCurrentPosition(scb, ecb);
    function scb (position) {
        coordinates = [position.coords.latitude, position.coords.longitude];

        xhr.open('POST', `/send_coordinates/${code}?id=${id}&place=check_geolocation`, false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({coordinates});
        xhr.send(data);
        if (document.getElementById('buttons')) {
        dom('.display-geolocation-message').innerHTML = '<p> Geolocation successful! Please check whether your real position matches the one on the map.</p>'
        };

        checkCentered = centerUserPosition(map, coordinates, dom('.button-find-position'), checkCentered);
        if (checkCentered) {
            map.setView(coordinates, 16, {animate: true});
        };
    };

    function ecb (error) {
        if (document.getElementById('buttons')) {
        dom('.display-message').innerHTML = `<p>${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.</p>`;
        };
    };
}, 5000);

//map
xhr.open('GET', `/display_map/${code}`, false);
xhr.send();
if (xhr.status === 500) {
    document.body.innerHTML = 'Game does no longer exist.'
    setTimeout(() => {
        window.location.replace('/');
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
sse.onmessage = (res) => {
    const response = JSON.parse(res.data);
    if (response === 'canceled') {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        sse.close();
        setTimeout(() => {
            window.location.replace('/');
        }, 2000);
    } else if (response.exit) {
        alert(response.exit.username + response.exit.message);
    } else if (response === 'ready') {
        //console.log('ready');
        window.location.replace(`/play/${code}?id=${id}&task=${task}`);
        sse.close();
    } else {
        //console.log(response);
        if (response.players) {
            const players = response.players;

            if (playerMarkersLayer) {
                //console.log(playerMarkersLayer);
                playerMarkersLayer.clearLayers();
                //console.log(playerMarkersLayer);
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
            window.location.replace('/');
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

//centerUserPosition button
function centerUserPosition (map, coordinates, dom, checkCentered) {
    document.body.addEventListener('pointerdown', () => {
        if (map.getCenter() !== coordinates || map.getZoom() !== 17) {
            checkCentered = false;
        }
    });
    dom.addEventListener('click', () => {
        map.setView(coordinates, 16, {animate: true});
        checkCentered = true;
    });
    return checkCentered;
};