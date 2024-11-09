const fs = require('fs');

module.exports.getPlayers = getPlayers;
module.exports.addTasks = addTasks;


//return player property
function getPlayers (code) {
    const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    const players = gamejson.players;
    return players;
};

//add task property to each player object
function addTasks (code, players) {
    const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    gamejson.players = players;
    fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
};