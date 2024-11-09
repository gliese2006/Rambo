export function createMap (gamejson, map) {
    map = L.map('map').setView(gamejson.area.coordinates, 12)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
};

export function displayPlayers (players, map, runawayMarkersLayer, seekerMarkersLayer) {
    seekerMarkersLayer = L.layerGroup().addTo(map);
    runawayMarkersLayer = L.layerGroup().addTo(map);
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
};

export function checkDistance (coordinates, players, map, gamejson, task, id, xhr, insideArea, outsideTimeout) {
    if (task === 'runaway') {
        players.forEach((player) => {
            if (player.task === 'seeker' && map.distance(player.coordinates, coordinates) < 5) {
                xhr.open(`/play/lost_game/${gamejson.code}?id=${id}`);
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

export function centerUserPosition (map, coordinates, dom, checkCentered) {
    document.body.addEventListener('pointerdown', () => {
        if (map.getCenter() !== coordinates || map.getZoom() !== 14) {
            checkCentered = false;
        }
    });
    dom.addEventListener('click', () => {
        map.setView(coordinates, 14, {animate: true});
        checkCentered = true;
    });
};