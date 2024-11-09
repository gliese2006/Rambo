const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
code = window.location.pathname.split('/set_area/')[1];
console.log(code);
//const code = window.location.pathname.split('/set_time/')[1];
let coordinates, map, currentPosition, centerMarker, perimeter;

//checkdirections
function ns (lat) {
    let direction;
    if (lat >= 0) {
        direction = '° N';
    } else {
        direction = '° S';
    }
    return direction;
};

function ew (lng) {
    let direction;
    if (lng >= 0) {
        direction = '° E';
    } else {
        direction = '° W';
    }
    return direction;
};

//geolocation
alert('To play this game, this website needs to locate you. Please permit geolocation.');

navigator.geolocation.getCurrentPosition(scb, ecb);

function scb (position) {
    currentPosition = [position.coords.latitude, position.coords.longitude];


//map and location

    map = L.map('map').setView(currentPosition, 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let currentPositionMarker = L.marker(currentPosition).addTo(map);

    centerMarker = L.marker(currentPosition).addTo(map);

    coordinates = currentPosition;


//set own center
    map.on('click', (click) => {
        map.removeLayer(centerMarker);
        centerMarker = L.marker([click.latlng.lat, click.latlng.lng]).addTo(map);
        coordinates = [click.latlng.lat, click.latlng.lng];

//move perimeter with marker
        if (dom('.input-radius').value) {
            map.removeLayer(perimeter);
        
            perimeter = L.circle(coordinates, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.25,
                radius: dom('.input-radius').value
            }).addTo(map);
        };
    });

//define radius and send request
    dom('.input-radius').addEventListener('input', () => {
        if (perimeter) {
            map.removeLayer(perimeter);
        };
        perimeter = L.circle(coordinates, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.25,
            radius: dom('.input-radius').value
        }).addTo(map);
    });
        
//onclick submit
    dom('.button-submit').addEventListener('click', () => {
        if (dom('.input-radius').value) {
            const radius = dom('.input-radius').value;
            const data = JSON.stringify({coordinates, radius});
            
            if (confirm(`Please confirm by clicking ok your center ${coordinates[0].toFixed(2) + ns(coordinates[0])}, ${coordinates[1].toFixed(2) + ew(coordinates[1])} and your radius ${radius}m.`)) {
                dom('.input-radius').value = '';
                xhr.open('POST', `/send_playing_area/${window.location.pathname.split('/set_area/')[1]}`, false);
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.send(data);
                window.location.replace(JSON.parse(xhr.response));
            };
        } else {
            dom('.display-error').innerHTML = 'Please set a radius.';
        };
    });
};

function ecb (error) {
    console.log(error);
};

//onclick cancel
dom('.button-cancel').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this game?')) {
        xhr.open ('GET', `/cancel/${code}?place=wait`, false);
        xhr.send();
        document.body.innerHTML = '<p> Host canceled game! </p>';
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
            console.log(window.location);
        }, 2000);
    };
});