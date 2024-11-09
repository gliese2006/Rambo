const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

//send user input to server
dom('.button-submit').addEventListener('click', () => {
    dom('.display-response').innerHTML = '';

    const code = dom('.input-code').value;
    const username = dom('.input-username').value;

    xhr.open('POST', '/add_new_Player', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    const data = JSON.stringify({code, username});
    xhr.send(data);
    const response = JSON.parse(xhr.response);
    if (response.check) {
        console.log(response.response);
        window.location.replace(response.response);
    } else {
    dom('.display-response').innerHTML = response.response;
    };
});