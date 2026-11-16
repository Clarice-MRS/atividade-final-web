/**
 * Carrinho compartilhado entre as páginas da livraria.
 * O localStorage guarda somente { id, quantidade }, evitando duplicar
 * os dados completos dos livros e mantendo o catálogo como fonte única.
 */
export class ShoppingCart {
    #items;
    #products;
    #storageKey;

    constructor(products, storageKey = "celulose-cart") {
        this.#products = new Map(products.map((book) => [String(book.id), book]));
        this.#storageKey = storageKey;
        this.#items = this.#load();
    }

    getItems() {
        return this.#items
            .map(({ id, quantidade }) => {
                const book = this.#products.get(String(id));
                return book ? { ...book, quantidade } : null;
            })
            .filter(Boolean);
    }

    addItem(bookOrId) {
        const id = typeof bookOrId === "object" && bookOrId !== null
            ? bookOrId.id
            : bookOrId;
        const book = this.#products.get(String(id));

        if (!book) return false;

        const existing = this.#items.find((item) => String(item.id) === String(id));
        if (existing) {
            existing.quantidade += 1;
        } else {
            this.#items.push({ id: book.id, quantidade: 1 });
        }

        this.#save();
        return true;
    }

    setQuantity(id, quantity) {
        const normalizedQuantity = Math.floor(Number(quantity));
        const index = this.#items.findIndex((item) => String(item.id) === String(id));

        if (index === -1) return false;
        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
            return this.removeItem(id);
        }

        this.#items[index].quantidade = normalizedQuantity;
        this.#save();
        return true;
    }

    increase(id) {
        const item = this.#items.find((entry) => String(entry.id) === String(id));
        return item ? this.setQuantity(id, item.quantidade + 1) : false;
    }

    decrease(id) {
        const item = this.#items.find((entry) => String(entry.id) === String(id));
        return item ? this.setQuantity(id, item.quantidade - 1) : false;
    }

    removeItem(id) {
        const previousLength = this.#items.length;
        this.#items = this.#items.filter((item) => String(item.id) !== String(id));
        if (this.#items.length === previousLength) return false;
        this.#save();
        return true;
    }

    clear() {
        this.#items = [];
        this.#save();
    }

    getCount() {
        return this.#items.reduce((total, item) => total + item.quantidade, 0);
    }

    getSubtotal() {
        const totalInCents = this.#items.reduce((total, item) => {
            const book = this.#products.get(String(item.id));
            if (!book) return total;
            return total + Math.round(Number(book.precoAtual) * 100) * item.quantidade;
        }, 0);

        return totalInCents / 100;
    }

    #load() {
        try {
            const stored = localStorage.getItem(this.#storageKey);
            if (!stored) return [];

            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter((item) => item && this.#products.has(String(item.id)))
                .map((item) => ({
                    id: this.#products.get(String(item.id)).id,
                    quantidade: Math.max(1, Math.floor(Number(item.quantidade) || 1)),
                }))
                .filter((item) => Number.isFinite(item.quantidade));
        } catch (error) {
            console.warn("Não foi possível recuperar o carrinho salvo.", error);
            return [];
        }
    }

    #save() {
        try {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#items));
        } catch (error) {
            console.warn("Não foi possível salvar o carrinho.", error);
        }
    }
}
