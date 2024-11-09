const xhr = new XMLHttpRequest();
function dom (c) {
    return document.querySelector(c);
};

//send user input to server
dom('.button-submit').addEventListener('click', () => {
    const username = dom('.input-username').value;
    dom('.input-username').value = '';
    
    xhr.open('POST', '/create_new_game', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    const data = JSON.stringify({username});
    xhr.send(data);
    console.log(JSON.parse(xhr.response));
    window.location.replace(JSON.parse(xhr.response));
});