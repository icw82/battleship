/**
 * Класс, представляющий реестр игроков.
 * @extends Register
 */
class Players extends Register {
    constructor() {
        super(Player, `player`);

        // Создание компьютерного игрока

        this.computer = this.get(0);
        if (!this.computer.name) {
            this.computer.name = `Компьютер`
        }
    }

    get hasNonAI() {
        return !!this.ids.find(id => id > 0);
    }
}
