const fs = require('fs');
const findmodule = require('./find');

module.exports.addCurrentGame = addCurrentGame;
module.exports.addArea = addArea;


//create json file for file
function addCurrentGame (code) {
    const newgamesjson = JSON.parse(fs.readFileSync('./Json/new_games.json'));
    let gameIndex = findmodule.findGame(code, newgamesjson);
    if (typeof gameIndex === 'number') {
        const game = newgamesjson[gameIndex];
        newgamesjson.splice(gameIndex, 1);
        fs.writeFileSync('./Json/new_games.json', JSON.stringify(newgamesjson));
        fs.writeFileSync(`./current_games/${code}`, JSON.stringify(game));
    };
};


//add area property to game object
function addArea (code, coordinates, radius) {
    const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    gamejson.area = true;
    gamejson.area = {coordinates, radius};
    fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
};