function dom (c) {
    return document.querySelector(c);
};
//const code = window.location.pathname.split('/seeker_instructions/')[1];


//send ready
dom('.button-next').addEventListener('click', () => {
    window.location.replace(`http://localhost:8000/check_geolocation/${window.location.pathname.split('/seeker_instructions/')[1]}${window.location.search}&task=seeker`);
    }
);

localStorage.clear();