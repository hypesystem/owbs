window.owbs = (() => {
    const __listeners = {};

    const get = (prop) => {
        const value = window.localStorage.getItem(`owbs__${prop}`);
        try {
            return JSON.parse(value);
        }
        catch(error) {
            return value;
        }
    }

    const on = (prop, listener) => {
        if(!__listeners[prop]) {
            __listeners[prop] = [];
        }
        __listeners[prop].push(listener);

        //If current value is truthy, run binding immediately
        const currentValue = get(prop);
        if(currentValue) {
            listener(currentValue);
        }
    };

    return {
        val: new Proxy({}, {
            get: (_, prop) => get(prop),
            set: (_, prop, value) => {
                window.localStorage.setItem(`owbs__${prop}`, JSON.stringify(value));
                const listeners = __listeners[prop] || [];
                listeners.forEach((listener) => listener(value));
            }
        }),
        on,
        bind: (prop, target, mapper) => {
            mapper = mapper || ((x) => x);
            const element = document.querySelector(target);
            if(element) {
                on(prop, (value) => element.innerText = mapper(value));
            }
        }
    };
})();
