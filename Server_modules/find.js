const fs = require('fs');

module.exports.findGame = findGame;
module.exports.findPlayer = findPlayer;
module.exports.findTask = findTask;
module.exports.findCurrentPlayer = findCurrentPlayer;
module.exports.writeFile = writeFile;
module.exports.deleteFile = deleteFile;
module.exports.readFile = readFile;

function findGame (code, newgamesjson) {
    let index;
    newgamesjson.forEach((item, i) => {
        if (code == item.code) {
            index = i;
        }
    })
    return index;
};

function findPlayer (newgamesjson, id) {
    let playerIndex;
    newgamesjson.players.forEach((player, i) => {
        if (player.id == id) {
            playerIndex = i;
        }
    })
    return playerIndex;
};

function findTask (code, id) {
    const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    let task;
    gamejson.players.forEach((player) => {
        if(player.id == id) {
            task = player.task;
        }
    });
    return task;
};

function findCurrentPlayer (code, id, cb) {
    let gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    gamejson.players.forEach((player, i) => {
        if (player.id == id) {
            cb(i, gamejson);
        };
    });
    fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
    //console.log('done');
};

function readFile (code) {
    return JSON.parse(fs.readFileSync(`./current_games/${code}`));
}

function writeFile (code, gamejson) {
    fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
};

function deleteFile (code) {
    fs.unlinkSync(`./current_games/${code}`)
};