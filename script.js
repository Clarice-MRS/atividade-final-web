import { Vitrine } from "./js/vitrine.js";

let isMenuActive = false;

document.addEventListener("DOMContentLoaded", () => {
	setupMenu()
	criarVitrine();
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

/* mensagem de confirmação - contato */

const formulario = document.getElementById("formulario-p-contato");
const mensagem = document.getElementById("mensagem-form");

if (formulario && mensagem) {

	formulario.addEventListener("submit", function(event) {

		event.preventDefault();

		mensagem.innerHTML = `
			<div id="mensagem-confirmacao">
				<h3>Mensagem enviada!</h3>
				<p>Agradecemos o contato! Em breve alguém da equipe retornará pelo email para respondê-lo.</p>
			</div>
		`
	});
}

/* mensagem de confirmação - newsletter*/

const formularioNewsletter = document.getElementById("form-newsletter");
const mensagemNewsletter = document.getElementById("mensagem-newsletter");

if (formularioNewsletter && mensagemNewsletter) {

	formularioNewsletter.addEventListener("submit", function(event) {

		event.preventDefault();

		mensagemNewsletter.innerHTML = `
			<div id="men-confirmacao-newsletter">
				<h3>Assinatura Confirmada!</h3>
				<p>Seja Bem - Vindo</p>
			</div>
		`
	});
}

/* criação da vritine */

function criarVitrine(){

    console.log("que que ta acontecendo");

    const gridVitrine = document.querySelector(".container-vitrine");

    Vitrine.forEach(livro => {
        gridVitrine.innerHTML += `
            <div class="cards-vitrine">
                <img src="${livro.imagem}" alt="${livro.alt}">
                <h3 class="livro-titulo">${livro.titulo}</h3>
                <span class="livro-preco-antigo"> R$ ${livro.precoAntigo.toFixed(2).replace(".", ",")}</span>
                <span class="livro-preco-atual"> R$ ${livro.precoAtual.toFixed(2).replace(".", ",")}</span>
                </div>
        `;
    });

}
