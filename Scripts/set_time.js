const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};
const code = window.location.pathname.split('/set_time/')[1];

function submit () {
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
};

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

//send user input to server
    dom('.button-1').addEventListener('click', () => {
        submit();
    });

    dom('.input-hours').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            dom('.input-minutes').focus();
        } else if (event.key === 'e') {
            event.preventDefault();
        };
    });

    dom('.input-minutes').addEventListener('keydown', (event) => {
        console.log(event);
        if (event.key === 'Enter') {
            submit();
        } else if (event.key === 'e') {
            event.preventDefault();
        };
    });

    //space
    dom('body').addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
        }
    });