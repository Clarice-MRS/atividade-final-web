import { Vitrine } from "./vitrine.js";

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


/* vitrine */

function criarVitrine(){

    console.log("que que ta acontecendo");

    const gridVitrine = document.querySelector(".container-vitrine");

    Vitrine.forEach(livro => {
        gridVitrine.innerHTML += `
            <div class="cards-vitrine">
                <img src="${livro.imagem}" alt="${livro.alt}">
                <h3 class="livro-titulo">${livro.titulo}</h3>
                <span class="livro-preco-antigo"> ${livro.precoAntigo.toFixed(2)}</span>
                <span class="livro-preco-atual"> ${livro.precoAtual.toFixed(2)}</span>
                </div>
        `;
    });

}

criarVitrine();
