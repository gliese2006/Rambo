const express = require('express');
//const cors = require('cors');
const fs = require('fs');
const EventEmitter = require('events');
const newPlayerEmitter = new EventEmitter();
const waitingForHost = new EventEmitter();
const newCoordinates = new EventEmitter();
const play = new EventEmitter();
const app = express();
app.use(express.json());
//app.use(cors({origin: ['http://localhost:8000', 'http://127.0.0.1:8000']}));


//files
const homehtml = fs.readFileSync('./HTML/home.html');

const instructionshtml = fs.readFileSync('./HTML/instructions.html')

const newhtml = fs.readFileSync('./HTML/new.html');
const newjs = fs.readFileSync('./Scripts/new.js');

const joinhtml = fs.readFileSync('./HTML/join.html');
const joinjs = fs.readFileSync('./Scripts/join.js');

const lobbyhtml = fs.readFileSync('./HTML/lobby.html');
const lobbyjs = fs.readFileSync('./Scripts/lobby.js');

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
const testjs = fs.readFileSync('./Scripts/test.mjs');
const playcustomized = fs.readFileSync('./Scripts/Scripts_modules/play_customized.js');

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
        let gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
        if (gamejson.readyForInstructions) {
            const task = findmodule.findTask(code, id);
            res.write("data: " + `${JSON.stringify(`http://localhost:8000/${task}_instructions/${code}?id=${id}`)}\n\n`); 
        };
        waitingForHost.on(`ready_for_instructions/${code}`, () => {
            const task = findmodule.findTask(code, id);
            res.write("data: " + `${JSON.stringify(`http://localhost:8000/${task}_instructions/${code}?id=${id}`)}\n\n`);
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
        let countIntervals = 0;
        let gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
        newCoordinates.on(`reread/${code}`, () => {
            gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
        });
        let readyList = [];
        res.setHeader('Content-type', 'text/event-stream');
        newCoordinates.on(`new_coordinates/${code}`, (coordinates, id, runawayUpdate) => {
            let response;
            if (req.query.task === 'runaway') {
                response = geolocationmodule.saveCoordinates(gamejson, id, coordinates);
            } else if (req.query.task === 'seeker') {
                if (runawayUpdate) {
                    response = geolocationmodule.saveCoordinates(gamejson, id, coordinates);
                } else {
                    response = geolocationmodule.findSeekers(geolocationmodule.saveCoordinates(gamejson, id, coordinates));
                }
            };
            res.write("data: " + `${JSON.stringify(response)}\n\n`);
        });
        newCoordinates.on(`ready/${code}`, (id) => {
            if (id) {
                readyList = geolocationmodule.setReady(readyList, id);
            };
            /*console.log(readyList);
            console.log(`ready ${readyList.length} ${req.query.id}`);
            console.log(`gamejson ${gamejson.players.length} ${req.query.id}`);*/
            if (readyList.length === gamejson.players.length) {
                console.log(req.query.id);
                res.write("data: " + `${JSON.stringify('ready')}\n\n`);
            };
        });
        newCoordinates.on(`canceled_game/${code}`, () => {
            res.write("data: " + `${JSON.stringify('canceled')}\n\n`);
            res.end();
        });
        newCoordinates.on(`exited_game/${code}`, (username, id) => {
            if (req.query.id !== id) {
                //res.write("data: " + `${JSON.stringify({exit: username})}\n\n`);
            };
        });
        play.on(`timeUpdate/${code}`, () => {
            countIntervals ++;
            res.write("data: " + `${JSON.stringify({timeUpdate: countIntervals*300000})}\n\n`);
        });
        play.on(`gameOver/${code}`, () => {
            res.write("data: " + `${JSON.stringify({gameover: 'Time is up.'})}\n\n`);
            res.end();
        });
    });





//OUTSIDE
//requests on home
    app.get('/', (req, res) => {
        res.end(homehtml);
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

    app.post('/create_new_game', (req, res) => {
        const username = req.body.username;
        const code = newmodule.createCode();
        newmodule.createNewGame(code, username)
        res.write(JSON.stringify(`http://localhost:8000/lobby/${code}?id=0`));
        res.end();
    });

//request on join
    app.get('/join', (req, res) => {
        res.end(joinhtml)
    });
    
    app.get('/join.js', (req, res) => {
        res.end(joinjs);
    });

    app.post('/add_new_player', (req, res) => {
        const code = req.body.code;
        const username = req.body.username;
        const responseNewPlayer = joinmodule.addNewPlayer(code, username);
        if (responseNewPlayer.check) {
            newPlayerEmitter.emit(`newPlayer/${code}`);
            //console.log(`newPlayer/${code}`)
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
    res.end();
    findmodule.findCurrentPlayer(code, id, (i, gamejson) => {
        username = gamejson.players[i].username;
        gamejson.players.splice(i, 1);
    });
    
    if (place === 'check_geolocation') {
        newCoordinates.emit(`exited_game/${code}`, username, id);
        newCoordinates.emit(`reread/${code}`);
        newCoordinates.emit(`new_coordinates/${code}`);
        newCoordinates.emit(`ready/${code}`);
    }
});

app.get('/cancel/:code', (req, res) => {
    const code = req.params.code;
    const place = req.query.place;
    fs.unlinkSync(`./current_games/${code}`);
    if (place === 'wait') {
        waitingForHost.emit(`canceled_game/${code}`);
    } else if (place === 'check_geolocation') {
        newCoordinates.emit(`canceled_game/${code}`);
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
        res.end(JSON.stringify(`http://localhost:8000/set_tasks/${code}`));
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
        const gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
        gamejson.readyForInstructions = true;
        fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
        waitingForHost.emit(`ready_for_instructions/${code}`);
        res.end(JSON.stringify(`http://localhost:8000/${task}_instructions/${code}?id=0`));
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

    app.get('/test.mjs', (req, res) => {
        res.end(testjs);
    });

    app.post('/send_coordinates/:code', (req, res) => {
        const code = req.params.code;
        const id = Number(req.query.id);
        const coordinates = req.body.coordinates;
        newCoordinates.emit(`new_coordinates/${code}`, coordinates, id, false);
        res.end();
    });

    app.get('/display_map/:code', (req, res) => {
        const code = req.params.code;
        console.log(code);
        res.end(JSON.stringify(JSON.parse(fs.readFileSync(`./current_games/${code}`))));
    });

    app.get('/start/:code', (req, res) => {
        const code = req.params.code;
        let gamejson = JSON.parse(fs.readFileSync(`./current_games/${code}`));
        if (!gamejson.checkPlay) {
            const updateInterval = setInterval(() => {
                play.emit(`updateTime/${code}`);
            }, 300000);
            const runawayUpdate = setInterval(() => {
                newCoordinates.emit(`new_coordinates/${code}`, undefined, undefined, true);
            }, 90000);
            setTimeout(() => {
                play.emit(`gameover/${code}`);
                clearInterval(updateInterval);
                clearInterval(runawayUpdate);
            }, gamejson.time);
            gamejson.checkPlay = true;
            fs.writeFileSync(`./current_games/${code}`, JSON.stringify(gamejson));
        }; 
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