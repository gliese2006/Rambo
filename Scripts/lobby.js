const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
const search = new URLSearchParams(window.location.search);
const id = Number(search.get('id'));
const code = window.location.pathname.split('/lobby/');
dom('.display-code').innerHTML = code[1];
let userIndex;
let response;
let htmlplayers;
const sse = new EventSource(`/display_players${window.location.pathname.split('/lobby')[1]}`);


//PROMISE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//display players
function displayPlayers () {
    dom('.display-players').innerHTML = htmlplayers;
};

function addPlayer (players) {
    htmlplayers = '';
    players.forEach((player) => {
            if (player.id === id) {
                htmlplayers += '<p> You </p>'
            } else {
                htmlplayers += '<p>' + player.username + '</p>';
            };
    });
    displayPlayers();
};


//sse
sse.onmessage = function (response) {
    const res = JSON.parse(response.data);
    console.log(res.exit);
    if (res.exit) {
        alert(`${res.exit} exited the game.`);
    } else if (res == 'wait' && id > 0) {
        window.location.replace(`http://localhost:8000/wait/${code[1]}${window.location.search}`)
    } else if (!res) {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    } else {
        addPlayer(res);
    }
};


//buttons
if (Number(id)) {
    dom('.buttons').innerHTML = '<button class="button-exit-game">Exit</button>';
    dom('.button-exit-game').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            sse.close();
            xhr.open('GET', `/exit${window.location.pathname}${window.location.search}`);
            xhr.send();
            window.location.replace('http://localhost:8000/');
        };
    });
} else if (Number(id) === 0) {
    dom('.buttons').innerHTML = '<button class="button-cancel-game">Cancel</button> <button class="button-start-game">Start</button>';
    
    //cancel game
    dom('.button-cancel-game').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel${window.location.pathname}`);
            xhr.send();    
        };
    });

    //start game
    dom('.button-start-game').addEventListener('click', () => {
        if (confirm('Are you sure you want to start this game? After starting nobody can join this game anymore.')) {
            window.location.replace(`http://localhost:8000/set_area/${code[1]}`);
        };
    });
};