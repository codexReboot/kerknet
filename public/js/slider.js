const slides = Array.from(document.querySelectorAll("#slidesContainer .slide-section .slide"));
let currentIndex = 0;

// Show slide
function showSlide(index) {
	slides.forEach((slide, i) => {
		slide.classList.toggle("active", i === index);
	});
}

// Initialize
if (slides.length > 0) showSlide(currentIndex);

// Navigation functions
function nextSlide() {
	currentIndex = (currentIndex + 1) % slides.length;
	showSlide(currentIndex);
}

function prevSlide() {
	currentIndex = (currentIndex - 1 + slides.length) % slides.length;
	showSlide(currentIndex);
}

// Keyboard navigation (arrows)
document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowRight" || e.key === "ArrowDown") nextSlide();
	if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevSlide();
});

// Mouse UI (arrows & cursor)
const arrows = document.getElementById("navArrows");
const returnBtn = document.querySelector(".btn--returnFromSlidePreview");
let inactivityTimer;

function showUI() {
	if (arrows) arrows.classList.add("visible");
	if (returnBtn) returnBtn.classList.add("visible");
	document.body.classList.remove("hide-cursor");

	clearTimeout(inactivityTimer);
	inactivityTimer = setTimeout(hideUI, 3000);
}

function hideUI() {
	if (arrows) arrows.classList.remove("visible");
	if (returnBtn) returnBtn.classList.remove("visible");
	document.body.classList.add("hide-cursor");
}

// Show UI only on mouse movement
document.addEventListener("mousemove", showUI);

// Start hidden
hideUI();

// Arrow buttons
document.getElementById("prevBtn").addEventListener("click", prevSlide);
document.getElementById("nextBtn").addEventListener("click", nextSlide);
