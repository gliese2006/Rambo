function dom (c) {
    return document.querySelector(c);
};
const sse = new EventSource(`/waiting_for_host${window.location.pathname.split('/wait')[1]}${window.location.search}`);

sse.onmessage = function (response) {
    const res = JSON.parse(response.data);
    if (res === 'canceled') {
        document.body.innerHTML = '<p> Host canceled game! </p>';
        setTimeout(() => {
            window.location.replace('http://localhost:8000/');
        }, 2000);
    } else {
        window.location.replace(res);
    };
};