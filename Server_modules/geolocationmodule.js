const findmodule = require('./find');

module.exports.saveCoordinates = saveCoordinates;
module.exports.setReady = setReady;
module.exports.findAllPlayersWithTask = findAllPlayersWithTask;
module.exports.checkRunawayNumber = checkRunawayNumber;
module.exports.clearTimer = clearTimer;
module.exports.deleteRunawayUpdate = deleteRunawayUpdate;


function saveCoordinates (gamejson, id, coordinates) {
    const player = gamejson.players.find((player) => {
        return player.id === id
    });
    //player.coordinates = true;
    player.coordinates = coordinates;
    return gamejson.players;
};

function findAllPlayersWithTask (players, task) {
    return players.filter((player) => player.task === task);
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
    console.log(runaway);
    if (!runaway) {
        console.log('canceling');
        clearTimer(code, timers);
        play.emit(`gameOver/${code}`, 'All runaways caught. Seekers won!');
    };
};

function clearTimer (code, timers) {
    const timer = timers.get(code);
    //console.log(timer.countSeconds);
    clearInterval(timer.countSeconds);
    //console.log(timer.countSeconds)
    clearInterval(timer.runawayUpdate);
    clearTimeout(timer.gameOver);
    clearTimeout(timer.waitToDelete);
    clearTimeout(timer.seekersReady);
    setTimeout(() => {
        findmodule.deleteFile(code);
    }, 30000);
    timers.delete(code);
    //console.log(timers);
}

function deleteRunawayUpdate (timers, code, id) {
    const timer = timers.get(code);
    const i = timer.runawayLocationsUpdate.findIndex((runaway) => runaway.id == id);
    if (i !== -1) {
        timer.runawayLocationsUpdate.splice(i, 1);
    };
    timers.set(code, timer);
};