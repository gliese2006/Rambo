function dom (c) {
    return document.querySelector(c);
};
function link (div, url) {
    document.querySelectorAll(div).forEach((element) => {
        element.addEventListener('click', () => {
            hideDropdown();
            window.location.href = url;
        });
    });
};

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

//links
link('.logo', '/');
link('.link-new', '/new');
link('.link-join', '/join');
link('.link-instructions', '/instructions');