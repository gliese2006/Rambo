const fs = require('fs');

module.exports.addTime = addTime;


//add time property to game object
function addTime (code, time) {
    const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
    gamejson.time = true;
    gamejson.time = time;
    fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
};