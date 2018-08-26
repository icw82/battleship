/**
 * Класс, представляющий реестр игровых полей.
 * @extends Register
 */
class Fields extends Register {
    constructor() {
        super(Field, `field`);
    }

    getByGame(id) {
        return this.all.filter(item => item.game && item.game.id === id);
    }

    getByPlayer(id) {
        return this.all.filter(item => item.player && item.player.id === id);
    }
}
