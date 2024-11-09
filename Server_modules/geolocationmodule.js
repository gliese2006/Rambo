module.exports.saveCoordinates = saveCoordinates;
module.exports.setReady = setReady;
module.exports.findSeekers = findSeekers;


function saveCoordinates (gamejson, id, coordinates) {
    gamejson.players.forEach((player) => {
        if (player.id === id) {
            player.coordinates = true;
            player.coordinates = coordinates;
        };
    });
    return gamejson.players;
};

function findSeekers (players) {
    let seekers = [];
    players.forEach((player) => {
        if (player.task === 'seeker') {
            seekers.push(player);
        };
    });
    return seekers;
};

function setReady (readyList, id) {
    let checkready;
    readyList.forEach((item) => {
        if(item === id) {
            checkready = 'ready';
        };
    });
    if (!checkready) {
        readyList.push(id);
    };
    return readyList;
};