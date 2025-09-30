import { appState } from "./modules/appVariables.js";
import { hideNavbarBgAndNavbarLogo, openMenuBg, closeMenuBg, checkScreenAndAttach, showNavbarBgAndNavbarLogo } from "./modules/navbarFunctions.js";
////////////////////////////////////////////////////////////////////////
// navbar logic to show and hide the navbar background and logo
////////////////////////////////////////////////////////////////////////
// navbar background and logo logic to show and hide when the page is loaded
window.addEventListener("DOMContentLoaded", () => {
	if (window.scrollY === 0) {
		hideNavbarBgAndNavbarLogo();
		appState.navbar.style.opacity = "1";
	} else if (window.scrollY > 0) {
		appState.navbar.style.opacity = "1";
	}
});
// navbar background and logo logic to show and hide when the page is scrolled
window.addEventListener("scroll", () => {
	if (window.scrollY > 0 && !appState.isNavbarTransparent && !appState.navList.classList.contains("nav__list--open")) {
		appState.navbar.style.opacity = "0";
		if (appState.isNavbarTransparent === false) {
			appState.isNavbarTransparent = true;
		}
		setTimeout(() => {
			showNavbarBgAndNavbarLogo();
			appState.navbar.style.opacity = "1";
		}, 400);
	} else if (window.scrollY === 0 && !appState.navList.classList.contains("nav__list--open")) {
		appState.navbar.style.opacity = "0";
		if (appState.isNavbarTransparent === true) {
			appState.isNavbarTransparent = false;
		}
		setTimeout(() => {
			appState.navbar.style.opacity = "1";
			hideNavbarBgAndNavbarLogo();
		}, 400);
	} else if (window.scrollY === 0 && appState.isNavbarTransparent && appState.navList.classList.contains("nav__list--open") && window.innerWidth >= 750) {
		appState.navbar.style.opacity = "0";
		if (appState.isNavbarTransparent === true) {
			appState.isNavbarTransparent = false;
		}
		setTimeout(() => {
			appState.navbar.style.opacity = "1";
			hideNavbarBgAndNavbarLogo();
		}, 400);
	} else if (window.scrollY > 0 && !appState.isNavbarTransparent && appState.navList.classList.contains("nav__list--open") && window.innerWidth >= 750) {
		appState.navbar.style.opacity = "0";
		if (appState.isNavbarTransparent === false) {
			appState.isNavbarTransparent = true;
		}
		setTimeout(() => {
			showNavbarBgAndNavbarLogo();
			appState.navbar.style.opacity = "1";
		}, 400);
	}
});
////////////////////////////////////////////////////////////////////////
/// navbar logic to open and close the menu when clicked
////////////////////////////////////////////////////////////////////////
// hamburger logic to open and close the menu when clicked
appState.hamburger.addEventListener("click", () => {
	if (appState.isHamburgerBtnClicked) {
		return;
	}
	appState.isHamburgerBtnClicked = true;
	if (appState.hamburgerBtnStatus) {
		showNavbarBgAndNavbarLogo();
		openMenuBg();
	} else {
		if (window.scrollY === 0) {
			setTimeout(() => {
				hideNavbarBgAndNavbarLogo();
			}, 1100);
		}
		appState.isNavItemsClickable = !appState.isNavItemsClickable;
		closeMenuBg();
	}
});
// navlink logic to close the menu when clicked
for (let navLink of appState.navItems) {
	navLink.addEventListener("click", () => {
		if (window.innerWidth < 750 && appState.isNavItemsClickable) {
			appState.isNavItemsClickable = !appState.isNavItemsClickable;
			appState.isHamburgerBtnClicked = true;
			closeMenuBg();
			setTimeout(() => {
				if (window.scrollY === 0) {
					if (appState.isNavbarTransparent === true) {
						appState.isNavbarTransparent = false;
					}
					hideNavbarBgAndNavbarLogo();
					appState.navbar.style.opacity = "1";
				}
			}, 1000);
		}
	});
}
// To check the screen size and attach the menu if needed
checkScreenAndAttach();
// To check the screen size and attach the menu if needed on resize
window.addEventListener("resize", () => {
	checkScreenAndAttach();
});
////////////////////////////////////////////////////////////////////////
/// copyright date logic
////////////////////////////////////////////////////////////////////////
const currentYear = new Date().getFullYear();
appState.copyrightDate.innerHTML = currentYear;
