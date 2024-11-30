const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

//submit function
function submit () {
    //console.log(dom('.input-username').value);
    const username = dom('.input-username').value;
    dom('.input-username').value = '';
    
    if (username) {
        xhr.open('POST', '/create_new_game', false);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = JSON.stringify({username});
        xhr.send(data);
        //console.log(JSON.parse(xhr.response));
        window.location.replace(JSON.parse(xhr.response));
    } else {
        dom('.display-response').innerHTML = 'Please enter a username.';
    };
};

//send user input to server
dom('.button-1').addEventListener('click', () => {
    submit();
});

//detect keydown
dom('body').addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    } else if (dom('.input-username').value.length > 20) {
        event.preventDefault();
    } else if (event.key === 'Enter') {
        submit();
    };
});