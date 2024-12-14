const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/check_geolocation/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const stat = search.get('status');
const task = search.get('task');
function runnerIcon (color) {
    return `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width="64px" height="61px" viewBox="0 0 1280.000000 1226.000000"
    preserveAspectRatio="xMidYMid meet">
    <g transform="translate(0.000000,1226.000000) scale(0.100000,-0.100000)"
    fill="${color}" stroke="none">
    <path d="M9505 12249 c-217 -31 -426 -134 -588 -288 -132 -126 -218 -259 -276
    -424 -118 -339 -59 -717 160 -1006 279 -371 772 -519 1211 -366 399 140 681
    502 716 921 27 327 -83 631 -313 859 -239 238 -580 352 -910 304z"/>
    <path d="M5795 10390 c-235 -6 -266 -14 -381 -89 -72 -46 -14 19 -1062 -1188
    -473 -545 -881 -1012 -905 -1038 -89 -93 -139 -223 -140 -364 0 -188 86 -350
    244 -455 82 -54 159 -78 269 -83 138 -7 245 24 356 105 22 16 429 478 903
    1026 l862 996 486 0 485 0 -54 -62 c-30 -35 -848 -983 -1817 -2108 -970 -1125
    -1779 -2061 -1797 -2080 l-34 -35 -1323 0 c-1222 0 -1326 -1 -1377 -17 -262
    -82 -447 -282 -496 -535 -29 -155 -10 -291 63 -443 38 -80 59 -109 132 -181
    73 -73 101 -93 181 -132 52 -25 120 -51 150 -59 77 -18 3219 -18 3352 0 181
    26 336 80 462 162 57 38 156 143 625 665 306 341 637 710 737 821 l180 201
    680 -660 c373 -362 748 -727 832 -809 l154 -150 -61 -271 c-33 -150 -98 -441
    -145 -647 -515 -2281 -486 -2147 -486 -2262 0 -155 33 -265 116 -390 122 -184
    353 -308 573 -308 74 0 190 22 259 49 182 72 346 248 405 436 9 28 61 250 116
    495 55 245 154 687 220 983 312 1389 364 1621 426 1897 36 162 80 351 97 420
    29 112 32 140 32 275 1 175 -17 256 -87 390 -40 77 -74 112 -799 840 l-758
    761 794 919 c437 506 799 921 804 923 5 1 239 -232 521 -518 542 -549 593
    -594 722 -640 89 -31 233 -38 319 -16 94 24 174 64 265 134 48 37 424 408 945
    934 797 805 868 878 898 941 155 318 2 678 -338 793 -40 14 -84 19 -160 19
    -119 0 -200 -22 -287 -78 -28 -18 -364 -343 -753 -730 l-703 -699 -856 855
    c-471 470 -876 868 -901 884 -69 46 -141 80 -222 105 l-73 22 -1220 1 c-671 1
    -1314 -1 -1430 -5z"/>
    </g>
    </svg>`
};

function glassIcon (color) {
    return `
    <svg width="64px" height="64px" viewBox="0 0 8.4666669 8.4666669" id="svg8" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:svg="http://www.w3.org/2000/svg">
    <defs id="defs2"/>
    <g id="layer1" transform="translate(0,-288.53332)">
    <path d="M 11.996094 1.0039062 C 5.9328116 1.0039062 0.99610131 5.9386839 0.99609375 12.001953 C 0.99610131 18.06526 5.9328116 23.001953 11.996094 23.001953 C 14.670102 23.001953 17.122499 22.040573 19.03125 20.447266 L 29.291016 30.708984 C 30.235897 31.653866 31.653866 30.235898 30.708984 29.291016 L 20.447266 19.029297 C 22.03584 17.121901 22.994137 14.671545 22.994141 12.001953 C 22.994133 5.9386839 18.059376 1.0039062 11.996094 1.0039062 z M 11.996094 3.0039062 C 16.978497 3.003944 20.994135 7.0195531 20.994141 12.001953 C 20.994135 16.984391 16.978497 21.001953 11.996094 21.001953 C 7.0136911 21.001953 2.9960999 16.984391 2.9960938 12.001953 C 2.9960999 7.0195531 7.0136911 3.003944 11.996094 3.0039062 z " id="path935" style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill:${color};fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.99999988;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:stroke fill markers;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate" transform="matrix(0.26458333,0,0,0.26458333,0,288.53332)"/>
    </g>
    </svg>
    `;
};

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
        document.body.innerHTML = '<div class="div-cancel-message"><p> Host canceled game! </p></div>'
        sse.close();
        dom('body').style.height = `${screen.height}px`;
        dom('body').style.marginTop = '0px';
        dom('body').style.display = 'flex';
        dom('body').style.justifyContent = 'center';
        dom('body').style.alignItems = 'center';
        dom('.div-cancel-message').style.fontSize = '25px';
        dom('.div-cancel-message').style.textAlign = 'center';
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
                    if (player.task === 'runaway') {
                        const runner =  L.divIcon({html: runnerIcon(player.color), iconSize: [100], className: 'runner-icon', iconAnchor: [32, 30.5]});
                        
                        const marker = L.marker(player.coordinates, {icon: runner});
                        if (id === player.id) {
                            marker.bindPopup('You');
                        } else {
                            marker.bindPopup(player.username);
                        };
                        marker.addTo(playerMarkersLayer);
                    } else {
                        const glass =  L.divIcon({html: glassIcon(player.color), className: 'glass-icon', iconAnchor: [22.6, 22.6]});

                        const marker = L.marker(player.coordinates, {icon: glass});
                        if (id === player.id) {
                            marker.bindPopup('You');
                        } else {
                            marker.bindPopup(player.username);
                        };
                        marker.addTo(playerMarkersLayer);
                    }
                };
            });
         

            //check ready
            if (!stat) {
            if (map.distance(center, coordinates) <= 20) {
                dom('.display-message').innerHTML = '';
                dom('.div-3').innerHTML = '<button class="button-1"> Ready </button>';
                dom('.button-1').addEventListener('click', () => {
                    window.location.replace(`${window.location}&status=ready`);
                });
                checkZone = 'inside';
                dom('.display-message').innerHTML = 'Geolocation successful! Please check whether your real position matches the one on the map.';
            } else {
                dom('.display-message').innerHTML = 'Geolocation successful! To start the game, please move inside the blue zone on the map. If you already are inside the blue zone and therefore geolocation does not work, please exit.';
                dom('.display-message').style.padding = '5px';
                dom('.div-3').innerHTML = '';
                checkZone = 'outside';
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