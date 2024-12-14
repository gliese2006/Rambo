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
            playershtml += createHTML(player.username, player.color);
        } else {
            playershtml = `<div class="display-player" style="background-color: ${player.color}"><label>You</label><p>Seeker</p></div>`;
        }   
    });

    displayPlayers(playershtml);
};

function createHTML (playerUsername, playerColor) {
    return `<div class="display-player" style="background-color: ${playerColor}"><label>${playerUsername}</label> <select id="${playerUsername}"><option></option><option value="seeker">Seeker</option><option value="runaway">Runaway</option></select></div>`;
};

//send input
function addPlayerTask () {
    let allChecked = true;
    players.forEach((player) => {
        if (dom(`#${player.username}`) && dom(`#${player.username}`).value) {
            let task = dom(`#${player.username}`).value;
            //player.task = true;
            player.task = task;
        } else if (player.id === 0) {
            player.task = 'seeker'
        } else {
            dom('.display-message').innerHTML += `<p> You haven't selected a task for ${player.username} yet. </p>`;
            allChecked = false;
        }
    });
    return allChecked;
};


//confirm!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//send player task
dom('.button-1').addEventListener('click', () => {
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

//onclick cancel
dom('.link-1').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this game?')) {
        xhr.open ('GET', `/cancel/${code}?place=wait`, false);
        xhr.send();
        dom('body').style.height = `${screen.height}px`;
        dom('body').style.marginTop = '0px';
        dom('body').style.display = 'flex';
        dom('body').style.justifyContent = 'center';
        dom('body').style.alignItems = 'center';
        setTimeout(() => {
            window.location.replace('/');
            //console.log(window.location);
        }, 2000);
        document.body.innerHTML = '<div class="div-cancel-message"> Host canceled game! </div>';
    };
});


//general look
function hideDropdown () {
    dom('.dropdown-menu').style.display = 'none';
};
hideDropdown();

//show dropdown menu
dom('.menu').addEventListener('click', () => {
    dom('.dropdown-menu').style.display = 'grid';
});

//close dropdown menu
dom('.svg-close').addEventListener('click', () => {
    hideDropdown();
});
dom('.content').addEventListener('click', () => {
    hideDropdown();
});