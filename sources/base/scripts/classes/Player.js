/**
 * Класс, представляющий игрока
 * @extends RegisterItem
 */
class Player extends RegisterItem {
    constructor(id, register) {
        const defaults = {
            name: null,
            games: 0,
            loses: 0,
            wins: 0,
            current_game: null,
        }

        super(id, register, defaults);


    }
}
