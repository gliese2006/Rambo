const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
code = window.location.pathname.split('/set_area/')[1];
//console.log(code);
//const code = window.location.pathname.split('/set_time/')[1];
let coordinates, map, currentPosition, centerMarker, perimeter;
hideDropdown();

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

function submit () {
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
};

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
        submit();
    });
};

function ecb (error) {
    console.log(error);
    dom('.display-error').innerHTML = error.message + '! Without geolocation it is not possible to play the game. Please permit geolocation or cancel the game.';
};

//onclick cancel
dom('.link-1').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this game?')) {
        xhr.open ('GET', `/cancel/${code}?place=wait`, false);
        xhr.send();
        dom('body').style.height = `${screen.height}px`;
        dom('body').style.marginTop = '0px';
        dom('body').style.display = 'flex';
        dom('body').style.justifyContent = 'center';
        dom('body').style.alignItems = 'center';
        setTimeout(() => {
            window.location.replace('/');
            //console.log(window.location);
        }, 2000);
        document.body.innerHTML = '<div class="div-cancel-message"> Host canceled game! </div>';
    };
});


//general look
function hideDropdown () {
    dom('.dropdown-menu').style.display = 'none';
};

//show dropdown menu
dom('.menu').addEventListener('click', () => {
    dom('.dropdown-menu').style.display = 'grid';
});

//close dropdown menu
dom('.svg-close').addEventListener('click', () => {
    hideDropdown();
});
dom('.content').addEventListener('click', () => {
    hideDropdown();
});

dom('body').addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    } else if (event.key === 'e') {
        event.preventDefault();
    } else if (event.key === 'Enter') {
        submit();
    };
});