export function getGameInfo (xhr) {
    xhr.open('GET', `/display_map/${code}`, false);
    xhr.send();
    if (xhr.status === 500) {
        document.body.innerHTML = '<p> Host canceled game! </p>'
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    };
    return JSON.parse(xhr.response);
};

export function getUsername (gamejson, id) {
    let username;
    gamejson.players.forEach((player) => {
        if (player.id === id) {
            username = player.username;
        };
    });
    return username;
};

export function waitSeeker (gamejson, task, dom, timeInterval) {
    if (task === 'seeker') {
        dom('#display-wait-seeker').showModal();
        const time = gamejson.time / 12;

        dom.innerHTML = transformTime(time);
        displayTime(time, dom, timeInterval);

        setTimeout(() => {
            dom('#display-wait-seeker').close();
            clearInterval(timeInterval);
        }, time);
    };
};

export function displayTime (time, dom, timeInterval) {
    dom.innerHTML = time;
    timeInterval = setInterval(() => {
        time --;
        dom.innerHTML = transformTime(time);
    }, 1000);
};

export function transformTime (time) {
    const h = Math.round(time/3600 - 0.5);
    const min = Math.round((time%3600)/60 - 0.5);
    const sec = Math.round((time%3600)%60 - 0.5);
    return `${h}h ${min}min ${sec}sec`;
};