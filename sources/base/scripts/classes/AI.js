/**
 * Класс, представляющий компьютерного игрока
 * @extends RegisterItem
 */
class AI {
    constructor(game, player) {
        this.game = game;
        this.player = player;

        DEBUG && console.log(`AI is connected!`, this);

        this.game.on_change_state.addListener(() => {
            this.stateHandler();
        });

        this.stateHandler();
    }

    stateHandler() {
        console.log(`AI stateHandler`);

        if (this.game.state.code === Game.STATES.AWAITING_PLAYER_MOVE) {
            if (this.game.state.player === this.player.id) {
                console.log(`AI Пора атаковать`);
                setTimeout(() => {
                    this.attack();

                }, rand(2000, 5000));
            }
        }
    }

    attack() {
        const field = this.game.getСurrentField();
        const covered = field.getCoveredCells();

        const stats = field.getShipsStats();
        let target;

        // Если есть хотябы один подбитый корабль
        if (stats.damaged.length > 0) {
            const ship = rand(stats.damaged);
            console.warn(ship);
            target = rand(ship.alive);
        } else {
            const cell = rand(covered);
            target = [cell.x, cell.y];
        }

        console.log(`AI is attack!`, target);

        if (target)
            field.cellHandler(target[0], target[1], this.player);

    }
}
