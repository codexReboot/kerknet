// loginValidation.js
export function initLoginValidation() {
	const form = document.getElementById("loginForm");
	if (!form) return;

	// -------------------- Client-side validation --------------------
	form.addEventListener("submit", (e) => {
		const username = form.username.value.trim();
		const password = form.password.value.trim();
		let errors = [];

		if (username.length < 3) errors.push("Gebruikersnaam moet minstens 3 karakters hê.");
		if (password.length < 6) errors.push("Wagwoord moet minstens 6 karakters hê.");

		if (errors.length > 0) {
			e.preventDefault();
			displayErrors(errors);
			shakeFields([form.username, form.password]);
		}
	});

	// -------------------- Backend error handling --------------------
	const serverError = document.getElementById("serverError");
	if (serverError) {
		shakeFields([form.username, form.password]);
		displayErrors([serverError.textContent]);
	}
}

function displayErrors(errors) {
	let errorContainer = document.getElementById("loginErrors");
	if (!errorContainer) {
		errorContainer = document.createElement("div");
		errorContainer.id = "loginErrors";
		errorContainer.className = "error-message";
		const formCard = document.querySelector(".login-page__login-card");
		formCard.insertBefore(errorContainer, formCard.querySelector("form"));
	}
	errorContainer.innerHTML = errors.join("<br>");
}

function shakeFields(fields) {
	fields.forEach((field) => {
		field.classList.add("input-error", "shake");
		setTimeout(() => field.classList.remove("shake"), 500);
	});
}

// -------------------- Auto-run on page load --------------------
document.addEventListener("DOMContentLoaded", initLoginValidation);
