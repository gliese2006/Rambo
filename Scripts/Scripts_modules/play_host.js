export function selectNewHost (gamejson) {
    let playershtml = '<label>Select the new host:</label> <select id="new-host"> <option> </option>';
    gamejson.players.forEach((player) => {
        playershtml += `<option value="${player.username}">${player.username}</option>`;
    });
    return playershtml +'</select>';
};

export function confirmExit (code, username, exitid, xhr) {
    if (confirm(`${username} wants to exit the game. Please confirm!`)) {
        xhr.open('GET', `/confirm/exit/${code}?id=${exitid}answer=confirmed`);
        xhr.send();
    } else {
        xhr.open('GET', `/confirm/exit/${code}?${exitid}answer=denied`);
        xhr.send();
    }
};

export function confirmCancel (code, id, xhr) {
    if (confirm('The host wants to cancel this game. Please confirm or cancel, if you disagree.')) {
        xhr.open('GET', `/confirm/cancel/${code}?id=${id}&answer=confirmed`);
        xhr.send();
    } else {
        xhr.open('GET', `/confirm/cancel/${code}?id=${id}&answer=denied`);
        xhr.send();
    }
}