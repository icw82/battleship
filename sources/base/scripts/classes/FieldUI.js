class FieldUI {
    constructor(model, viewport) {
        this.model = model;
        this.viewport = viewport;
        this.dom = [];

        const fragment = document.createDocumentFragment();
        const cell_template = document.createElement(`div`);
        cell_template.classList.add(`game__cell`);

        const cell_size = 100 / Math.max(this.model.width, this.model.height);
        const player = app.players.current;

        this.dom = this.model.cells.map(cell => {
            const element = cell_template.cloneNode();

            element.style.width = `${ cell_size }%`;
            element.style.height = `${ cell_size }%`;
            element.style.left = `${ cell_size * cell.x }%`;
            element.style.top = `${ cell_size * cell.y }%`;

            if (!cell.x % (this.model.width - 1))
                element.classList.add(`row-start`);

            if (!cell.y % (this.model.height - 1))
                element.classList.add(`col-start`);

            if (cell.x === this.model.width - 1)
                element.classList.add(`row-end`);

            if (cell.y === this.model.height - 1)
                element.classList.add(`col-end`);

            fragment.appendChild(element);
            element.addEventListener(
                `click`,
                this.model.cellHandler.bind(this.model, cell.x, cell.y, player)
            );

            return {
                element,
                x: cell.x,
                y: cell.y,
            }
        });

        viewport.appendChild(fragment);

        this.update();

        this.model.on_change.addListener((key, new_value) => {
            this.update(key);
        });
    }

    update(key) {
        if (!key || key === `cells`)
            this.updateCells();
    }

    updateCells() {
        this.dom.forEach(({element, x, y}) => {
            const model = this.model.getCell(x, y);

            model.ship ?
                element.classList.add(`ship`) :
                element.classList.remove(`ship`);

            model.discovered ?
                element.classList.add(`discovered`) :
                element.classList.remove(`discovered`);
        });
    }
}
