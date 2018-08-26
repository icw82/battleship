class State {
    constructor() {
        this.ai = null;
        this.checkAI();

//        this.game.on_change_state.addListener(state => {
//            this.update(state);
//        });
    }

    /**
     * Проверяет, нужно ли подключить AI в данный момент.
     */
    checkAI() {
        if (this.current === `game`) {
            if (this.ai && this.ai.game.id === app.games.current.id)
                return;

            this.ai = new AI(app.games.current, app.players.get(0));
        } else {
            this.ai = null;
        }
    }

    get default() {
        return `login_menu`
    }

    get available() {
        return [{
            name: `login_menu`,
            label: `Форма входа`
        }, {
            name: `main_menu`,
            label: `Главное меню`,
//            parent: `login_menu`,
        }, {
            name: `creating_new_player`,
            label: `Создание нового игрока`,
            parent: `login_menu`,
        }, {
            name: `choosing_player`,
            label: `Выбор игрока`,
            parent: `login_menu`,
        }, {
            name: `game`,
            label: `Игра`,
            parent: `main_menu`,
        }];
    }

    get(name) {
        return this.available.find(item => item.name === name);
    }

    hasParent(name) {
        if (!name)
            name = this.current;

        const state = this.get(name);

        if (state)
            return state.parent;
    }

    get current() {
        const value = LS.get(`current-state`);
        if (!this.get(value))
            LS.set(`current-state`, this.default);

        return LS.get(`current-state`);
    }

    set current(new_value) {
        if (this.get(new_value)) {
            LS.set(`current-state`, new_value);
            this.checkAI();
        } else {
            throw Error(`Неизвестное состояние: ${ new_value }`);
        }
    }
}
