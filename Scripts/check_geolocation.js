const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/check_geolocation/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const stat = search.get('status');
const task = search.get('task');

const sse = new EventSource(`/get_geolocations/${code}?id=${id}&task=${task}&place=check_geolocation`);

let playerMarkersLayer, coordinates, center, map, checkZone, checkCentered;


//check status
if (stat) {
    document.getElementById('menu').remove();
    document.getElementById('dropdown-menu').remove();
    document.getElementById('display-ready-button').remove();
    document.getElementById('display-message').remove();
};

//send geolocation
if (!stat) {
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
        if (!stat) {
        dom('.display-message').style.padding = '5px';
        dom('.display-message').innerHTML = 'Geolocation successful! Please check whether your real position matches the one on the map.'
        };

        if (checkCentered) {
            map.setView(coordinates, 19, {animate: true});
        };
    };

    function ecb (error) {
        if (!stat) {
        dom('.display-message').innerHTML = `${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.`;
        dom('.display-message').style.padding = '5px';
        };
    };
}, 1000);

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
            if (!stat) {
            if (map.distance(center, coordinates) <= 20) {
                if (checkZone !== 2) {
                    dom('.display-message').innerHTML = '';
                    dom('.div-3').innerHTML = '<button class="button-1"> Ready </button>';
                    dom('.button-1').addEventListener('click', () => {
                        window.location.replace(`${window.location}&status=ready`);
                    });
                    checkZone = 2;
                };
            } else {
                if (checkZone !== 1) {
                    dom('.display-message').innerHTML = 'Geolocation successful! To start the game, please move inside the blue zone on the map. If you already are inside the blue zone and therefore geolocation does not work, please exit.';
                    dom('.display-message').style.padding = '5px';
                    dom('.div-3').innerHTML = '';
                    checkZone = 1;
                };
            };
            };
        };
    };
};

//ready button

//exit button
if (!stat) {
if (id) {
    dom('.buttons').innerHTML = '<div class="link-1 div-1"><p>Exit</p></div>';
    dom('.link-1').addEventListener('click', () => {
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
    dom('.buttons').innerHTML = '<div class="link-1 div-1"><p>Cancel</p></div>';
    dom('.link-1').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel/${code}?place=check_geolocation`, false);
            xhr.send();
        };
    });
};
};

//centerUserPosition button
const findPositionButton = `
        <button class="button-find-position button-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><path d="M440-82v-40q-125-14-214.5-103.5T122-440H82q-17 0-28.5-11.5T42-480q0-17 11.5-28.5T82-520h40q14-125 103.5-214.5T440-838v-40q0-17 11.5-28.5T480-918q17 0 28.5 11.5T520-878v40q125 14 214.5 103.5T838-520h40q17 0 28.5 11.5T918-480q0 17-11.5 28.5T878-440h-40q-14 125-103.5 214.5T520-122v40q0 17-11.5 28.5T480-42q-17 0-28.5-11.5T440-82Zm40-118q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Zm0-80Z"/></svg>
        </button>`;

dom('.div-find-position').innerHTML = findPositionButton;

dom('#map').addEventListener('pointerdown', () => {
    if (checkCentered && (map.getCenter() !== coordinates || map.getZoom() !== 19)) {
        checkCentered = false;
        dom('.div-find-position').innerHTML = findPositionButton;
    };
});

dom('.div-find-position').addEventListener('click', () => {
    if (!checkCentered) {
        map.setView(coordinates, 19, {animate: true});
        checkCentered = true;
        dom('.div-find-position').innerHTML = '';
    };
});

//general look
if (!stat) {
    function hideDropdown () {
        dom('.dropdown-menu').style.display = 'none';
    };
    hideDropdown();
    
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
};