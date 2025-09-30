import { appState } from "./appVariables.js";
// toggles hamburger icon
function toggleHamburgerIcon() {
	appState.hamburger.classList.toggle("nav__hamburger--active");
}
// show menu items with animation
function showMenuItems() {
	setTimeout(() => {
		let delayIndex = 0;
		let counter = 0;
		for (let item of appState.navItems) {
			item.style.transition = `opacity ${2 + delayIndex}s, transform ${2 - delayIndex}s`;
			item.style.transitionDelay = `${delayIndex}s`;
			item.style.opacity = "1";
			item.style.transform = "translateY(0)";
			delayIndex += 0.3;
			counter++;
			if (counter === appState.navItems.length) {
				console.log("counter: ", counter);
				console.log("appState.navItems.length: ", appState.navItems.length);
				setTimeout(() => {
					appState.isNavItemsClickable = !appState.isNavItemsClickable;
				}, 2200);
			}
		}
	}, 300);
}
// hide menu items with animation
function hideMenuItems() {
	let delayIndex = 0;
	for (let item of [...appState.navItems].reverse()) {
		item.style.transitionDelay = `${delayIndex}s`;
		item.style.opacity = "0";
		item.style.transform = "translateY(20rem)";
		item.style.transition = `transform ${0 + delayIndex}s, opacity ${-0.3 + delayIndex}s`;
		delayIndex += 0.3;
	}
}
// hide navbar background and navbar logo
function hideNavbarBgAndNavbarLogo() {
	appState.navbar.style.background = "none";
	appState.navbar.style.borderBottom = "none";
	appState.navbar.style.boxShadow = "none";
	appState.navLogo.style.display = "none";
}
// show navbar background and navbar logo
function showNavbarBgAndNavbarLogo() {
	appState.navbar.style.background = "#333333";
	// appState.navbar.style.background = "linear-gradient(to bottom, rgba(0, 48, 73, 0.85), rgba(0, 48, 73, 1))";
	appState.navbar.style.borderBottom = "1px solid rgba(240, 240, 240, 0.65)";
	appState.navbar.style.boxShadow = "0px 8px 12px 8px rgba(41, 40, 40, 0.85)";
	appState.navLogo.style.display = "block";
}
// show navlist in row display when window.innerwidth > 750
function showNavListInRow() {
	appState.navList.style.display = "flex";
	appState.navList.style.transform = "scaleY(1)";
	appState.navList.style.transition = "none";
	appState.navList.style.opacity = "1";
	appState.navList.style.visibility = "visible";
}
// animate navlist items when window resized
function loopItemsAndAnimate() {
	for (let item of appState.navItems) {
		item.style.opacity = "1";
		item.style.transform = "translateY(0)";
		item.style.transition = "none";
	}
}
// open menu background
function openMenuBg() {
	appState.hamburgerBtnStatus = !appState.hamburgerBtnStatus;
	appState.navList.classList.add("nav__list--open");
	setTimeout(() => {
		toggleHamburgerIcon();
		appState.navList.style.transition = `visibility 0s, opacity .8s, transform .8s`;
		appState.navList.style.visibility = "visible";
		appState.navList.style.opacity = "1";
		appState.navList.style.transform = "scaleY(1)";
		appState.navList.style.transformOrigin = "top";
		appState.hamburgerBars[0].style.backgroundColor = "rgba(200, 200, 200, 1)";
		appState.hamburgerBars[2].style.backgroundColor = "rgba(200, 200, 200, 1)";
		showMenuItems();
	}, 50);
	setTimeout(() => {
		appState.isHamburgerBtnClicked = !appState.isHamburgerBtnClicked;
		appState.hamburgerBars[0].style.backgroundColor = "rgb(255, 255, 255)";
		appState.hamburgerBars[2].style.backgroundColor = "rgb(255, 255, 255)";
	}, 2200);
}
// close menu background
function closeMenuBg() {
	appState.hamburgerBtnStatus = !appState.hamburgerBtnStatus;
	appState.navList.style.transition = `visibility 0s, opacity .8s, transform .8s`;
	appState.hamburgerBars[0].style.backgroundColor = "rgb(242, 242, 242, .45)";
	appState.hamburgerBars[1].style.backgroundColor = "rgb(242, 242, 242, .45)";
	appState.hamburgerBars[2].style.backgroundColor = "rgb(242, 242, 242, .45)";
	toggleHamburgerIcon();
	hideMenuItems();
	setTimeout(() => {
		appState.navList.style.opacity = "0";
		appState.navList.style.transform = "scaleY(0)";
	}, 400);
	setTimeout(() => {
		appState.navList.style.visibility = "hidden";
	}, 1250);
	setTimeout(() => {
		appState.navList.classList.remove("nav__list--open");
		appState.isHamburgerBtnClicked = !appState.isHamburgerBtnClicked;
		appState.hamburgerBars[0].style.backgroundColor = "rgb(242, 242, 242)";
		appState.hamburgerBars[1].style.backgroundColor = "rgb(242, 242, 242)";
		appState.hamburgerBars[2].style.backgroundColor = "rgb(242, 242, 242)";
	}, 1270);
}
// check screen size and attach menu if needed
function checkScreenAndAttach() {
	if (window.innerWidth >= 750 && window.scrollY > 0) {
		appState.stopMenuAttach = true;
		showNavListInRow();
		showNavbarBgAndNavbarLogo();
		loopItemsAndAnimate();
		if (appState.isNavbarTransparent === false) {
			appState.isNavbarTransparent = true;
		}
	} else if (window.innerWidth >= 750 && window.scrollY === 0) {
		appState.stopMenuAttach = true;
		showNavListInRow();
		hideNavbarBgAndNavbarLogo();
		loopItemsAndAnimate();
	} else if (appState.navList.style.display === "flex" && !appState.hamburger.classList.contains("nav__hamburger--active") && window.innerWidth < 750 && appState.stopMenuAttach === true) {
		appState.stopMenuAttach = false;
		showNavbarBgAndNavbarLogo();
		appState.isHamburgerBtnClicked = true;
		openMenuBg();
	} else if (window.innerWidth < 750 && appState.stopMenuAttach === true && appState.hamburger.classList.contains("nav__hamburger--active") && appState.navList.style.display === "flex") {
		appState.stopMenuAttach = false;
		showNavbarBgAndNavbarLogo();
	} else if (window.innerWidth < 750) {
		appState.stopMenuAttach = false;
	}
}
export { hideNavbarBgAndNavbarLogo, showNavbarBgAndNavbarLogo, openMenuBg, closeMenuBg, checkScreenAndAttach };
