class GameUI {
    constructor(game, viewport) {
        this.game = game;
        this.viewport = viewport;
        this.fields = [];

        // Очистка контейнера
        viewport.innerHTML = ``;

        // Формирование элементов интерфейса
        const fragment = document.createDocumentFragment();

        this.status_bar = document.createElement(`div`);
        this.status_bar.classList.add(`game__status-bar`);
        fragment.appendChild(this.status_bar);


        // Индикатор хода
        this.turn = document.createElement(`div`);
        this.turn.classList.add(`game__turn`);
        this.status_bar.appendChild(this.turn);

        const current_player = app.players.current;

        // Поля
        this.fields_container = document.createElement(`div`);
        this.fields_container.classList.add(`game__fields-container`);
        fragment.appendChild(this.fields_container);

        this.game.fields.forEach(model => {
            const element = document.createElement(`div`);
            element.classList.add(`game__field`);
            if (model.player.id === current_player.id)
                element.classList.add(`ally`);
            else
                element.classList.add(`enemy`);
            this.fields_container.appendChild(element);

            this.fields.push( new FieldUI(model, element) );
        });

        viewport.appendChild(fragment);

        this.update();

        // E V E N T S
        this.game.on_change_state.addListener(state => {
            this.update();
        });
    }

    hideAllFields() {
        console.log(`hideAllFields`);
        this.fields_container.classList.remove(`ally`);
        this.fields_container.classList.remove(`enemy`);
    }

    showAllyField() {
        this.fields_container.classList.remove(`enemy`);
        this.fields_container.classList.add(`ally`);
    }

    showEnemyField() {
        this.fields_container.classList.remove(`ally`);
        this.fields_container.classList.add(`enemy`);
    }

    update() {
        const state = this.game.state;

        if (state.code === Game.STATES.GAME_OVER) {
            this.hideAllFields();

            if (state.player === app.players.current.id)
                this.turn.innerText = `Вы выиграли!`;
            else
                this.turn.innerText = `Вы проиграли`;

            return;
        }

        if (
            state.code === Game.STATES.AWAITING_PLAYER_MOVE ||
            state.code === Game.STATES.PLAYER_MOVE
        ) {
            if (state.player === app.players.current.id)
                this.showEnemyField();
            else
                this.showAllyField();

            const player = app.players.get(this.game.turn);

            if (state.code === Game.STATES.AWAITING_PLAYER_MOVE) {
                if (state.player === app.players.current.id)
                    this.turn.innerText = `Ваш ход`;
                else {
                    this.turn.innerText = `${ player.name } делает ход`;
                }
            }

            if (state.code === Game.STATES.PLAYER_MOVE) {
                if (state.player === app.players.current.id)
                    this.turn.innerText = `Вы сделали ход и ` + {
                        miss: `промахнулись`,
                        hit: `подбили вражеский корабль`,
                        sunk: `потопили вражеский корабль`,
                    }[state.result];
                else {
                    this.turn.innerText = `${ player.name } сделал ход и ` + {
                        miss: `промахнулся`,
                        hit: `подбил ваш корабль`,
                        sunk: `потопил ваш корабль`,
                    }[state.result];
                }
            }
        }
    }

    updateTurn() {
    }

}
