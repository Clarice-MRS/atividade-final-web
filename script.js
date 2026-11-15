import { Vitrine } from "./js/vitrine.js";
import { catalogo } from "./js/catalogo.js";

let isMenuActive = false;

document.addEventListener("DOMContentLoaded", () => {
	setupMenu()
	if (document.URL.includes("index.html"))
		criarVitrine();
	if (document.URL.includes("catalogo.html"))
		criarCatalogo();
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
		formulario.reset();
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
				<p>Sua inscrição foi realizada com sucesso! Em breve, você receberá em seu e-mail novidades, recomendações e informações sobre nossas leituras semanais. Prepare-se para descobrir novas histórias com a gente!</p>
			</div>
		`
		formularioNewsletter.reset();
	});
}

/* criação da vritine */

function criarVitrine(){
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

function criarCatalogo(){
    const gridCatalogo = document.querySelector(".container-catalogo");

    catalogo.forEach(livro => {
        gridCatalogo.innerHTML += `
            <div class="cardCatalogo">
                <img class="cardCatalogo__img" src="${livro.imagem}" alt="${livro.alt}">
                <div class="cardCatalogo__info">
					<h3 class="cardCatalogo__titulo">${livro.titulo}</h3>
					<p class="cardCatalogo__autor">${livro.autor}</p>
					<p class="cardCatalogo__preco"> R$ ${livro.precoAtual.toFixed(2).replace(".", ",")}</p>
				</div>
				<button class="cardCatalogo__button" type="button"><img class="cardCatalogo__buttonImg" src="img/carrinho-mais.svg"/></button>
			</div>
        `;
    });
}
