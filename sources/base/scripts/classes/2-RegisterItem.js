/**
 * Абстрактный класс, представляющий элемент реестра чего-либо.
 */
class RegisterItem {
    constructor(id, register, defaults = {}, relations = {}) {
//        const self = this;

        this.id = id;
        this.register = register;
        this.relations = relations;
        this.key = `${ this.register.prefix }-${ this.id }`;

        // E V E N T S
        this.on_change = new kkEvent();

        // Свойства, которые должны кодироваться в JSON
        // при записи состояния.
        this.data = LS.get(this.key, defaults);

        // Геттеры и сеттеры свойств data для удобства
        for (let key in this.data) {
            if (key in this)
                throw Error(`Имя свойства занято`);

            Object.defineProperty(this, key, {
                get: () => {
                    if (key in this.relations) {
                        if (this.data[key] === null)
                            return null;
                        return this.relations[key].get(this.data[key]);
                    }

                    if (this.data[key] instanceof Object)
                        // Примитивное клонирование объекта
                        return JSON.parse(JSON.stringify(this.data[key]));

                    return this.data[key]
                },
                set: (new_value) => {
                    if (typeof new_value === `function`)
                        throw TypeError();

                    if (key in this.relations) {
                        if (new_value instanceof this.relations[key].item_class)
                            if (new_value.id === this.data[key])
                                return;
                            else {
                                this.data[key] = new_value.id;
                                LS.set(this.key, this.data);
                                this.on_change.dispatch(key, new_value);
                                return;
                            }
                        else
                            throw TypeError();
                    }

                    if (new_value === this.data[key])
                        return;

                    if (new_value instanceof Object) {
                        // Ради упрощения используется
                        // сравнение строк в формате JSON
                        if (
                            JSON.stringify(new_value) ===
                            JSON.stringify(this.data[key])
                        )
                            return;
                    }

                    this.data[key] = new_value;
                    // TODO: накопление изменений, для одновременной записи
                    LS.set(this.key, this.data);
                    this.on_change.dispatch(key, new_value);
                }
            });
        }

//        const self = this;
//        this.on_change.addListener(key => {
//            DEBUG && console.log(
//                `${ this.register.prefix } UPD:`, key
//            );
//        });
    }
}
