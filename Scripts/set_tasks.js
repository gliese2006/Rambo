const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
const code = window.location.pathname.split('/set_tasks/')[1];


//get players
xhr.open('GET', `/set_player_task/${code}`, false);
xhr.send();
const players = JSON.parse(xhr.response);
//console.log(players);

//create html for players
createPlayerhtml();

function displayPlayers (playershtml) {
    dom('.display-players').innerHTML = playershtml;
};

function createPlayerhtml () {
    let playershtml;
    players.forEach((player) => {
        if (playershtml) {
            playershtml += createHTML(player.username);
        } else {
            playershtml = createHTML (player.username);
        }   
    });

    displayPlayers(playershtml);
};

function createHTML (playerUsername) {
    return `<label>${playerUsername}</label> <select id="${playerUsername}"><option></option><option value="seeker">Seeker</option><option value="runaway">Runaway</option></select><br>`;
};

//send input
function addPlayerTask () {
    let allChecked = true;
    players.forEach((player) => {
        if (dom(`#${player.username}`).value) {
            let task = dom(`#${player.username}`).value;
            //player.task = true;
            player.task = task;
        } else {
            dom('.display-message').innerHTML += `<p> You haven't selected a task for ${player.username} yet. </p>`;
            allChecked = false;
        }
    });
    return allChecked;
};


//confirm!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//send player task
dom('.button-submit').addEventListener('click', () => {
    dom('.display-message').innerHTML = '';
    if (addPlayerTask()) {
        if (confirm('Please confirm by clicking ok all the player tasks.')) {
            addPlayerTask();
            //console.log(xhr.response);
            xhr.open('POST', `/send_player_task/${code}`, false);
            xhr.setRequestHeader('Content-type', 'application/json')
            const data = JSON.stringify(players);
            xhr.send(data);
            //console.log(xhr.response);
            window.location.replace(`/set_time/${code}`);
        };
    };
});