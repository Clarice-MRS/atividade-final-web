let isMenuActive = false;

document.addEventListener("DOMContentLoaded", () => {
	setupMenu()
	console.log("hello");
});

function setupMenu() {
	const menuButton = document.getElementById("menuButton");
	const menu = document.getElementById("menu");

	menuButton.addEventListener("click", () => {
		if (!isMenuActive) {
			menuButton.classList.add("active");
			menu.style.display = "block";
		} else {
			menuButton.classList.remove("active");
			menu.style.display = "none";
		}

		isMenuActive = !isMenuActive
	})
}
