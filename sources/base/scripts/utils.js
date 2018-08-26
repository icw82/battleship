const compose = (...functions) => data =>
    functions.reduceRight((value, func) => func(value), data);

const pipe = (...functions) => data =>
    functions.reduce((value, func) => func(value), data);

const rand = (first, second) => {
    let min;
    let max;

    // Если первым аргументом передан массив
    if (first instanceof Array)
        return first[ rand(0, first.length - 1) ];

    // Если аргументов нет — выдавать случайно true/false
    if (typeof first !== `number`)
        return !Math.round(Math.random())

    // Если аргумент только один — задаёт разряд случайного числа
    if (typeof second !== `number`) {
        let depth = Math.floor(Math.abs(first));

        if (depth >= 16)
            throw new Error(`Нельзя задать число более чем в 16 знаков`);

        if (depth === 0)
            return 0;

        if (depth === 1)
            min = 0;
        else
            min = Math.pow(10, depth - 1);

        return rand(min, Math.pow(10, depth) - 1);

    }

    // Если два аргумента
    min = first;
    max = second + 1;

    return Math.floor( Math.random() * (max - min) ) + min;

}

class kkEvent{
    constructor() {
        this.listeners = [];
        this.queue = [];
        this.state = {
            last: void 0,
            processed: false,
            completed: false
        }
    }

    hasListener(listener) {
        return this.listeners.find(item => item === listener);
    }

    addListener(listener) {
        if (typeof listener !== `function`)
            throw TypeError();

        if (this.hasListener(listener))
            return;

        if (this.state.completed)
            listener(...this.state.last);
        else
            this.listeners.push(listener);

        // Новые слушатели, появившиеся в процессе обхода существующих
        // попадают также в очередь выполнения
        if (this.state.processed)
            this.queue.push(listener);
    }

    removeListener(listener) {
        if (typeof listener !== `function`)
            return;

        this.listeners = this.listeners.filter(item => item !== listener);
    }

    dispatch(...data) {
        if (this.state.completed)
            return;

        this.state.processed = true;
        this.state.last = data;

        this.listeners.forEach(listener => {
            listener(...data);
        });

        while (this.queue.length > 0) {
            const listener = this.queue.shift();
            listener(...data);
        }

        this.state.processed = false;
    }

    complete() {
        if (this.state.completed)
            return;

        this.dispatch.apply(this, arguments);

        this.state.completed = true;
    }
}


// Для хранения межсессионных данных я бы выбрал IndexedDB,
// но при условии IE8+ придётся использовать localStorage.
const LS = (localStorage => {
    const _ = {};

    _.on_change = new kkEvent();

    _.create = (key, value = null) => {
        if (
            (typeof key === `string`) &&
            (!localStorage.getItem(key))
        ) {
            _.set(key, value, true);
        }
    }

    _.get = (address, default_value) => {
        const data = localStorage.getItem(address);

        if (!data && (typeof default_value === `object`))
            return _.set(address, default_value);

        return JSON.parse(data);
    }

    _.ts = address => localStorage.getItem(`@` + address);

    _.set = (address, data, mute) => {
        localStorage.setItem(address, JSON.stringify(data));
        localStorage.setItem(`@` + address, Date.now());

        mute || _.on_change.dispatch();

        return data;
    }

    _.remove = (address) => {
        localStorage.removeItem(address)
        localStorage.removeItem(`@` + address)

        _.on_change.dispatch(`remove`);
    }

    return _;

})(localStorage);
