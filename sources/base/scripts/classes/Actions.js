class Actions {
    constructor() {

    }

    back(mute) {
        DEBUG && console.log(`Назад`);

        const parent = app.state.hasParent();
        if (parent) {
            app.state.current = parent;
            mute || app.view.update();
        };
    }

    open_new_player_menu(mute) {
        DEBUG && console.log(`Открыть меню создания нового игрока`);

        app.state.current = `creating_new_player`;

        mute || app.view.update();
    }

    open_choose_player_menu(mute) {
        DEBUG && console.log(`Открыть меню смены игрока`);

        app.players.current = null;

        app.state.current = `choosing_player`;

        mute || app.view.update();
    }

    // P L A Y E R S
    sign_out(mute) {
        DEBUG && console.log(`Выход к меню выборка игрока`);

        app.players.current = null;

        app.state.current = `login_menu`;

        mute || app.view.update();
    }

    create_new_player(mute) {
        DEBUG && console.log(`Создать нового игрока`);

        const field = document.querySelector(`#new_player_name`);

        // Простая проверка значения
        if (field.value.length < 3)
            // В будущем Alert желательно заменить
            // модальным окном на html.
            return alert(`Слишком короткое имя`);

        {
            const player = app.players.new();
            player.name = field.value;
            app.players.current = player.id;
        }

        app.state.current = `main_menu`;

        mute || app.view.update();

        field.value = ``;
    }

    choose_player(id, mute) {
        DEBUG && console.log(`Выбрать игрока ${ id }`);

        app.players.current = id;
        app.state.current = `main_menu`;

        mute || app.view.update();
    }

    // TODO: удалять также и все связанные игры
    delete_player(id, mute) {
        DEBUG && console.log(`Удалить игрока ${ id }`);

        const message = `Вы действительно хотите удалить этого игрока?`;

        if (confirm(message)) {
            app.players.remove(id);
            this.sign_out(mute);
        }
    }

    delete_current_player(mute) {
        DEBUG && console.log(`Удалить текущего игрока`);

        this.delete_player(app.players.current.id, mute);
    }

    // G A M E S
    create_new_game(mute) {
        DEBUG && console.log(`Создать новую игру`);

        if (!app.players.current)
            throw Error(`Нельзя создать игру, не выбрав игрока`);

        // Создание новой игры
        const game = app.games.new();

        // Создание полей
        game.createField(app.players.current, 10);
        game.createField(app.players.get(0), 10); // 0 — компьютер

        game.start();

        // Ссылка на игру в объекте игрока
        app.players.current.games = app.players.current.games + 1;
        app.players.current.current_game = game.id;

        app.games.current = app.players.current.current_game;

        app.state.current = `game`;

        mute || app.view.update();
    }

    continue_game(mute) {
        DEBUG && console.log(`Продолжить игру`);

        if (!app.players.current)
            throw Error(`Нельзя продолжить игру, не выбрав игрока`);

        if (!app.players.current.current_game)
            throw Error(`У текущего игрока нет игры`);

        app.games.current = app.players.current.current_game;

        app.state.current = `game`;

        mute || app.view.update();
    }

    end_game(mute) {
        DEBUG && console.log(`Завершить игру`);

        app.players.current.current_game = null;

        app.games.current = null;

        app.state.current = `main_menu`;

        mute || app.view.update();
    }

};
