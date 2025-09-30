const appState = {
	copyrightDate: document.querySelector(".footer__copyrightDate"),
	navbar: document.querySelector(".nav"),
	navLogo: document.querySelector(".nav__logo"),
	hamburger: document.querySelector(".nav__hamburger"),
	navList: document.querySelector(".nav__list"),
	navItems: document.querySelectorAll(".nav__item"),
	hamburgerBars: document.querySelectorAll(".hamburgerBar"),
	isHamburgerBtnClicked: false, // to check if the hamburger button is clicked
	isNavItemsClickable: false, // to check if the nav items are clickable
	isNavbarTransparent: false, // to check if navbar is transparent
	hamburgerBtnStatus: true, // to check if the hamburger button is in open state
	stopMenuAttach: false, // to check if the menu is attached to the screen or not
};
export { appState };
