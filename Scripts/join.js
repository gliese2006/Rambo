const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

function submit () {
    dom('.display-response').innerHTML = '';

    const code = dom('.input-code').value;
    const username = dom('.input-username').value;
    //console.log(username);

    if (username) {
        xhr.open('POST', '/add_new_Player', false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({code, username});
        xhr.send(data);
        const response = JSON.parse(xhr.response);
        if (response.check) {
            //console.log(response.response);
            window.location.replace(response.response);
        } else {
        dom('.display-response').innerHTML = response.response;
        };
    } else {
        dom('.display-response').innerHTML = 'Please enter a username.';
    };
};

//send user input to server
dom('.button-1').addEventListener('click', () => {
    submit();
});

dom('.input-code').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        dom('.input-username').focus();
    } else if (event.key === 'e') {
        event.preventDefault();
    }
});

dom('.input-username').addEventListener('keydown', (event) => {
    //console.log(event);
    if (event.key === 'Enter') {
        submit();
    } else if (dom('.input-username').value.length > 20) {
        event.preventDefault();
    };
});

//space
dom('body').addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});