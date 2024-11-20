const findmodule = require('./find');

module.exports.saveCoordinates = saveCoordinates;
module.exports.setReady = setReady;
module.exports.findAllPlayersWithTask = findAllPlayersWithTask;
module.exports.checkRunawayNumber = checkRunawayNumber;
module.exports.clearTimer = clearTimer;


function saveCoordinates (gamejson, id, coordinates) {
    const player = gamejson.players.find((player) => {
        return player.id === id
    });
    //player.coordinates = true;
    player.coordinates = coordinates;
    return gamejson.players;
};

function findAllPlayersWithTask (players, task) {
    return players.filter((player) => {
        return player.task === task;
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

function checkRunawayNumber (code, timers, play) {
    const gamejson = findmodule.readFile(code);
    const runaway = gamejson.players.find((player) => {
        return player.task === 'runaway';
    });
    if (!runaway) {
        clearTimer(code, timers);
        play.emit(`gameOver/${code}`, 'All runaways caught. Seekers won!');
    };
    return timers;
};

function clearTimer (code, timers) {
    const i = findmodule.timersFindIndex(code, timers);
    clearInterval(timers[i].countSeconds);
    clearInterval(timers[i].runawayUpdate);
    clearTimeout(timers[i].gameOver);
    clearTimeout(timers[i].waitToDelete);
    clearTimeout(timers[i].seekersReady);
    setTimeout(() => {
        findmodule.deleteFile(code);
    }, 30000);
    timers.splice(i, 1);
}