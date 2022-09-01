window.owbs = (() => {
    const __listeners = {};
    const localStorage = window.localStorage;

    const get = (prop) => {
        let value = localStorage.getItem(`owbs__${prop}`);
        try {
            value = JSON.parse(value);
        }
        catch(error) {}
        return value;
    }

    const on = (prop, listener) => {
        if(!__listeners[prop]) {
            __listeners[prop] = [];
        }
        __listeners[prop].push(listener);

        //If current value is truthy, run binding immediately
        const currentValue = get(prop);
        if(currentValue !== null) {
            listener(currentValue);
        }
    };

    return {
        val: new Proxy({}, {
            get: (_, prop) => get(prop),
            set: (_, prop, value) => {
                localStorage.setItem(`owbs__${prop}`, JSON.stringify(value));
                const listeners = __listeners[prop] || [];
                listeners.forEach((listener) => listener(value));
                return true;
            }
        }),
        on,
        bind: (prop, target, mapper, setter) => {
            if(setter && setter.startsWith("attr:")) {
                const attr = setter.slice(5);
                setter = (element, value) => element.setAttribute(attr, value);
            }
            if(setter === "html") {
                setter = (element, value) => element.innerHTML = value;
            }
            if(!setter || setter === "text") {
                setter = (element, value) => element.innerText = value;
            }

            mapper = mapper || ((x) => x);

            // Make NodeList of matching elements into an Array
            const elements = [].slice.call(document.querySelectorAll(target));

            // If there are any matches, register a listener that updates all of them.
            if(elements.length) {
                on(prop, (value) => elements.forEach((element) => setter(element, mapper(value))));
            }
        }
    };
})();
