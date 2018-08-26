/**
 * Класс, представляющий реестр игр.
 * @extends Register
 */
class Games extends Register {
    constructor(ai) {
        super(Game, `game`, ai);
    }
}
