/**
 * Класс, представляющий игру
 * @extends RegisterItem
 */
class Game extends RegisterItem {
    constructor(id, register) {
        const defaults = {
            history: []
        };

        super(id, register, defaults);

        this.on_change_state = new kkEvent();

        this.on_change.addListener(key => {
            if (key === `history`)
                this.on_change_state.dispatch(this.state);
        });

        this.on_change_state.addListener(() => {
            this.stateHandler();
        });

        if (this.register.current_id === this.id)
            this.stateHandler();
    }

    static get STATES() {
        return {
            SHIPS_ARRANGED: 150,
            BEGIN: 200,
            AWAITING_PLAYER_MOVE: 230,
            PLAYER_MOVE: 260,
            GAME_OVER: 400
        }
    }

    addHistoryRecord(record) {
        const history = this.history;
        record.ts = Date.now();
        history.push(record);
        this.history = history;
    }

    get state() {
        if (this.history.length === 0)
            return null;

        return this.history[this.history.length - 1];
    }

    get started() {
        return this.history.find(
            record => record.code === Game.STATES.BEGIN
        ) ? true : false;
    }

    get over() {
        return this.state.code === Game.STATES.GAME_OVER;
    }

    get turn() {
        const records = this.history.filter(
            record => record.code === Game.STATES.AWAITING_PLAYER_MOVE
        );

        const turn = records[records.length - 1];

        return turn ? turn.player : null;
    }

    /**
     * Объекты полей.
     */
    get fields() {
        return app.fields.getByGame(this.id);
    }

    /**
     * Объекты игроков.
     */
    get players() {
        return this.fields.map(field => field.player);
    }

    /**
     * Возвращает поле, принадлежащее игроку с идентификатором id.
     * @param {number} id — идентификатор игрока.
     */
    getFieldByPlayer(player) {
        return this.fields.find(field => field.player.id === player.id);
    }

    /**
     * Возвращает поле, противнику игрока, делающему ход в данный момент.
     */
    getСurrentField() {
        const player = this.players.find(player => player.id !== this.turn);
        return this.getFieldByPlayer(player);
    }

    /**
     * Создает игровое поле.
     * @param {number} player — объект игрока.
     * @param {number} width — ширина поля.
     * @param {number} height — высота поля.
     */
    createField(player, width, height) {
        if (this.fields.length >= 2)
            throw Error(`Игра только для двух игроков`);

        const field = app.fields.new();
        field.player = player;
        field.game = this;
        field.build(width, height);
    }

    start() {
        if (this.started)
            throw Error(`Игра уже начата`);

        this.addHistoryRecord({
            code: Game.STATES.BEGIN
        });
    }

    stateHandler() {
        const state = this.state;

        if (!state) {
            console.log(`Состояния нет`);
            return;
        }

        console.log(`stateHandler`, state);

        if (state.code === Game.STATES.SHIPS_ARRANGED) {
            const field = app.fields.get(state.field);
            console.log(`Карабли расставлены на поле игрока`, field.player.id);
            return;
        }

        if (state.code === Game.STATES.BEGIN) {
            console.log(`Игра началась`);

            // Случайное определение игрока для первого хода
            this.addHistoryRecord({
                code: Game.STATES.AWAITING_PLAYER_MOVE,
                player: rand(this.players).id
            });

            return;
        }

        if (state.code === Game.STATES.AWAITING_PLAYER_MOVE) {
            console.log(`Ожидание хода игрока ${ state.player }`);
            return;
        }

        if (state.code === Game.STATES.GAME_OVER) {
            console.log(`Игра завершена`);

            setTimeout( () => {
                app.actions.end_game();
            }, 3000);
            return;
        }

        if (state.code === Game.STATES.PLAYER_MOVE) {
            console.log(`Игрок ${ state.player } сделал ход`);

            // Промах исключает завершение игры на этом ходу
            if (state.result === `miss`) {
                setTimeout(() => {
                    this.nextTurn();
                }, 3000);

                return;
            }

            const field = app.fields.get(state.field);

            // Если корабль потоплен, проверяем,
            // сколько ещё кораблей на плаву
            if (state.result === `sunk`) {
                const stats = field.getShipsStats();

                if (stats.alive.length === 0) {
                    // Нет кораблей на плаву — игра закончена

                    this.players.forEach(player => {
                        if (player.id === this.turn)
                            player.wins = player.wins + 1;
                        else
                            player.loses = player.loses + 1;
                    });

                    this.addHistoryRecord({
                        code: Game.STATES.GAME_OVER,
                        player: this.turn
                    });

                } else {
                    setTimeout(() => {
                        this.addonTurn();
                    }, 500);
                }

                return;
            }

            // Условия для следующего хода
            if (state.result === `hit`) {
                console.log(`Игрок ${ state.player } получил доп. ход`);

                setTimeout(() => {
                    this.addonTurn();
                }, 500);

                return;
            }

        }

    }

    /**
     * Дополнительный ход игрока
     */
    addonTurn() {
        if (!this.started || this.over)
            return;

        this.addHistoryRecord({
            code: Game.STATES.AWAITING_PLAYER_MOVE,
            player: this.turn
        });
    }

    /**
     * Следующий ход
     */
    nextTurn() {
        if (!this.started || this.over)
            return;

        const players = this.players;
        const index = players.findIndex(item => item.id === this.turn) + 1;

        const next_player_id =
              index < players.length ? players[index].id : players[0].id;

        this.addHistoryRecord({
            code: Game.STATES.AWAITING_PLAYER_MOVE,
            player: next_player_id
        });
    }
}
