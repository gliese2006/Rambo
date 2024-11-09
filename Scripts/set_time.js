const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
const code = window.location.pathname.split('/set_time/')[1];


//send time
dom('.button-submit').addEventListener('click', () => {
    const hours = Number(dom('.input-hours').value);
    const minutes = Number(dom('.input-minutes').value);
    if (confirm(`Please confirm by clicking ok the playing time ${hours}h ${minutes}min.`)) {
        const time = hours*3600000 + minutes*60000;
        if (time > 1800000) {
            dom('.display-message').innerHTML = '';
            const data = JSON.stringify({time});
            xhr.open('POST', `/send_playing_time/${code}`, false);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(data);
            window.location.replace(JSON.parse(xhr.response));
        } else {
            dom('.input-hours').value = '';
            dom('.input-minutes').value = '';
            dom('.display-message').innerHTML = 'Please set a time bigger than 30 min.'
        };
    };
});