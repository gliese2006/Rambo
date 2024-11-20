function dom (c) {
    return document.querySelector(c);
};

const code = window.location.pathname.split('/play/')[1];
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const task = search.get('task');
let coordinates, map, insideArea = true, outsideTimeout, timeInterval, waitInterval, checkCentered, timeUpdate, checkSeekersReady;

const xhr = new XMLHttpRequest();
const sse = new EventSource(`/get_geolocations/${code}?id=${id}&task=${task}`);
//const worker = new Worker()
const gamejson = getGameInfo(xhr);
const username = getUsername(gamejson, id);
map = createMap(gamejson, map);

let seekerMarkersLayer = L.layerGroup().addTo(map), runawayMarkersLayer = L.layerGroup().addTo(map);

//time
//timeInterval = displayTime(gamejson.time/1000, dom('.display-time'));

//map
setInterval(() => {
    navigator.geolocation.getCurrentPosition(scb, ecb);
    function scb (position) {
        coordinates = [position.coords.latitude, position.coords.longitude];

        xhr.open('POST', `/send_coordinates/${code}?id=${id}&place=play`, false);
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
        alert(`${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.`);
        dom('.display-message').innerHTML = `<p>${error.message}! Without geolocation it is not possible to play the game. Please reload or exit the game.</p>`;
    };
}, 3000);

//sse
sse.onmessage = function (res) {    
    const response = JSON.parse(res.data);
    if (response.exit) {
        const playerIndex = gamejson.players.findIndex((player) => {player.username === response.exit.username});
        gamejson.players.splice(playerIndex, 1);
        alert (response.exit.username + response.exit.message);
    /*} else if (response.confirm) {
        if (id === 0) {
            confirmExit(code, response.confirm[0], response.confirm[1], xhr);
        } else if (id) {
            confirmCancel(code, id, xhr);
        }*/
    } else if (response.newHostId) {
        if (response.newHostId === id) {
            alert('You are the new host of this game. ');
            window.location.replace(`/play/${code}?id=0&task=${task}`);
        } else {
            const player = gamejson.players.find((player) => {return player.id === response.newHostId});
            alert(`${player.username} is the new host of this game.`);
            window.location.reload();
        };
    } else if (response.gameover) {
        //sse.close();
        document.body.innerHTML = `<p> ${response.gameover} If you want to play another game, just "create" or "join" a "new game".</p>`
        setTimeout(() => {
            window.location.replace('/');
        }, 5000);
    } else if (response.checkSeekersReady) {
        //console.log('seeker message')
        if (response.checkSeekersReady === 'Y') {
            checkSeekersReady = true;
            if (task === 'seeker') {
                document.getElementById('dialog-wait-seeker').close();
                //clearInterval(timeInterval); timeInterval ist sowieso nicht überall das gleiche
            } else if (timeUpdate - Math.round(gamejson.time / 12) < 60000) {
                alert('Seekers are now hunting you!');
            };
            //console.log(timeUpdate - Math.round(gamejson.time / 12))
        } else {
            //console.log(task);
            if (task === 'seeker') {
                //console.log(timeUpdate);
                waitSeeker(Math.round(gamejson.time / 12) - timeUpdate, dom('.display-waiting-time'));
            } else {
                alert(`You have ${transformTime((Math.round(gamejson.time / 12) - timeUpdate) / 1000)} to run away before the seekers start hunting you.`)
            };
        }
    } else {
        if (response.update) {
            if (!checkSeekersReady) {
                timeUpdate = response.update;
                const updatedTime = (gamejson.time - timeUpdate)/1000;
                //console.log(timeInterval);
                clearInterval(timeInterval);
                //console.log(timeInterval);
                timeInterval = displayTime(updatedTime, dom('.display-time'));

                if (task === 'seeker') {
                    waitSeeker(Math.round(gamejson.time / 12) - timeUpdate, dom('.display-waiting-time'));
                };
            } else {
                //console.log('timeupdate');
                timeUpdate = response.update;
                const updatedTime = (gamejson.time - timeUpdate)/1000;
                clearInterval(timeInterval);
                timeInterval = displayTime(updatedTime, dom('.display-time'));
                //console.log(response.update);
                if (response.update%90000 === 0) {
                    if (task === 'seeker') {
                        dom('.display-message').innerHTML = 'Runaway locations Update!';
                        setTimeout(() => {
                            dom('.display-message').innerHTML = '';
                        }, 5000);
                    } else {
                        dom('.display-message').innerHTML = 'Seekers know your current position.'
                        setTimeout(() => {
                            dom('.display-message').innerHTML = '';
                        }, 5000);
                    }
                };
            }
        };
        if (response.players) {
            //console.log([coordinates, response.players, map, gamejson, task, id, xhr, insideArea, outsideTimeout]);
            
            //gamejson.players = response.players; outcommented so that host can also choose runaways as new hosts
            insideArea = checkDistance(coordinates, response.players, map, gamejson, task, id, xhr, insideArea, outsideTimeout);
            const markerslayer = displayPlayers(response.players, runawayMarkersLayer, seekerMarkersLayer);
            runawayMarkersLayer = markerslayer.runawayMarkersLayer;
            seekerMarkersLayer = markerslayer.seekerMarkersLayer;
        };
    };
};

//exit button
if (id) {
    dom('.display-exit-cancel-button').innerHTML = '<button class="button-exit"> Exit </button>';
    dom('.button-exit').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            sse.close();
            xhr.open('GET', `/exit/${code}?id=${id}&username=${username}&place=play`, true);
            xhr.send();
            window.location.replace('/');
        } else {
            window.location.reload();
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
        } else {
            window.location.reload();
        };
    });
    dom('.button-change-host').addEventListener('click', () => {
        dom('.display-select-host').innerHTML = selectNewHost(gamejson);
        dom('#dialog-select-host').showModal();
        dom('.button-confirm-host').addEventListener('click', () => {
            if (dom('#new-host').value) {
                if (confirm(`Please confirm your exit and ${dom('#new-host').value} as a new host.`)) {
                    sse.close();
                    xhr.open('POST', `/change_host/${code}?place=play`, false);
                    xhr.setRequestHeader('Content-type', 'application/json');
                    const player = gamejson.players.find((player) => {return player.username === dom('#new-host').value});
                    const data = JSON.stringify({id: player.id});
                    xhr.send(data);
                    xhr.open('GET', `/exit/${code}?id=${id}&username=${username}&place=play`, true);
                    xhr.send();
                    window.location.replace('/');
                };
            } else {
                dom('.display-message').innerHTML = 'Please select a new host.'
            }
        });
        dom('.button-cancel-host').addEventListener('click', () => {
            dom('#dialog-select-host').close();
        });
    });

    //set server timeout
    xhr.open('GET', `/time/${code}`);
    xhr.send()
};




//import { getGameInfo, getUsername, waitSeeker, displayTime, transformTime } from './Scripts_modules/play_customized.js';
function getGameInfo (xhr) {
    xhr.open('GET', `/display_map/${code}`, false);
    xhr.send();
    if (xhr.status === 500) {
        document.body.innerHTML = 'Game does no longer exist.'
        setTimeout(() => {
            window.location.replace('/');
        }, 2000);
    };
    return JSON.parse(xhr.response);
};

function getUsername (gamejson, id) {
    const player = gamejson.players.find((player) => {
        return player.id === id
    });
    return player.username;
};

function waitSeeker (time, dom) {
    if (task === 'seeker') {
        document.getElementById('dialog-wait-seeker').showModal();
        //console.log(time);
        waitInterval = displayTime(time / 1000, dom);
    };
};

function displayTime (time, dom) {
    dom.innerHTML = transformTime(time);
    return timeInterval = setInterval(() => {
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

//import { selectNewHost, confirmExit, confirmCancel } from './Scripts_modules/play_host.js';
function selectNewHost (gamejson) {
    let playershtml = '<label>Select the new host:</label> <select id="new-host"> <option> </option>';
    gamejson.players.forEach((player) => {
        if (player.id !== id) {
            playershtml += `<option value="${player.username}">${player.username}</option>`;
        };
    });
    return playershtml +'</select>';
};

/*function confirmExit (code, username, exitid, xhr) {
    if (confirm(`${username} wants to exit the game. Please confirm!`)) {
        xhr.open('POST', `/confirm/exit/${code}?id=${exitid}&answer=confirmed`);
        xhr.send();
    } else {
        xhr.open('POST', `/confirm/exit/${code}?${exitid}&answer=denied`);
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
};*/


//import { createMap, displayPlayers, checkDistance, centerUserPosition } from './Scripts_modules/play_map.js';
function createMap (gamejson, map) {
    map = L.map('map').setView(gamejson.area.coordinates, 12)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const playingArea = L.circle(gamejson.area.coordinates, {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.25,
        radius: gamejson.area.radius
    }).addTo(map);
    return map;
};

function displayPlayers (players, runawayMarkersLayer, seekerMarkersLayer) {
    players.forEach((player) => {
        if (player.coordinates) {
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
        };
    });
    return {runawayMarkersLayer, seekerMarkersLayer};
};

function checkDistance (coordinates, players, map, gamejson, task, id, xhr, insideArea, outsideTimeout) {
    if (task === 'runaway' && checkSeekersReady) {
        //console.log('checking');
        players.forEach((player) => {
            if (player.coordinates) {
                if (player.task === 'seeker' && map.distance(player.coordinates, coordinates) < 5) {
                    sse.close();
                    xhr.open('GET', `/lost_game/${gamejson.code}?id=${id}`);
                    xhr.send();
                    alert('You are caught! You can either join a seeker or wait for the game to finish.')
                    window.location.replace('/');
                };
            };
        });
    };
    if (insideArea) {
        if (gamejson.area.coordinates && coordinates && map.distance(gamejson.area.coordinates, coordinates) > gamejson.area.radius) {
            alert('You are outside of the playing area, you have 1 minute to return, otherwhise you will be disqualified.');
            insideArea = false;
            outsideTimeout = setTimeout(() => {
                sse.close();
                alert('1 minute is over - you are disqualified! You can either join a seeker or wait for the game to finish.')
                xhr.open(`/disqualified/${gamejson.code}?id=${id}`);
                xhr.send();
                window.location.replace('/');
            }, 60000);
        };
    } else {
        if (map.distance(gamejson.area.coordinates, coordinates) < gamejson.area.radius) {
            alert('Well done! You are back inside the playing area.');
            clearTimeout(outsideTimeout);
            window.location.reload();
        };
    };
    return insideArea;
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

//error letzter ready exit, error module im client, timeupdate, sse locations oder lieber post, Durcheinander, github, res.redirect()