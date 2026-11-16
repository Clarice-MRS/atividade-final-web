import { Vitrine } from "./js/vitrine.js";
import { catalogo } from "./js/catalogo.js";
import { ShoppingCart } from "./js/ShoppingCart.js";

const carrinho = new ShoppingCart(catalogo);
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

let toastTimeout;
let elementoComFocoAntesDoCarrinho = null;
let elementoComFocoAntesDoModal = null;

document.addEventListener("DOMContentLoaded", iniciarAplicacao);

function iniciarAplicacao() {
    setupMenu();
    setupCarrinho();
    setupModalLivro();
    setupGridProdutos();
    setupBusca();
    setupForms();
    atualizarUICarrinho();
}

function setupMenu() {
    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");
    if (!menuButton || !menu) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "menu");
    menuButton.setAttribute("aria-label", "Abrir menu");

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.classList.toggle("active");
        menu.hidden = !isOpen;
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });
}

/* -------------------------------------------------------------------------- */
/* Carrinho                                                                   */
/* -------------------------------------------------------------------------- */

function setupCarrinho() {
    const cartButton = document.getElementById("toggle-carrinho");
    if (!cartButton) return;

    let badge = cartButton.querySelector(".carrinho-count");
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "carrinho-count";
        badge.setAttribute("aria-live", "polite");
        cartButton.append(badge);
    }

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "cart-overlay";
    overlay.setAttribute("aria-label", "Fechar carrinho");

    const drawer = document.createElement("aside");
    drawer.id = "cart-drawer";
    drawer.className = "cart-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "cart-title");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    drawer.innerHTML = `
        <div class="cart-drawer__header">
            <div>
                <p class="cart-drawer__eyebrow">CELULOSE³</p>
                <h2 id="cart-title">Seu carrinho</h2>
            </div>
            <div class="cart-drawer__header-actions">
                <button class="cart-clear" id="cart-clear" type="button">Limpar</button>
                <button class="cart-close" id="cart-close" type="button" aria-label="Fechar carrinho">&times;</button>
            </div>
        </div>
        <div class="cart-drawer__items" id="cart-items" aria-live="polite"></div>
        <div class="cart-drawer__footer">
            <div class="cart-summary__line">
                <span>Subtotal</span>
                <strong id="cart-subtotal">R$ 0,00</strong>
            </div>
            <div class="cart-summary__line cart-summary__total">
                <span>Total</span>
                <strong id="cart-total">R$ 0,00</strong>
            </div>
            <p class="cart-summary__note">Frete e condições de entrega serão combinados após a compra.</p>
            <button class="cart-continue" id="cart-continue" type="button">Continuar comprando</button>
        </div>
    `;

    const toast = document.createElement("div");
    toast.id = "shopping-toast";
    toast.className = "shopping-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    document.body.append(overlay, drawer, toast);

    cartButton.setAttribute("aria-controls", drawer.id);
    cartButton.setAttribute("aria-expanded", "false");
    cartButton.addEventListener("click", abrirCarrinho);
    overlay.addEventListener("click", fecharCarrinho);
    drawer.querySelector("#cart-close").addEventListener("click", fecharCarrinho);
    drawer.querySelector("#cart-continue").addEventListener("click", fecharCarrinho);
    drawer.querySelector("#cart-clear").addEventListener("click", () => {
        carrinho.clear();
        atualizarUICarrinho();
        mostrarToast("Carrinho limpo.");
    });

    drawer.addEventListener("click", (event) => {
        const control = event.target.closest("[data-cart-action]");
        if (!control) return;

        const id = control.dataset.bookId;
        switch (control.dataset.cartAction) {
            case "increase":
                carrinho.increase(id);
                break;
            case "decrease":
                carrinho.decrease(id);
                break;
            case "remove":
                carrinho.removeItem(id);
                break;
            default:
                return;
        }
        atualizarUICarrinho();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && drawer.classList.contains("is-open")) {
            fecharCarrinho();
        }
    });

    function abrirCarrinho() {
        elementoComFocoAntesDoCarrinho = document.activeElement;
        drawer.inert = false;
        drawer.setAttribute("aria-hidden", "false");
        drawer.classList.add("is-open");
        overlay.classList.add("is-visible");
        document.body.classList.add("has-open-overlay");
        cartButton.setAttribute("aria-expanded", "true");
        drawer.querySelector("#cart-close").focus();
    }

    function fecharCarrinho() {
        drawer.classList.remove("is-open");
        overlay.classList.remove("is-visible");
        drawer.setAttribute("aria-hidden", "true");
        drawer.inert = true;
        document.body.classList.remove("has-open-overlay");
        cartButton.setAttribute("aria-expanded", "false");
        if (elementoComFocoAntesDoCarrinho instanceof HTMLElement) {
            elementoComFocoAntesDoCarrinho.focus();
        }
    }
}

function atualizarUICarrinho() {
    const cartButton = document.getElementById("toggle-carrinho");
    const drawer = document.getElementById("cart-drawer");
    if (!cartButton || !drawer) return;

    const count = carrinho.getCount();
    const badge = cartButton.querySelector(".carrinho-count");
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count === 0;
    cartButton.setAttribute(
        "aria-label",
        count === 0 ? "Abrir carrinho, vazio" : `Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`
    );

    const itemsContainer = drawer.querySelector("#cart-items");
    const items = carrinho.getItems();

    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty__icon" aria-hidden="true">♡</span>
                <h3>Seu carrinho está vazio</h3>
                <p>Encontre sua próxima leitura e adicione-a aqui.</p>
            </div>
        `;
    } else {
        itemsContainer.innerHTML = items.map((book) => `
            <article class="cart-item">
                <img class="cart-item__cover" src="${escaparHTML(book.imagem)}" alt="${escaparHTML(book.alt || `Capa de ${book.titulo}`)}">
                <div class="cart-item__info">
                    <h3>${escaparHTML(book.titulo)}</h3>
                    <p class="cart-item__author">${escaparHTML(book.autor)}</p>
                    <p class="cart-item__unit-price">${formatarPreco(book.precoAtual)} <span>por unidade</span></p>
                    <div class="cart-item__bottom">
                        <div class="quantity-control" aria-label="Quantidade de ${escaparHTML(book.titulo)}">
                            <button type="button" data-cart-action="decrease" data-book-id="${book.id}" aria-label="Diminuir quantidade de ${escaparHTML(book.titulo)}">−</button>
                            <output>${book.quantidade}</output>
                            <button type="button" data-cart-action="increase" data-book-id="${book.id}" aria-label="Aumentar quantidade de ${escaparHTML(book.titulo)}">+</button>
                        </div>
                        <strong class="cart-item__subtotal">${formatarPreco(book.precoAtual * book.quantidade)}</strong>
                    </div>
                    <button class="cart-item__remove" type="button" data-cart-action="remove" data-book-id="${book.id}">Remover</button>
                </div>
            </article>
        `).join("");
    }

    const subtotal = formatarPreco(carrinho.getSubtotal());
    drawer.querySelector("#cart-subtotal").textContent = subtotal;
    drawer.querySelector("#cart-total").textContent = subtotal;
    drawer.querySelector("#cart-clear").disabled = count === 0;
}

function adicionarLivroAoCarrinho(id) {
    const book = encontrarLivro(id);
    if (!book) return;

    if (carrinho.addItem(book)) {
        atualizarUICarrinho();
        mostrarToast(`“${book.titulo}” foi adicionado ao carrinho.`);
    }
}

function formatarPreco(value) {
    return formatadorMoeda.format(Number(value) || 0);
}

function mostrarToast(message) {
    const toast = document.getElementById("shopping-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

/* -------------------------------------------------------------------------- */
/* Vitrine, catálogo e modal de detalhes                                      */
/* -------------------------------------------------------------------------- */

function setupGridProdutos() {
    const gridVitrine = document.querySelector(".container-vitrine");
    const gridCatalogo = document.querySelector(".container-catalogo");

    if (gridVitrine) {
        renderVitrine(gridVitrine);
        setupInteracoes(gridVitrine);
    }

    if (gridCatalogo) {
        renderCatalogo(gridCatalogo);
        setupInteracoes(gridCatalogo);
    }

    const featuredDetailsButton = document.querySelector("[data-featured-book]");
    if (featuredDetailsButton) {
        featuredDetailsButton.addEventListener("click", () => {
            abrirDetalhesLivro(featuredDetailsButton.dataset.featuredBook);
        });
    }

    const seeMoreButton = document.querySelector(".vermais");
    if (seeMoreButton) {
        seeMoreButton.addEventListener("click", () => {
            window.location.href = "catalogo.html";
        });
    }
}

function renderVitrine(container) {
    container.innerHTML = Vitrine.map((book) => `
        <button type="button" class="cards-vitrine" data-book-details data-book-id="${book.id}"
            aria-label="Ver detalhes de ${escaparHTML(book.titulo)}">
            <img src="${escaparHTML(book.imagem)}" alt="${escaparHTML(book.alt)}" loading="lazy">
            <h3 class="livro-titulo">${escaparHTML(book.titulo)}</h3>
            <span class="livro-preco-antigo">${formatarPreco(book.precoAntigo)}</span>
            <span class="livro-preco-atual">${formatarPreco(book.precoAtual)}</span>
        </button>
    `).join("");
}

function renderCatalogo(container) {
    container.innerHTML = catalogo.map((book) => `
        <article class="cardCatalogo" data-book-card data-book-id="${book.id}">
            <button type="button" class="cardCatalogo__details" data-book-details data-book-id="${book.id}"
                aria-label="Ver detalhes de ${escaparHTML(book.titulo)}">
                <img class="cardCatalogo__img" src="${escaparHTML(book.imagem)}" alt="${escaparHTML(book.alt)}" loading="lazy">
                <div class="cardCatalogo__info">
                    <p class="cardCatalogo__titulo">${escaparHTML(book.titulo)}</p>
                    <p class="cardCatalogo__autor">${escaparHTML(book.autor)}</p>
                    <p class="cardCatalogo__preco">${formatarPreco(book.precoAtual)}</p>
                </div>
            </button>
            <button class="cardCatalogo__button" type="button" data-add-to-cart data-book-id="${book.id}"
                aria-label="Adicionar ${escaparHTML(book.titulo)} ao carrinho">
                <img class="cardCatalogo__buttonImg" src="img/carrinho-mais.svg" alt="">
            </button>
        </article>
    `).join("");
}

function setupInteracoes(container) {
    container.addEventListener("click", (event) => {
        const addButton = event.target.closest("[data-add-to-cart]");
        if (addButton) {
            event.preventDefault();
            event.stopPropagation();
            adicionarLivroAoCarrinho(addButton.dataset.bookId);
            return;
        }

        const detailsButton = event.target.closest("[data-book-details]");
        if (detailsButton) {
            abrirDetalhesLivro(detailsButton.dataset.bookId);
            return;
        }

        const card = event.target.closest("[data-book-card]");
        if (card) abrirDetalhesLivro(card.dataset.bookId);
    });
}

function setupModalLivro() {
    const dialog = document.createElement("dialog");
    dialog.id = "book-modal";
    dialog.className = "book-modal";
    dialog.setAttribute("aria-labelledby", "book-modal-title");
    document.body.append(dialog);

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) fecharDetalhesLivro();

        const addButton = event.target.closest("[data-add-book]");
        if (addButton) adicionarLivroAoCarrinho(addButton.dataset.addBook);
    });

    dialog.addEventListener("close", () => {
        document.body.classList.remove("has-open-modal");
        if (elementoComFocoAntesDoModal instanceof HTMLElement) {
            elementoComFocoAntesDoModal.focus();
        }
    });
}

function abrirDetalhesLivro(id) {
    const book = encontrarLivro(id);
    const dialog = document.getElementById("book-modal");
    if (!book || !dialog) return;

    elementoComFocoAntesDoModal = document.activeElement;
    dialog.innerHTML = `
        <div class="book-modal__content">
            <button class="book-modal__close" type="button" aria-label="Fechar detalhes" data-modal-close>&times;</button>
            <div class="book-modal__cover-wrap">
                <img class="book-modal__cover" src="${escaparHTML(book.imagem)}" alt="${escaparHTML(book.alt)}">
            </div>
            <div class="book-modal__info">
                <span class="book-modal__category">${escaparHTML(book.categoria)}</span>
                <h2 id="book-modal-title">${escaparHTML(book.titulo)}</h2>
                <p class="book-modal__author">${escaparHTML(book.autor)}</p>
                <p class="book-modal__synopsis">${escaparHTML(book.sinopse)}</p>
                <dl class="book-modal__metadata">
                    <div><dt>Editora</dt><dd>${escaparHTML(book.editora)}</dd></div>
                    <div><dt>Ano</dt><dd>${escaparHTML(book.ano)}</dd></div>
                    <div><dt>Páginas</dt><dd>${escaparHTML(book.numPaginas)}</dd></div>
                </dl>
                <p class="book-modal__price">${formatarPreco(book.precoAtual)}</p>
                <div class="book-modal__actions">
                    <button type="button" class="book-modal__add" data-add-book="${book.id}">Adicionar ao carrinho</button>
                    <a href="catalogo.html" class="book-modal__catalog-link">Ver catálogo</a>
                </div>
            </div>
        </div>
    `;

    dialog.querySelector("[data-modal-close]").addEventListener("click", fecharDetalhesLivro);
    document.body.classList.add("has-open-modal");
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-add-book]").focus({ preventScroll: true });
}

function fecharDetalhesLivro() {
    const dialog = document.getElementById("book-modal");
    if (dialog?.open) dialog.close();
}

function encontrarLivro(id) {
    return catalogo.find((book) => String(book.id) === String(id));
}

function setupBusca() {
    const searchInput = document.getElementById("buscar");
    const categorySelect = document.getElementById("filtro-categoria");
    const grid = document.querySelector(".container-catalogo");
    if (!grid) return;

    if (categorySelect) {
        const categories = [...new Set(catalogo.map((book) => book.categoria))]
            .sort((a, b) => a.localeCompare(b, "pt-BR"));

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.append(option);
        });
    }

    const filtarLivros = () => {
        const query = normalizarTexto(searchInput?.value.trim() ?? "");
        const selectedCategory = categorySelect?.value ?? "";

        grid.querySelectorAll("[data-book-card]").forEach((card) => {
            const book = encontrarLivro(card.dataset.bookId);
            const searchable = normalizarTexto(`${book?.titulo ?? ""} ${book?.autor ?? ""}`);
            const matchesSearch = searchable.includes(query);
            const matchesCategory = !selectedCategory || book?.categoria === selectedCategory;
            card.hidden = !(matchesSearch && matchesCategory);
        });
    };

    searchInput?.addEventListener("input", filtarLivros);
    categorySelect?.addEventListener("change", filtarLivros);
}

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escaparHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

/* -------------------------------------------------------------------------- */
/* Formulários                                                                */
/* -------------------------------------------------------------------------- */

function setupForms() {
    const formContato = document.getElementById("formulario-p-contato");
    const mensagemContato = document.getElementById("mensagem-form");

    if (formContato && mensagemContato) {
        formContato.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!formContato.checkValidity()) {
                formContato.reportValidity();
                return;
            }

            mensagemContato.innerHTML = `
                <div id="mensagem-confirmacao" role="status">
                    <h3>Mensagem enviada!</h3>
                    <p>Agradecemos o contato! Em breve alguém da equipe retornará pelo e-mail para respondê-lo.</p>
                </div>
            `;
            formContato.reset();
        });
    }

    const formNewsletter = document.getElementById("form-newsletter");
    const mensagemNewsletter = document.getElementById("mensagem-newsletter");

    if (formNewsletter && mensagemNewsletter) {
        formNewsletter.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!formNewsletter.checkValidity()) {
                formNewsletter.reportValidity();
                return;
            }

            mensagemNewsletter.innerHTML = `
                <div id="men-confirmacao-newsletter" role="status">
                    <h3>Assinatura Confirmada!</h3>
                    <p>Sua inscrição foi realizada com sucesso! Em breve, você receberá novidades e recomendações.</p>
                </div>
            `;
            formNewsletter.reset();
        });
    }
}
