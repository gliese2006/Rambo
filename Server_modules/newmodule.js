//requests on new
const fs = require('fs');

module.exports.createCode = createCode;
module.exports.createNewGame = createNewGame;


function createCode () {
    let code = Math.round(Math.random()*10**6).toString();
    while (code.length < 6) {
        code = '0' + code
    }
    return code;
};

function createNewGame (code, username, colors) {
    const newgamesjson = JSON.parse(fs.readFileSync('./current_games/new_games.json'));
    const newGameObject = {
        code,
        players: [
            {
                username,
                id: 0,
                color: colors[0]
            }
        ]
    }
    
    newgamesjson.push(newGameObject);

    fs.writeFileSync('./current_games/new_games.json', JSON.stringify(newgamesjson));
};