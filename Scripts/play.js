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

        if (checkCentered) {
            map.setView(coordinates, 19, {animate: true});
        };
    };

    function ecb (error) {
        //Alert only once (every x seconds)
        alert(`${error.message}! Without geolocation it is not possible to play the game. Please try again or exit the game.`);
        dom('.display-message').innerHTML = `<p>${error.message}! Without geolocation it is not possible to play the game. Please try again or exit the game.</p>`;
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
        dom('body').style.height = `${screen.height}px`;
        dom('body').style.marginTop = '0px';
        dom('body').style.display = 'flex';
        dom('body').style.justifyContent = 'center';
        dom('body').style.alignItems = 'center';
        document.body.innerHTML = `<div class="div-cancel-message"> ${response.gameover} If you want to play another game, just "create" or "join" a "new game".</div>`
        dom('.div-cancel-message').style.fontSize = '25px';
        dom('.div-cancel-message').style.textAlign = 'center';
        setTimeout(() => {
            window.location.replace('/');
        }, 5000);
    } else if (response.checkSeekersReady) {
        //console.log('seeker message')
        if (response.checkSeekersReady === 'Y') {
            checkSeekersReady = true;
            document.getElementById('div-waiting-time').remove();
            if (task === 'runaway' && timeUpdate - Math.round(gamejson.time / 12) < 60000) {
                alert('Seekers are now hunting you!');
            };
            //console.log(timeUpdate - Math.round(gamejson.time / 12))
        } else {
            if (task === 'seeker') {
                const s = dom('.div-waiting-time').style
                s.position = 'absolute';
                s.top = '5px';
                s.bottom = '5px';
                s.right = '5px';
                s.left = '5px';
                s.fontSize = '30px';
                dom('.display-waiting-message').style.fontSize = '25px';
                dom('.display-waiting-message').innerHTML = 'Wait for'
            } else {
                const s = dom('.div-waiting-time').style
                s.position = 'absolute';
                s.top = '10px';
                s.right = '15vh';
                s.left = '10vh';
                s.fontSize = '15px';
                dom('.display-waiting-message').style.fontSize = '13px';
                dom('.display-waiting-message').innerHTML = 'Time, until seekers start hunting you:';
            };
            //console.log(task);
            displayWaitTime((Math.round(gamejson.time / 12) - timeUpdate) / 1000, dom('.display-waiting-time'));
        }
    } else {
        if (response.update) {
            if (!checkSeekersReady) {
                timeUpdate = response.update;
                const updatedTime = (gamejson.time - timeUpdate)/1000;
                displayTime(updatedTime, dom('.display-time'));

                displayWaitTime((Math.round(gamejson.time / 12) - timeUpdate) / 1000, dom('.display-waiting-time'));
            } else {
                console.log('timeupdate');
                timeUpdate = response.update;
                const updatedTime = (gamejson.time - timeUpdate)/1000;
                displayTime(updatedTime, dom('.display-time'));
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
    dom('.buttons').innerHTML = '<div class="link-1 div-1"><p>Exit</p></div>';
    dom('.div-1').addEventListener('click', () => {
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
    dom('.buttons').innerHTML = '<div class="link-1 div-1"><p>Cancel</p></div> <div class="link-2 div-2"><p>Exit</p></div>';
    dom('.div-1').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel/${code}?place=play`, false);
            xhr.send();
        } else {
            window.location.reload();
        };
    });
    dom('.div-2').addEventListener('click', () => {
        dom('.display-select-host').innerHTML = selectNewHost(gamejson);
        console.log('clicked');
        dom('.div-select-host').style.display = 'flex';
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
                dom('.display-message-dialog').innerHTML = 'Please select a new host.'
            }
        });
        dom('.button-cancel-host').addEventListener('click', () => {
            dom('.div-select-host').style.display = 'none';
        });
        dom('.display-message-dialog').innerHTML = '';
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
        dom('body').style.height = `${screen.height}px`;
        dom('body').style.display = 'flex';
        dom('body').style.justifyContent = 'center';
        dom('body').style.alignItems = 'center';
        document.body.innerHTML = '<div class="div-cancel-message"> Game does no longer exist. </div>'
        dom('.div-cancel-message').style.fontSize = '25px';
        dom('.div-cancel-message').style.textAlign = 'center';
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

function displayTime (time, dom) {
    clearInterval(timeInterval);
    dom.innerHTML = transformTime(time);
    timeInterval = setInterval(() => {
        time --;
        dom.innerHTML = transformTime(time);
    }, 1000);
};

function displayWaitTime (time, dom) {
    clearInterval(waitInterval);
    dom.innerHTML = transformTime(time);
    waitInterval = setInterval(() => {
        time --;
        dom.innerHTML = transformTime(time);
    }, 1000);
};

function transformTime (time) {
    let h = `${Math.round(time/3600 - 0.5)}`;
    let min = `${Math.round((time%3600)/60 - 0.5)}`;
    let sec = `${Math.round((time%3600)%60 - 0.5)}`;
    h = addZeroTime(h);
    min = addZeroTime(min);
    sec = addZeroTime(sec);
    return `${h} : ${min} : ${sec}`;
};

function addZeroTime (time) {
    if (time.length === 1) {
        time = '0' + time;
    };
    return time;
};

//import { selectNewHost, confirmExit, confirmCancel } from './Scripts_modules/play_host.js';
function selectNewHost (gamejson) {
    let playershtml = '<label>Select the new host:</label> <select id="new-host"> <option> </option>';
    gamejson.players.forEach((player) => {
        if (player.id !== id && player.task === 'seeker') {
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
        maxZoom: 23,
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
                if (player.task === 'seeker' && map.distance(player.coordinates, coordinates) < 10) {
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

//centerUserPosition button
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
    dom('.buttons').addEventListener('click', () => {
        hideDropdown();
    });

//error letzter ready exit, error module im client, timeupdate, sse locations oder lieber post, Durcheinander, github, res.redirect()