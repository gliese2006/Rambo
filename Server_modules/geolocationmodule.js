module.exports.saveCoordinates = saveCoordinates;
module.exports.setReady = setReady;
module.exports.findSeekers = findSeekers;


function saveCoordinates (gamejson, id, coordinates) {
    const player = gamejson.players.find((player) => {
        return player.id === id
    });
    //player.coordinates = true;
    player.coordinates = coordinates;
    return gamejson.players;
};

function findSeekers (players) {
    return players.filter((player) => {
        return player.task === 'seeker';
    });
};

function setReady (readyList, id) {
    const checkready = readyList.find((item) => {
        return item === id
    });
    if (!checkready) {
        readyList.push(id);
    };
    return readyList;
};