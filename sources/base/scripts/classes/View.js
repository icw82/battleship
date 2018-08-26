// Управление представлением
class View{
    constructor() {
        this.disabled = document.querySelectorAll(`[disabled-if]`);
        this.screens = document.querySelectorAll(`[screen]`);
        this.binds = document.querySelectorAll(`[bind]`);
        this.shows = document.querySelectorAll(`[show]`);

        this.player_list = document.querySelectorAll(`#player-list`);

        this.gameUI = null;
    }

    updateDisabled() {
        const attribute_name = `disabled-if`;
        this.disabled.forEach(item => {
            const exp = item.getAttribute(attribute_name);
            // eval — применяется исключительно для
            //        сокращения времени разработки.
            try {
                const result = eval(exp);

                if (result)
                    item.setAttribute(`disabled`, `disabled`);
                else
                    item.removeAttribute(`disabled`);

            } catch(error) {
//                DEBUG && console.warn(error);
            }
        });
    }

    updateShows() {
        const attribute_name = `show`;
        this.binds.forEach(item => {
            const exp = item.getAttribute(attribute_name);
            try {
                const result = eval(exp);

                if (result)
                    item.classList.add(`show`);
                else
                    item.classList.remove(`show`);

            } catch(error) {
//                DEBUG && console.warn(error);
            }
        });
    }

    updateBinds() {
        const attribute_name = `bind`;
        this.binds.forEach(item => {
            const exp = item.getAttribute(attribute_name);
            try {
                const result = eval(exp);

                if (result)
                    item.innerText = result;
                else
                    item.innerText = ``;

            } catch(error) {
//                DEBUG && console.warn(error);
            }
        });
    }

    updateShows() {
        const attribute_name = `show`;
        this.binds.forEach(item => {
            const exp = item.getAttribute(attribute_name);
            try {
                const result = eval(exp);

                if (result)
                    item.classList.add(`show`);
                else
                    item.classList.remove(`show`);

            } catch(error) {
//                DEBUG && console.warn(error);
            }
        });
    }

    updateScreens() {
        const state = app.state.current;

        if (state === `login_menu`)
            return this.showScreen(`login`);

        if (state === `main_menu`)
            return this.showScreen(`main_menu`);

        if (state === `creating_new_player`)
            return this.showScreen(`new_player`);

        if (state === `choosing_player`)
            return this.showScreen(`choosing_player`);

        if (state === `game`) {
            return this.showScreen(`game`);

        }

        console.warn(`Неизвестное состояние`);
    }

    updateChoosingPlayer() {
        const container = document.querySelector(`#player-list`);
        container.innerHTML = ``;

        if (app.state.current !== `choosing_player`)
            return;

        const players = app.players.all;
        if (players.length > 1)
            players.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });

        const fragment = document.createDocumentFragment();

        // Отображение списка игроков
        players.forEach(player => {
            // Не показывать компьютерного игрока;
            if (player.id === 0)
                return;

            const item = document.createElement(`li`);
            const button = document.createElement(`button`);
            button.classList.add(`f-button`);

            if (player.games > 3) {
                const win_rate = Math.round(
                    player.wins / (player.wins + player.loses) * 100
                );
                button.setAttribute(`win-rate`, `${win_rate}%`);
            }

            button.innerText = player.name;

            button.addEventListener(`click`, () => {
                console.log(`button.addEventListener`, player);
                app.actions.choose_player(player.id);
            });

            item.appendChild(button);
            fragment.appendChild(item);
        });

        container.appendChild(fragment);
    }

    updateGame() {
        if (app.state.current !== `game`)
            return;

        // Только для создания нового UI, так как UI сам обновляется
        // при изменении данных
        if (!this.gameUI || this.gameUI.model !== app.games.current) {
            this.gameUI = new GameUI(
                app.games.current,
                document.querySelector(`#game-viewport`)
            );
        }
    }

    update() {
        this.updateDisabled();
        this.updateBinds();
        this.updateShows();
        this.updateScreens();

        this.updateChoosingPlayer();
        this.updateGame();
    }

    showScreen(name) {
        let screen;

        this.screens.forEach(item => {
            if (item.getAttribute(`screen`) === name) {
                screen = item;
                item.classList.add(`show`);
            } else {
                item.classList.remove(`show`);
            }
        });

        if (!screen)
            Error(`Не существует такого экрана`)
    }

}
