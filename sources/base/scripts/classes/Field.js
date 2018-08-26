/**
 * Класс, представляющий игровое поле
 * @extends RegisterItem
 */
class Field extends RegisterItem {
    constructor(id, register) {
        const defaults = {
            player: null,
            game: null,
            width: null,
            height: null,
            cells: [],
            ships: [] // Координаты
        }

        const relations = {
            player: app.players,
            game: app.games
        };

        super(id, register, defaults, relations);

        this.on_change.addListener(() => {
            this.game && this.game.on_change.dispatch(`field`);
        });

    }

    getShipsStats() {
        const results = {
            safe: [],
            discovered: [],
            alive: [],
            sunken: [],
            damaged: []
        }

        const ships = this.ships.map(decks => {
            const ship = {
                discovered: [],
                alive: []
            };

            ship.decks = decks.map( ([x, y]) => {
                const cell = this.getCell(x, y);

                if (cell.discovered)
                    ship.discovered.push([x, y]);

                if (!cell.discovered)
                    ship.alive.push([x, y]);

                return [x, y];
            });

            if (ship.discovered.length)
                results.discovered.push(ship);

            if (ship.alive.length)
                results.alive.push(ship);

            if (!ship.discovered.length)
                results.safe.push(ship);

            if (!ship.alive.length)
                results.sunken.push(ship);

            if (ship.discovered.length && ship.alive.length)
                results.damaged.push(ship);

            return ship;
        });

        results.total = ships;

        return results;
    }

    getCoveredCells() {
        return this.cells.filter(cell => !cell.discovered);
    }

    getCell(x, y) {
        if (typeof x !== `number` || typeof y !== `number`)
            throw TypeError();

        if (!this.cells)
            throw Error(`Поле не построено`);

        return this.cells.find(cell => cell.x === x && cell.y === y);
    }

    setCell(x, y, key, value) {
        const temp = this.cells;
        const cell = temp.find(cell => cell.x === x && cell.y === y);
        cell[key] = value;
        this.cells = temp;
    }

    getAdjacentCells(x, y) {
        return [
            [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
            [x - 1, y],                 [x + 1, y],
            [x - 1, y + 1], [x, y + 1], [x + 1, y + 1],
        ].filter(
            ([x, y]) => x >= 0 && x < this.width && y >= 0 && y < this.height
        ).map(
            ([x, y]) => this.getCell(x, y)
        );
    }

    isCellVacant(x, y) {
        const cell = this.getCell(x, y);

        if (!cell || cell.ship)
            return false;

        return !this
            .getAdjacentCells(x, y)
            .find(cell => cell && cell.ship);
    }

    getWholeShip(x, y) {
        const cell = this.getCell(x, y);

        if (!cell)
            return null;

        const ship = this.ships.find(
            ship => ship.find(
                deck => deck[0] === x && deck[1] === y
            )
        );

        return ship || null;
    }

    /**
     * Строит новое игровое поле.
     * @param {number} width — ширина поля.
     * @param {number} height — высота поля.
     */
    build(width, height) {
        if (typeof width !== `number`)
            throw TypeError();

        if (typeof height !== `number`)
            height = width;

        if (width < 5 || height < 5)
            throw Error(`Размеры поля слишком малы`);

        this.width = width;
        this.height = height;

        const temp = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = {
                    x, y,
                    ship: false,
                    discovered: false
                };

                temp.push(cell);
            }
        }

        this.cells = temp;

        // Так как расстановка случайна по условию для обеих игроков
        // компьютерный игрок (как и человек) не принимает в этом участие.
        this.arrangeShips();

        return this;
    }

    arrangeShips() {
        const ship_sizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
        const width = this.width;
        const height = this.height;

        const arrangeShip = size => {
            const vertical = rand();
            let x, y;
            let ship = [];

            if (vertical) {
                x = rand(0, width - 1);
                y = rand(0, height - 1 - size);

                for (let cell = y; cell < y + size; cell++)
                    ship.push([x, cell]);
            } else {
                x = rand(0, width - 1 - size);
                y = rand(0, height - 1);

                for (let cell = x; cell < x + size; cell++)
                    ship.push([cell, y]);
            }

            const fit = !ship.find(cell => !this.isCellVacant(...cell))

            if (fit) {
                ship.forEach(([x, y]) => {
                    this.setCell(x, y, `ship`, true);
                });

                return ship;
            }

            return false;
        }

        this.ships = ship_sizes.map(size => {
            let limit = 500; // Защита от зацикливания
            let ship;

            while (limit > 0 && !ship) {
                ship = arrangeShip(size);
                limit--;
            }

            return ship;
        });

        const record = {
            code: Game.STATES.SHIPS_ARRANGED,
            field: this.id
        };

        this.game.addHistoryRecord(record);
    }

    cellHandler(x, y, player) {
        const cell = this.getCell(x, y);
        const turn = this.game.turn;

        if (player.id !== turn) {
            DEBUG && console.log(`Ход другого игрока`, turn);
            return;
        }

        if (this.game.state.code !== Game.STATES.AWAITING_PLAYER_MOVE) {
            DEBUG && console.log(`Пока ходить нельзя`);
            return;
        }

        if (cell.discovered) {
            DEBUG && console.log(`Квадрат уже открыт`);
            return;
        }

        const record = {
            code: Game.STATES.PLAYER_MOVE,
            player: player.id,
            field: this.id,
            x, y,
        };

        this.setCell(x, y, `discovered`, true);

        if (cell.ship) {
            DEBUG && console.log(`Корабль подбит`);
            record.result = `hit`;

            // Убит ли корабль?
            const ship = this.getWholeShip(x, y);

            if (!ship.find(deck => !this.getCell(...deck).discovered)) {
                DEBUG && console.log(`Корабль потоплен`);
                record.result = `sunk`;
                // Раскрытие прилегающих областей;
                ship.forEach((deck, i) => {
                    const adjacent_cells = this.getAdjacentCells(...deck);
                    adjacent_cells.forEach(cell => {
                        this.setCell(cell.x, cell.y, `discovered`, true);
                    })
                });

            }
        } else {
            DEBUG && console.log(`Промах`);
            record.result = `miss`;
        }

        this.game.addHistoryRecord(record);
    }
}
