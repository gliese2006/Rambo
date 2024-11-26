const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
function link (div, url) {
    document.querySelectorAll(div).forEach((element) => {
        element.addEventListener('click', () => {
            hideDropdown();
            window.location.href = url;
        });
    });
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
                htmlplayers += '<p class="player"> You </p>'
            } else {
                htmlplayers += '<p class="player">' + player.username + '</p>';
            };
    });
    displayPlayers();
};


//sse
sse.onmessage = function (response) {
    const res = JSON.parse(response.data);
    //console.log(res.exit);
    if (res.exit) {
        alert(`${res.exit} exited the game.`);
    } else if (res == 'wait' && id > 0) {
        window.location.replace(`/wait/${code[1]}${window.location.search}`)
    } else if (!res) {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        setTimeout(() => {
            window.location.replace('/');
        }, 2000);
    } else {
        addPlayer(res);
    }
};


//buttons
if (Number(id)) {
    dom('.buttons').innerHTML = '<div class="div-exit"><p>Exit</p></div>';
    dom('.div-exit').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            sse.close();
            xhr.open('GET', `/exit${window.location.pathname}${window.location.search}`);
            xhr.send();
            window.location.replace('/');
        };
    });
    dom('.logo').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit this game?')) {
            sse.close();
            xhr.open('GET', `/exit${window.location.pathname}${window.location.search}`);
            xhr.send();
            window.location.replace('/');
        };
    });

} else if (Number(id) === 0) {
    dom('.buttons').innerHTML = '<div class="div-cancel"><p>Cancel</p></div> <div class="div-start"><p>Start</p></div>';
    
    //cancel game
    dom('.div-cancel').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel${window.location.pathname}`);
            xhr.send();    
        };
    });
    dom('.logo').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this game?')) {
            xhr.open('GET', `/cancel${window.location.pathname}`);
            xhr.send();    
        };
    });

    //start game
    dom('.div-start').addEventListener('click', () => {
        if (confirm('Are you sure you want to start this game? After starting nobody can join this game anymore.')) {
            window.location.replace(`/set_area/${code[1]}`);
        };
    });
};


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