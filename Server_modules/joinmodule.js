//requests on join
const fs = require('fs');
const findmodule = require('./find');

module.exports.addNewPlayer = addNewPlayer;


function addNewPlayer(code, username) {
    const newgamesjson = JSON.parse(fs.readFileSync('./Json/new_games.json'));
    let returnObject;
    let gameIndex = findmodule.findGame(code, newgamesjson);

    if (typeof gameIndex === 'number') {
        let checkSameName;

        newgamesjson[gameIndex].players.forEach((player) => {
            if (player.username === username) {
                checkSameName = true;
            }
        });

        if (!checkSameName) {
            let newPlayer = {
                username,
                id: newgamesjson[gameIndex].players[newgamesjson[gameIndex].players.length - 1].id + 1
            };

            newgamesjson[gameIndex].players.push(newPlayer)
            fs.writeFileSync('./Json/new_games.json', JSON.stringify(newgamesjson));

            returnObject = {check: true, response: `http://localhost:8000/lobby/${code}?id=${newPlayer.id}`};
        } else {
            returnObject = {check: false, response: 'This name is already taken, please pick another one.'};
        };
    } else {
        returnObject = {check: false, response: 'Wrong code, please try again!'};
    }

    return returnObject;
};