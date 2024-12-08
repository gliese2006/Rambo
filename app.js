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
/*app.use(express.static('./HTML', {extensions:['html']}));
app.use(express.static('./Scripts'));
app.use(express.static('./Style'));*/
//app.use(cors({origin: ['http://localhost:8000', 'http://127.0.0.1:8000']}));
const timers = new Map();
class Timer {
    
    #runawayLocationsUpdate;
    
    constructor (code, countSeconds, runawayUpdate, gameOver, waitToDelete, seekersReady, runawayLocationsUpdate) {
        this.code = code;
        this.countSeconds = countSeconds;
        this.runawayUpdate = runawayUpdate;
        this.gameOver = gameOver;
        this.waitToDelete = waitToDelete;
        this.seekersReady = seekersReady;
        this.#runawayLocationsUpdate = runawayLocationsUpdate;
    };

    getRunawayLocationsUpdate() {
        //console.log('get');
        //console.log(this.#runawayLocationsUpdate)
        return Array.from(this.#runawayLocationsUpdate);
    };

    setRunawayLocationsUpdate(newRunawayLocationsUpdate) {
        console.log("new")
        //console.log(newRunawayLocationsUpdate);
        this.#runawayLocationsUpdate = Array.from(newRunawayLocationsUpdate);
        //console.log("saved");
        console.log(this.#runawayLocationsUpdate);
    };
};

//files
const homehtml = fs.readFileSync('./HTML/home.html');
const homecss = fs.readFileSync('./Style/home.css');
const headerjs = fs.readFileSync('./Scripts/home_header.js');
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
const waitcss = fs.readFileSync('./Style/wait.css');

const setAreahtml = fs.readFileSync('./HTML/set_area.html');
const setAreajs = fs.readFileSync('./Scripts/set_area.js');
const setAreacss = fs.readFileSync('./Style/set_area.css');

const setTaskshtml = fs.readFileSync('./HTML/set_tasks.html');
const setTasksjs = fs.readFileSync('./Scripts/set_tasks.js');
const setTaskscss = fs.readFileSync('./Style/set_tasks.css');

const setTimehtml = fs.readFileSync('./HTML/set_time.html');
const setTimejs = fs.readFileSync('./Scripts/set_time.js');
const setTimecss = fs.readFileSync('./Style/set_time.css');

const seekerInstructionshtml = fs.readFileSync('./HTML/seeker_instructions.html');
const seekerInstructionsjs = fs.readFileSync('./Scripts/seeker_instructions.js');
const taskInstructionscss = fs.readFileSync('./Style/task_instructions.css');

const runawayInstructionshtml = fs.readFileSync('./HTML/runaway_instructions.html');
const runawayInstructionsjs = fs.readFileSync('./Scripts/runaway_instructions.js');

const checkGeolocationhtml = fs.readFileSync('./HTML/check_geolocation.html');
const checkGeolocationjs = fs.readFileSync('./Scripts/check_geolocation.js');
const checkGeolocationcss = fs.readFileSync('./Style/check_geolocation.css');
const headerPlaycss = fs.readFileSync('./Style/header_play.css');

const playhtml = fs.readFileSync('./HTML/play.html');
const playjs = fs.readFileSync('./Scripts/play.js');
const playcss = fs.readFileSync('./Style/play.css');

//selfmade modules
const findmodule = require('./Server_modules/find');
const newmodule = require('./Server_modules/newmodule');
const joinmodule = require('./Server_modules/joinmodule');
const lobbymodule = require('./Server_modules/lobbymodule');
const setareamodule = require('./Server_modules/setareamodule');
const settasksmodule = require('./Server_modules/settasksmodule');
const settimemodule = require('./Server_modules/settimemodule');
const geolocationmodule = require('./Server_modules/geolocationmodule');

function sendData(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

//event-listeners
//request on lobby
    app.get('/display_players/:code', (req, res) => {
        const code = req.params.code;
        res.setHeader('Content-type', 'text/event-stream');
        newPlayerEmitter.on(`exited_game/${code}`, (username) => {
            sendData(res, {exit: username});
        });
        newPlayerEmitter.on(`newPlayer/${code}`, () => {
            //console.log(`New Player on newPlayer/${req.params.code}`);
            //console.log(lobbymodule.findPlayers(req.params.code));
            sendData(res, lobbymodule.findPlayers(code));        
        });
        newPlayerEmitter.on(`wait/${code}`, () => {
            sendData(res, 'wait');
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
            if (req.query.id == 0) {
                //console.log(gamejson.players);
            }
            if (!firstTimeUpdate) {
                const timer = timers.get(code);
                //console.log('runaway update');
                const players = timer ? timer.getRunawayLocationsUpdate() : undefined;
                //console.log(players);
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

        newCoordinates.on(`reread/${code}`, () => { //gamejson in addTimer
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
                const timer = timers.get(code);
                if (timer) {
                    timer.setRunawayLocationsUpdate(geolocationmodule.findAllPlayersWithTask(gamejson.players, 'runaway'));
                    players = timer.getRunawayLocationsUpdate();
                } else {
                    players = gamejson.players;
                };
            };
            res.write("data: " + `${JSON.stringify({players, update})}\n\n`);
        });
        newCoordinates.on(`tryready/${code}`, () => {
            res.write("data: " + `${JSON.stringify('ready')}\n\n`);
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
                const timer = timers.get(code);
                res.write("data: " + `${JSON.stringify({players: timer.runawayLocationsUpdate, update: true})}\n\n`);
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
            const timer = timers.get(code);
            res.write("data: " + `${JSON.stringify({players: timer.runawayLocationsUpdate, update: true})}\n\n`);
        });
        play.on(`disqualified/${code}`, (username) => {
            res.write("data: " + `${JSON.stringify({exit: {username, message: ' was disqualified.'}})}\n\n`);
            const timer = timers.get(code);
            res.write("data: " + `${JSON.stringify({players: timer.runawayLocationsUpdate, update: true})}\n\n`);
        });
        play.on(`gameOver/${code}`, (message) => {
            console.log(message);
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

    app.get('/home_header.js', (req, res) => {
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
            geolocationmodule.checkRunawayNumber(code, timers, play);
            geolocationmodule.deleteRunawayUpdate(timers, code, id);
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

    app.get('/wait.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(waitcss);
    })

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

    app.get('/set_area.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(setAreacss);
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

    app.get('/set_tasks.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(setTaskscss);
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

    app.get('/set_time.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(setTimecss);
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

    app.get('/task_instructions.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(taskInstructionscss);
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

    app.get('/check_geolocation.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(checkGeolocationcss);
    });

    app.get('/header_play.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(headerPlaycss);
    });

//request on play
    app.get('/play/:code', (req, res) => {
        res.end(playhtml);
    });

    app.get('/play.js', (req, res) => {
        res.end(playjs);
    });

    app.get('/play.css', (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.end(playcss);
    });

    app.post('/send_coordinates/:code', (req, res) => {
        const code = req.params.code;
        const id = Number(req.query.id);
        const place = req.query.place;
        const coordinates = req.body.coordinates;
        const update = place === 'check_geolocation';
        newCoordinates.emit(`new_coordinates/${code}`, coordinates, id, update)
        res.end();
    });

    app.get('/display_map/:code', (req, res) => {
        const code = req.params.code;
        if (fs.existsSync(`./current_games/${code}`)) {
            const gamejson = findmodule.readFile(code);
            res.end(JSON.stringify(gamejson));
        } else {
            res.status(500); //404
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
            const countSeconds = setInterval(() => {
                countSec ++;
                play.emit(`countTime/${code}`, countSec);
            }, 1000);
            const runawayUpdate = setInterval(() => {
                countUpdates ++;
                //console.log('actual update');
                newCoordinates.emit(`new_coordinates/${code}`, undefined, undefined, countUpdates * 90000);
            }, 90000);
            let waitToDelete;
            const gameOver = setTimeout(() => {
                play.emit(`gameOver/${code}`, 'Time is up. Runaways won!');
                /*waitToDelete = setTimeout(() => {
                    findmodule.deleteFile(code);
                    timers.delete(code);
                    console.log(timers);
                }, 30000);*/
                //console.log(countSeconds)
                const testIntervalClone = testInterval;
                clearInterval(testIntervalClone);
                geolocationmodule.clearTimer(code, timers);
            }, gamejson.time);

            //wait seeker time
            const seekersReady = setTimeout(() => {
                play.emit(`seekersReady/${code}`);
            }, gamejson.time/12);
            const timer = new Timer(code, countSeconds, runawayUpdate, gameOver, waitToDelete, seekersReady, []);
            //const timer = new addTimer (1, 2, 3, 4, 5, 6);
            const hello = {hello1: 1, hello: 2};
            //console.log(timer.code);
            //timers.push('hello2');
            //timers.push(hello);
            timers.set(code, timer);
            //timers.push('hello');
            //console.log(timers[1]);
            //console.log(timers[0].code);
            //console.log(timers[0].countSeconds);
            gamejson.gameRunning = true;
            findmodule.writeFile(code, gamejson);
            newCoordinates.emit(`reread/${code}`);
            //console.log('set Intervals and Timeouts');

            let count = 0;
            const testInterval = setInterval(() => {
                const timer = timers.get(code);
                if (timer) {
                    console.log(count);
                    timer.getRunawayLocationsUpdate().forEach((player) => {
                        console.log(player.coordinates);
                    });
                };
                count ++;
            }, 1000);
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

        geolocationmodule.deleteRunawayUpdate(timers, code, id);

        play.emit(`lost_game/${code}`, username);
        geolocationmodule.checkRunawayNumber(code, timers, play);
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

        geolocationmodule.deleteRunawayUpdate(timers, code, id);

        play.emit(`disqualified/${code}`, username);
        geolocationmodule.checkRunawayNumber(code, timers, play);
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


mime type error join
static files
*/