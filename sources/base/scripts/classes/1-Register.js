// В процессе написания кода был выделен отдельный родительский класс,
// так как появилось два класса с похожим набором свойств и методов.
// Таким образом упростилось создание объектов с сохраняемым состоянием
// и отслеживания изменений в них.

/**
 * Абстрактный класс, представляющий реестр чего-либо.
 */
class Register {
    constructor(item_class, prefix) {
        this.item_class = item_class;
        this.prefix = prefix;
        this.cache = [];

        LS.create(`${ this.prefix }-ids`, []);
        LS.create(`${ this.prefix }-current`, null);

        // E V E N T S
        this.on_change = new kkEvent();
    }

    get ids() {
        return LS.get(`${ this.prefix }-ids`);

        if (!ids) {
            LS.set(`${ this.prefix }-ids`, []);
            return [];
        }
    }

    get all() {
        return this.ids.map(id => this.get(id));
    }

    get (id) {
        if (typeof id != `number`)
            throw TypeError(id);

        let item;
        const cached = this.cache.find(item => item.id === id);
        if (cached)
            item = cached
        else {
            item = new this.item_class(id, this);
            this.cache.push(item);
        }

        if (!this.ids.includes(item.id)) {
            LS.set(`${ this.prefix }-ids`, [].concat(this.ids, [item.id]));
            this.on_change.dispatch( item );
        }

        return item;
    }

    new () {
        // TODO: проверка на уникальность свойства? (например имени)
        const id = this.ids.length > 0 ? Math.max(...this.ids) + 1 : 1;
        const item = this.get(id);
        return item;
    }

    remove (id) {
        const ids = this.ids;
        const index = ids.indexOf(id);

        if (index > -1) {
            ids.splice(index, 1);
            LS.remove(`${ this.prefix }-${ id }`);
            LS.set(`${ this.prefix }-ids`, ids);

            const cache_index = this.cache.findIndex(item => item.id === id);
            if (cache_index > -1) {
                this.cache.splice(cache_index, 1);
            }

            this.on_change.dispatch(`remove`);
        } else {
            console.warn(`Запрос на удаление несуществующего элемента ${id}`);
        }
    }

    get current_id() {
        const id = LS.get(`${ this.prefix }-current`);

        return (typeof id === `number`) ? id : null;
    }

    get current() {
        const id = this.current_id;
        return id === null ? null : this.get(id);
    }

    set current(new_value) {
        let id;

        if (new_value instanceof this.item_class)
            id = new_value.id;
        else if (typeof new_value === `number` || new_value === null)
            id = new_value;
        else
            throw TypeError();

        LS.set(`${ this.prefix }-current`, id);
        this.on_change.dispatch(`current`);
    }

}
