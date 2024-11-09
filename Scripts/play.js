function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/play/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const task = search.get('task');
let coordinates, players, map, markerslayer, insideArea = true, outsideTimeout, timeInterval, waitInterval, checkCentered;

const xhr = new XMLHttpRequest();
const sse = new EventSource(`/get_geolocations/${code}?id=${id}&task=${task}`);
const gamejson = getGameInfo(xhr);
const username = getUsername(gamejson, id);
waitSeeker(gamejson, task, dom('.display-waiting-time'), waitInterval);
map = createMap(gamejson, map);

let seekerMarkersLayer = L.layerGroup().addTo(map), runawayMarkersLayer = L.layerGroup().addTo(map);

//time
displayTime(gamejson.time/1000, dom('.display-time'), timeInterval);

//map
setInterval(() => {
    navigator.geolocation.getCurrentPosition(scb, ecb);
    function scb (position) {
        coordinates = [position.coords.latitude, position.coords.longitude];

        xhr.open('POST', `/send_coordinates/${code}?id=${id}`, false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({coordinates});
        xhr.send(data);

        checkCentered = centerUserPosition(map, coordinates, dom('.button-find-position'), checkCentered);
        if (checkCentered) {
            map.setView(coordinates, 16, {animate: true});
        };
    };

    function ecb (error) {
        //Alert only once (every x seconds)
        alert(`<p>${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.</p>`);
        dom('.display-message').innerHTML = `<p>${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.</p>`;
    };
}, 2000);

//sse
sse.onmessage = function (response) {    
    players = JSON.parse(response.data);

    if (players === 'canceled') {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    } else if (players.exit) {
        if (players.exit === username) {
            window.location.replace('http://localhost:8000/');
        } else {
            alert(`${players.exit} exited the game.`);
        };
        gamejson.players = players;
    } else if (players.confirm) {
        if (id === 0) {
            confirmExit(code, players.confirm[0], players.confirm[1], xhr);
        } else if (id) {
            confirmCancel(code, id, xhr);
        }
    } else if (players.newHost) {
        if (players.newHost === username) {
            alert('You are the new host of this game. ');
            window.location.replace(`http://localhost:8000/play/${code}?id=0&task=${task}`);
        } else {
            alert(`${players.exit} is the new host of this game.`);
        };
    } else if (players.gameover) {
        document.body.innerHTML = `<p> ${players.gameover} If you want to play another game, just "create" and "join" a "new game".</p>`
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 5000);
    } else if (players.timeUpdate) {
        const updatedTime = players.timeUpdate/1000;
        clearInterval(timeInterval);
        displayTime(updatedTime, dom('.display-time'), timeInterval);
    } else {
        checkDistance(coordinates, players, map, gamejson, task, id, xhr, insideArea, outsideTimeout);
        markerslayer = displayPlayers(players, map, seekerMarkersLayer, runawayMarkersLayer);
        runawayMarkersLayer = markerslayer.runawayMarkersLayer;
        seekerMarkersLayer = markerslayer.seekerMarkersLayer;
    };
};

//exit button
if (id) {
    alert(`You have ${gamejson.time / 12} minutes to run away before the seekers start hunting you.`)
    dom('.display-exit-cancel-button').innerHTML = '<button class="button-exit"> Exit </button>';
    dom('.button-exit').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            xhr.open('GET', `/exit/${code}?id=${id}&username=${username}&place=play`, true);
            xhr.send();
        };
    });
};

//cancel button
if (id === 0) {
    dom('.display-exit-cancel-button').innerHTML = '<button class="button-cancel"> Cancel </button> <button class="button-change-host"> Exit </button>';
    dom('.button-cancel').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel/${code}?place=play`, false);
            xhr.send();
        };
    });
    dom('.button-change-host').addEventListener('click', () => {
        dom('.display-select-host').innerHTML = selectNewHost;
        dom('#dialog-select-host').showModal();
        dom('.button-cancel-game').addEventListener('click', () => {
            xhr.open('GET', `/cancel/${code}`);
            xhr.send();
        });
        dom('.button-confirm-host').addEventListener('click', () => {
            if (dom('#new-host').value) {
                xhr.open('POST', `/change_host/${code}?place=play`, false);
                xhr.setRequestHeader('Content-type', 'application/json');
                const data = JSON.stringify(dom('#new-host').value);
                xhr.send(data);
            } else {
                dom('.display-message').innerHTML = 'Please select a new host.'
            }
        });
        dom('.button-cancel-host').addEventListener('click', () => {
            dom('#dialog-select-host').close();
        });
    });
};




//import { getGameInfo, getUsername, waitSeeker, displayTime, transformTime } from './Scripts_modules/play_customized.js';
function getGameInfo (xhr) {
    xhr.open('GET', `/display_map/${code}`, false);
    xhr.send();
    if (xhr.status === 500) {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    };
    return JSON.parse(xhr.response);
};

function getUsername (gamejson, id) {
    const user =  gamejson.players.find((player) => player.id === id);
    return user ? user.username : null;
};

function waitSeeker (gamejson, task, dom, timeInterval) {
    if (task === 'seeker') {
        document.getElementById('dialog-wait-seeker').showModal();
        const time = gamejson.time / 12;
        //console.log(Math.round(time/3600) - 0.5);

        displayTime(time / 1000, dom, timeInterval);

        setTimeout(() => {
            document.getElementById('dialog-wait-seeker').close();
            //console.log(timeInterval);
            clearInterval(timeInterval);
        }, time);
    };
};

function displayTime (time, dom, timeInterval) {
    //console.log(time);
    dom.innerHTML = transformTime(time);
    timeInterval = setInterval(() => {
        time --;
        dom.innerHTML = transformTime(time);
    }, 1000);
};

function transformTime (time) {
    const h = Math.round(time/3600 - 0.5);
    const min = Math.round((time%3600)/60 - 0.5);
    const sec = Math.round((time%3600)%60 - 0.5);
    return `${h}h ${min}min ${sec}sec`;
};

console.log(transformTime(1800))
console.log(transformTime(1799))
console.log(transformTime(1801))
console.log(transformTime(0))

//import { selectNewHost, confirmExit, confirmCancel } from './Scripts_modules/play_host.js';
function selectNewHost (gamejson) {
    let playershtml = '<label>Select the new host:</label> <select id="new-host"> <option> </option>';
    gamejson.players.forEach((player) => {
        playershtml += `<option value="${player.username}">${player.username}</option>`;
    });
    return playershtml +'</select>';
};

function confirmExit (code, username, exitid, xhr) {
    if (confirm(`${username} wants to exit the game. Please confirm!`)) {
        xhr.open('GET', `/confirm/exit/${code}?id=${exitid}answer=confirmed`);
        xhr.send();
    } else {
        xhr.open('GET', `/confirm/exit/${code}?${exitid}answer=denied`);
        xhr.send();
    }
};

function confirmCancel (code, id, xhr) {
    if (confirm('The host wants to cancel this game. Please confirm or cancel, if you disagree.')) {
        xhr.open('GET', `/confirm/cancel/${code}?id=${id}&answer=confirmed`);
        xhr.send();
    } else {
        xhr.open('GET', `/confirm/cancel/${code}?id=${id}&answer=denied`);
        xhr.send();
    }
};


//import { createMap, displayPlayers, checkDistance, centerUserPosition } from './Scripts_modules/play_map.js';
function createMap (gamejson, map) {
    map = L.map('map').setView(gamejson.area.coordinates, 12)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
};

function displayPlayers (players, map, runawayMarkersLayer, seekerMarkersLayer) {
    players.forEach((player) => {
        if (player.task === 'seeker') {
            seekerMarkersLayer.clearLayers();
            const marker = L.marker(player.coordinates);
            if (id === player.id) {
                marker.bindPopup('You');
            } else {
                marker.bindPopup(player.username);
            };
            marker.addTo(seekerMarkersLayer);
        } else if (player.task === 'runaway') {
            runawayMarkersLayer.clearLayers();
            const marker = L.marker(player.coordinates);
            if (id === player.id) {
                marker.bindPopup('You');
            } else {
                marker.bindPopup(player.username);
            };
            marker.addTo(runawayMarkersLayer);
        };
    });
    return {runawayMarkersLayer, seekerMarkersLayer};
};

function checkDistance (coordinates, players, map, gamejson, task, id, xhr, insideArea, outsideTimeout) {
    if (task === 'runaway') {
        players.forEach((player) => {
            if (player.task === 'seeker' && map.distance(player.coordinates, coordinates) < 5) {
                xhr.open('GET', `/play/lost_game/${gamejson.code}?id=${id}`);
                xhr.send();
                //message
            };
        });
    };
    if (insideArea) {
        if (map.distance(gamejson.area.coordinates, coordinates) > gamejson.area.radius) {
            alert('You are outside of the playing area, you have 1 minute to return, otherwhise you will be disqualified.')
            insideArea = false;
            outsideTimeout = setTimeout(() => {
                alert('1 minute is over - you are disqualified! You can join a seeker or wait for the game to finish.')
                window.document.replace('http://localhost:8000');
                xhr.open(`/play/lost_game/${gamejson.code}?id=${id}`);
                xhr.send();
            }, 60000);
        };
    } else {
        if (map.distance(gamejson.area.coordinates, coordinates) < gamejson.area.radius) {
            alert('Well done! You are back inside the playing area.');
            clearTimeout(outsideTimeout);
        };
    }
};

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

//error, error, timeupdate, sse locations, Durcheinander, github