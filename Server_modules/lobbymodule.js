const fs = require('fs');
const findmodule = require('./find')

module.exports.findPlayers = findPlayers;
module.exports.deletePlayer = deletePlayer;
module.exports.cancelGame = cancelGame;


//requests on display_players
function findPlayers (code) {
    const newgamesjson = JSON.parse(fs.readFileSync('./Json/new_games.json'));
    let gameIndex = findmodule.findGame(code, newgamesjson);
    let players;
    if (gameIndex + 1) {
        players = newgamesjson[gameIndex].players;
    } else {
        players = 0;
    }
    return players;
};


//requests on exit/lobby
function deletePlayer (code, id) {
    const newgamesjson = JSON.parse(fs.readFileSync('./Json/new_games.json'));
    let gameIndex = findmodule.findGame(code, newgamesjson);
    let playerIndex = findmodule.findPlayer(newgamesjson[gameIndex], id);
    const username = newgamesjson[gameIndex].players[playerIndex].username;
    newgamesjson[gameIndex].players.splice(playerIndex, 1);
    fs.writeFileSync('./Json/new_games.json', JSON.stringify(newgamesjson));
    return username;
};


//requests on cancel/lobby
function cancelGame (code) {
    const newgamesjson = JSON.parse(fs.readFileSync('./Json/new_games.json'));
    let gameIndex = findmodule.findGame(code, newgamesjson);
    newgamesjson.splice(gameIndex, 1);
    fs.writeFileSync('./Json/new_games.json', JSON.stringify(newgamesjson));
};