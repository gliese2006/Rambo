const express = require('express');
//const cors = require('cors');
const fs = require('fs');
const EventEmitter = require('events');
const newPlayerEmitter = new EventEmitter();
newPlayerEmitter.setMaxListeners(100);
const waitingForHost = new EventEmitter();
waitingForHost.setMaxListeners(100);
const newCoordinates = new EventEmitter();
newCoordinates.setMaxListeners(100);
const play = new EventEmitter();
play.setMaxListeners(100);

const app = express();
app.use(express.json());
//app.use(cors({origin: ['http://localhost:8000', 'http://127.0.0.1:8000']}));
let timers = [];
class addTimer {
    constructor (code, countSeconds, runawayUpdate, gameOver, waitToDelete, seekersReady, runawayLocationsUpdate) {
        this.code = code;
        this.countSeconds = countSeconds;
        this.runawayUpdate = runawayUpdate;
        this.gameOver = gameOver;
        this.waitToDelete = waitToDelete;
        this.seekersReady = seekersReady;
        this.runawayLocationsUpdate = runawayLocationsUpdate;
    };
};


//files
const homehtml = fs.readFileSync('./HTML/home.html');
const homecss = fs.readFileSync('./Style/home.css');
const headerjs = fs.readFileSync('./Scripts/header.js');
const headercss = fs.readFileSync('./Style/header.css');

const instructionshtml = fs.readFileSync('./HTML/instructions.html')

const newhtml = fs.readFileSync('./HTML/new.html');
const newjs = fs.readFileSync('./Scripts/new.js');
const newcss = fs.readFileSync('./Style/new.css');

const joinhtml = fs.readFileSync('./HTML/join.html');
const joinjs = fs.readFileSync('./Scripts/join.js');
const joincss = fs.readFileSync('./Style/join.css');

const lobbyhtml = fs.readFileSync('./HTML/lobby.html');
const lobbyjs = fs.readFileSync('./Scripts/lobby.js');
const lobbycss = fs.readFileSync('./Style/lobby.css');

const waithtml = fs.readFileSync('./HTML/wait.html');
const waitjs = fs.readFileSync('./Scripts/wait.js');

const setAreahtml = fs.readFileSync('./HTML/set_area.html');
const setAreajs = fs.readFileSync('./Scripts/set_area.js');

const setTaskshtml = fs.readFileSync('./HTML/set_tasks.html');
const setTasksjs = fs.readFileSync('./Scripts/set_tasks.js');

const setTimehtml = fs.readFileSync('./HTML/set_time.html');
const setTimejs = fs.readFileSync('./Scripts/set_time.js');

const seekerInstructionshtml = fs.readFileSync('./HTML/seeker_instructions.html');
const seekerInstructionsjs = fs.readFileSync('./Scripts/seeker_instructions.js');

const runawayInstructionshtml = fs.readFileSync('./HTML/runaway_instructions.html');
const runawayInstructionsjs = fs.readFileSync('./Scripts/runaway_instructions.js');

const checkGeolocationhtml = fs.readFileSync('./HTML/check_geolocation.html');
const checkGeolocationjs = fs.readFileSync('./Scripts/check_geolocation.js');

const playhtml = fs.readFileSync('./HTML/play.html');
const playjs = fs.readFileSync('./Scripts/play.js');

//selfmade modules
const findmodule = require('./Server_modules/find');
const newmodule = require('./Server_modules/newmodule');
const joinmodule = require('./Server_modules/joinmodule');
const lobbymodule = require('./Server_modules/lobbymodule');
const setareamodule = require('./Server_modules/setareamodule');
const settasksmodule = require('./Server_modules/settasksmodule');
const settimemodule = require('./Server_modules/settimemodule');
const geolocationmodule = require('./Server_modules/geolocationmodule');

//event-listeners
//request on lobby
    app.get('/display_players/:code', (req, res) => {
        const code = req.params.code;
        res.setHeader('Content-type', 'text/event-stream');
        newPlayerEmitter.on(`exited_game/${code}`, (username) => {
            res.write("data: " + `${JSON.stringify({exit: username})}\n\n`);
        });
        newPlayerEmitter.on(`newPlayer/${code}`, () => {
            //console.log(`New Player on newPlayer/${req.params.code}`);
            //console.log(lobbymodule.findPlayers(req.params.code));
            res.write("data: " + `${JSON.stringify(lobbymodule.findPlayers(code))}\n\n`);        
        });
        newPlayerEmitter.on(`wait/${code}`, () => {
            res.write("data: " + `${JSON.stringify('wait')}\n\n`);
            res.end();
        })
        newPlayerEmitter.emit(`newPlayer/${code}`);
    });

//request on preparation
    app.get('/waiting_for_host/:code', (req, res) => {
        const code = req.params.code;
        const id = req.query.id;
        res.setHeader('Content-type', 'text/event-stream');
        let gamejson = findmodule.readFile(code);
        if (gamejson.readyForInstructions) {
            const task = findmodule.findTask(code, id);
            res.write("data: " + `${JSON.stringify(`/${task}_instructions/${code}?id=${id}`)}\n\n`); 
        };
        waitingForHost.on(`ready_for_instructions/${code}`, () => {
            const task = findmodule.findTask(code, id);
            res.write("data: " + `${JSON.stringify(`/${task}_instructions/${code}?id=${id}`)}\n\n`);
            res.end();
        });
        waitingForHost.on(`canceled_game/${code}`, () => {
            res.write("data: " + `${JSON.stringify('canceled')}\n\n`);
            res.end();
        });
    });

//request on play
    app.get('/get_geolocations/:code', (req, res) => {
        const code = req.params.code;
        let firstTimeUpdate = false;
        let gamejson = findmodule.readFile(code);
        let readyList = [];
        res.setHeader('Content-type', 'text/event-stream');
        if (gamejson.gameRunning && req.query.place === 'check_geolocation') {
            res.write("data: " + `${JSON.stringify('ready')}\n\n`);
        };
        
        play.on(`countTime/${code}`, (countSec) => {
            if (!firstTimeUpdate) {
                const timer = timers.find((timer) => {return timer.code === code});
                const players = timer && timer.runawayLocationsUpdate ? timer.runawayLocationsUpdate : undefined;
                console.log(players);
                res.write("data: " + `${JSON.stringify({players, update: countSec * 1000})}\n\n`);
                firstTimeUpdate = true;

                if (gamejson.checkSeekersReady) {
                    res.write("data: " + `${JSON.stringify({checkSeekersReady: 'Y'})}\n\n`);
                } else {
                    res.write("data: " + `${JSON.stringify({checkSeekersReady: 'N'})}\n\n`);
                };
            };
        });
        if (gamejson.gameOver) {
            res.write("data: " + `${JSON.stringify({gameover: 'The Game is over.'})}\n\n`);
            res.end();
        };

        newCoordinates.on(`reread/${code}`, () => {
            gamejson = findmodule.readFile(code);
        });
        newCoordinates.on(`new_coordinates/${code}`, (coordinates, id, update) => {
            let players;
            if (typeof id === 'number') {
                if (req.query.task === 'runaway') {
                    players = geolocationmodule.saveCoordinates(gamejson, id, coordinates);
                } else if (req.query.task === 'seeker') {
                    players = geolocationmodule.findAllPlayersWithTask(geolocationmodule.saveCoordinates(gamejson, id, coordinates), 'seeker');
                };
            };
            if (update) {
                console.log(update + ': ' + code);
                const timer = timers.find((timer) => {return timer.code === code});
                if (timer) {
                    timer.runawayLocationsUpdate = geolocationmodule.findAllPlayersWithTask(gamejson.players, 'runaway');
                    players = timer.runawayLocationsUpdate;
                } else {
                    players = gamejson.players;
                }
            };
            res.write("data: " + `${JSON.stringify({players, update})}\n\n`);
        });
        newCoordinates.on(`tryready/${code}`, () => {
            res.write("data: " + `${JSON.stringify('ready')}\n\n`);
            console.log(req.query.id);
        });
        newCoordinates.on(`ready/${code}`, (id) => {
            if (id) {
                readyList = geolocationmodule.setReady(readyList, id);
            };
            if (readyList.length === gamejson.players.length) {
                //console.log(req.query.id);
                newCoordinates.emit(`tryready/${code}`);
            };
        });
        newCoordinates.on(`canceled_game/${code}`, () => {
            res.write("data: " + `${JSON.stringify('canceled')}\n\n`);
            res.end();
        });
        newCoordinates.on(`exited_game/${code}`, (username) => {
                res.write("data: " + `${JSON.stringify({exit: {username, message: ' exited the game.'}})}\n\n`);
        });
        play.on(`seekersReady/${code}`, () => {
            res.write("data: " + `${JSON.stringify({checkSeekersReady: 'Y'})}\n\n`);
            gamejson.checkSeekersReady = true;
            findmodule.writeFile(code, gamejson);
            newCoordinates.emit(`reread/${code}`);
        });
        play.on(`newHost/${code}`, (newHostId) => {
            res.write("data: " + `${JSON.stringify({newHostId})}\n\n`);
        });
        play.on(`lost_game/${code}`, (username) => {
            res.write("data: " + `${JSON.stringify({exit: {username, message: ' was caught.'}})}\n\n`);
        });
        play.on(`disqualified/${code}`, (username) => {
            res.write("data: " + `${JSON.stringify({exit: {username, message: ' was disqualified.'}})}\n\n`);
        });
        play.on(`gameOver/${code}`, (message) => {
            gamejson.gameOver = true;
            findmodule.writeFile(code, gamejson);
            //newCoordinates.emit(`reread/${code}`);
            res.write("data: " + `${JSON.stringify({gameover: message})}\n\n`);
            res.end();
        });
    });





//OUTSIDE
//requests on home
    app.get('/', (req, res) => {
        res.end(homehtml);
    });

    app.get('/home.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(homecss);
    });

    app.get('/header.js', (req, res) => {
        res.end(headerjs);
    });

    app.get('/header.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(headercss);
    });

//request on instructions
    app.get('/instructions', (req, res) => {
        res.end(instructionshtml)
    })

//requests on new
    app.get('/new', (req, res) => {
        res.end(newhtml);
    });

    app.get('/new.js', (req, res) => {
        res.end(newjs);
    });

    app.get('/new.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(newcss);
    });

    app.post('/create_new_game', (req, res) => {
        const username = req.body.username;
        const code = newmodule.createCode();
        newmodule.createNewGame(code, username)
        res.write(JSON.stringify(`/lobby/${code}?id=0`));
        res.end();
    });

//request on join
    app.get('/join', (req, res) => {
        res.end(joinhtml)
    });
    
    app.get('/join.js', (req, res) => {
        res.end(joinjs);
    });

    app.get('/join.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(joincss);
    });

    app.post('/add_new_player', (req, res) => {
        const code = req.body.code;
        const username = req.body.username;
        const responseNewPlayer = joinmodule.addNewPlayer(code, username);
        if (responseNewPlayer.check) {
            newPlayerEmitter.emit(`newPlayer/${code}`);
        };
        res.write(JSON.stringify(responseNewPlayer));
        res.end();
    });





//LOBBY
//request on lobby
    app.get('/lobby/:code', (req, res) => {
        res.end(lobbyhtml);
    });

    app.get('/lobby.js', (req, res) => {
        res.end(lobbyjs);
    });

    app.get('/lobby.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(lobbycss);
    });

    //app.get('/display_players/:code')

    app.get('/exit/lobby/:code', (req, res) => {
        const code = req.params.code;
        const id = req.query.id;
        const username = lobbymodule.deletePlayer(code, id);
        newPlayerEmitter.emit(`exited_game/${code}`, username);
        newPlayerEmitter.emit(`newPlayer/${code}`);
        res.end();
    });

    app.get('/cancel/lobby/:code', (req, res) => {
        const code = req.params.code;
        lobbymodule.cancelGame(code);
        newPlayerEmitter.emit(`newPlayer/${code}`);
        res.end();
    });





//PREPARATION
//general requests
    app.get('/exit/:code', (req, res) => {
        const code = req.params.code;
        const id = req.query.id;
        const place = req.query.place;
        let username;
        findmodule.findCurrentPlayer(code, id, (i, gamejson) => {
            username = gamejson.players[i].username;
            gamejson.players.splice(i, 1);
        });
        
        newCoordinates.emit(`exited_game/${code}`, username);
        newCoordinates.emit(`reread/${code}`);

        if (place === 'check_geolocation') {
            newCoordinates.emit(`ready/${code}`);
        } else {
            timers = geolocationmodule.checkRunawayNumber(code, timers, play);
        };
        res.end();
    });

    app.get('/cancel/:code', (req, res) => {
        const code = req.params.code;
        const place = req.query.place;
        findmodule.deleteFile(code);
        if (place === 'wait') {
            waitingForHost.emit(`canceled_game/${code}`);
        } else if (place === 'check_geolocation') {
            newCoordinates.emit(`canceled_game/${code}`);
        } else if (place === 'play') {
            geolocationmodule.clearTimer(code, timers);
            play.emit(`gameOver/${code}`, 'Host canceled game!');
        };
        res.end();
    });

//request on wait
    app.get('/wait/:code', (req, res) => {
        res.end(waithtml);
    });

    app.get('/wait.js', (req, res) => {
        res.end(waitjs);
    });

//request on set_area
    app.get('/set_area/:code', (req, res) => {
        const code = req.params.code;
        newPlayerEmitter.emit(`wait/${code}`);
        setareamodule.addCurrentGame(code);
        res.end(setAreahtml);
    });

    app.get('/set_area.js', (req, res) => {
        res.end(setAreajs);
    });

    app.post('/send_playing_area/:code', (req, res) => {
        const code = req.params.code;
        const coordinates = req.body.coordinates;
        const radius = req.body.radius;
        setareamodule.addArea(code, coordinates, radius);
        res.end(JSON.stringify(`/set_tasks/${code}`));
    });
    //redirect players to new sse, write current game file, redirect admin to set_area

//request on set_tasks
    app.get('/set_tasks/:code', (req, res) => {
        res.end(setTaskshtml);
    });

    app.get('/set_tasks.js', (req, res) => {
        res.end(setTasksjs);
    });

    app.get('/set_player_task/:code', (req, res) => {
        const code = req.params.code;
        const players = JSON.stringify(settasksmodule.getPlayers(code));
        res.end(players);
    });

    app.post('/send_player_task/:code', (req, res) => {
        const code = req.params.code;
        const players = req.body;
        settasksmodule.addTasks(code, players);
        res.end();
    });

//request on set_time
    app.get('/set_time/:code', (req, res) => {
        res.end(setTimehtml);
    });

    app.get('/set_time.js', (req, res) => {
        res.end(setTimejs)
    });

    app.post('/send_playing_time/:code', (req, res) => {
        const code = req.params.code;
        const time = req.body.time;
        const task = findmodule.findTask(code, 0);
        settimemodule.addTime(code, time);
        const gamejson = findmodule.readFile(code);
        gamejson.readyForInstructions = true;
        findmodule.writeFile(code, gamejson);
        waitingForHost.emit(`ready_for_instructions/${code}`);
        res.end(JSON.stringify(`/${task}_instructions/${code}?id=0`));
    });

    
//request on ..._instructions
    app.get('/seeker_instructions/:code', (req, res) => {
        res.end(seekerInstructionshtml);
    });

    app.get('/seeker_instructions.js', (req, res) => {
        res.end(seekerInstructionsjs);
    });

    app.get('/runaway_instructions/:code', (req, res) => {
        res.end(runawayInstructionshtml);
    });

    app.get('/runaway_instructions.js', (req, res) => {
        res.end(runawayInstructionsjs);
    });


//PLAY
//request on check_geolocation
    app.get('/check_geolocation/:code', (req, res) => {
        if (req.query.status) {
            newCoordinates.emit(`ready/${req.params.code}`, req.query.id);
        };
        res.end(checkGeolocationhtml);
    });

    app.get('/check_geolocation.js', (req, res) => {
        res.end(checkGeolocationjs);
    });

//request on play
    app.get('/play/:code', (req, res) => {
        res.end(playhtml);
    });

    app.get('/play.js', (req, res) => {
        res.end(playjs);
    });

    app.post('/send_coordinates/:code', (req, res) => {
        const code = req.params.code;
        const id = Number(req.query.id);
        const place = req.query.place;
        const coordinates = req.body.coordinates;
        if (place === 'check_geolocation') {
            newCoordinates.emit(`new_coordinates/${code}`, coordinates, id, true);
        } else {
            newCoordinates.emit(`new_coordinates/${code}`, coordinates, id, false);
        };
        res.end();
    });

    app.get('/display_map/:code', (req, res) => {
        const code = req.params.code;
        if (fs.readdirSync('./current_games').find((game) => {return game === code})) {
            const gamejson = findmodule.readFile(code);
            res.end(JSON.stringify(gamejson));
        } else {
            res.status(500);
            res.end();
        };
    });

    app.get('/time/:code', (req, res) => {
        const code = req.params.code;
        let gamejson = findmodule.readFile(code);
        if (!gamejson.gameRunning) {
            //playing time
            let countUpdates = 0;
            let countSec = 0;
            /*const updateInterval = setInterval(() => {
                countUpdates ++;
                play.emit(`updateTime/${code}`, countUpdates);
            }, 60000);*/
            const countSeconds = setInterval(() => {
                countSec ++;
                play.emit(`countTime/${code}`, countSec);
            }, 1000);
            const runawayUpdate = setInterval(() => {
                countUpdates ++;
                console.log('actual update');
                newCoordinates.emit(`new_coordinates/${code}`, undefined, undefined, countUpdates * 90000);
            }, 90000);
            let waitToDelete;
            const gameOver = setTimeout(() => {
                play.emit(`gameOver/${code}`, 'Time is up. Runaways won!');
                waitToDelete = setTimeout(() => {
                    findmodule.deleteFile(code);
                    timers.splice(findmodule.timersFindIndex(code, timers), 1);
                }, 30000);
                //clearInterval(updateInterval);
                clearInterval(runawayUpdate);
                clearInterval(countSeconds);
            }, gamejson.time);

            let count = 0;
            setInterval(() => {
                const coordinates = timers[0].runawayLocationsUpdate ? timers[0].runawayLocationsUpdate[0].coordinates : timers[0].runawayLocationsUpdate;
                console.log(count + ': ' + coordinates);
                count ++;
            }, 1000);

            //wait seeker time
            const seekersReady = setTimeout(() => {
                play.emit(`seekersReady/${code}`);
            }, gamejson.time/12);
            const timer = new addTimer (code, countSeconds, runawayUpdate, gameOver, waitToDelete, seekersReady, false);
            //const timer = new addTimer (1, 2, 3, 4, 5, 6);
            const hello = {hello1: 1, hello: 2};
            //console.log(timer.code);
            //timers.push('hello2');
            //timers.push(hello);
            timers.push(timer);
            //timers.push('hello');
            //console.log(timers[1]);
            //console.log(timers[0].code);
            //console.log(timers[0].countSeconds);
            gamejson.gameRunning = true;
            findmodule.writeFile(code, gamejson);
            newCoordinates.emit(`reread/${code}`);
            //console.log('set Intervals and Timeouts');
        }; 
        res.end();
    });

    app.get('/lost_game/:code', (req, res) => {
        const code = req.params.code;
        const id = req.query.id;
        let username;

        findmodule.findCurrentPlayer(code, id, (i, gamejson) => {
            username = gamejson.players[i].username;
            gamejson.players.splice(i, 1);
        });

        play.emit(`lost_game/${code}`, username);
        timers = geolocationmodule.checkRunawayNumber(code, timers, play);
        res.end();
    });

    app.get('/disqualified/:code', (req, res) => {
        const code = req.params.code;
        const id = req.query.id;
        let username;

        findmodule.findCurrentPlayer(code, id, (i, gamejson) => {
            username = gamejson.players[i].username;
            gamejson.players.splice(i, 1);
        });

        play.emit(`disqualified/${code}`, username);
        timers = geolocationmodule.checkRunawayNumber(code, timers, play);
        res.end();
    });

    app.post('/change_host/:code', (req, res) => {
        const code = req.params.code;
        const newHostId = req.body.id;
        const gamejson = findmodule.readFile(code);
        gamejson.players[newHostId].id = 0;
        findmodule.writeFile(code, gamejson);
        play.emit(`newHost/${code}`, newHostId);
        res.end();
    });






app.listen(8000, () => {
    console.log('Server listening on port 8000!')
})

/*
function hello() {
    setTimeout(() => {
        console.log('hello')
    }, 1000);
}

hello()
console.log('goodbye')

function hello2() {
    return new Promise((resolve) =>  {
        setTimeout(() => {
            console.log('hello')
            resolve()
        }, 1000);
    }
}


await hello2()
*/