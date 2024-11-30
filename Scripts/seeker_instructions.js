function dom (c) {
    return document.querySelector(c);
};
//const code = window.location.pathname.split('/seeker_instructions/')[1];


//send ready
dom('.button-1').addEventListener('click', () => {
    window.location.href = `/check_geolocation/${window.location.pathname.split('/seeker_instructions/')[1]}${window.location.search}&task=seeker`;
    }
);

localStorage.clear();