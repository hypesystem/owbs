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

        // Always run binding immediately
        listener(get(prop));
    };

    const HTML = "html";
    const TEXT = "text";

    const setHtml = (element, value) => element.innerHTML = value;
    const setText = (element, value) => element.innerText = value;
    const setAttr = (attr) => (element, value) => element.setAttribute(attr, value);

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
            if(setter && typeof setter === "string" && setter.startsWith("attr:")) {
                const attr = setter.slice(5);
                setter = setAttr(attr);
            }
            if(setter === HTML) {
                setter = setHtml;
            }
            if(setter === "attrs") {
                setter = (element, valueMap) => Object.entries(valueMap)
                    .forEach(([ attr, value ]) => {
                        if(attr === HTML) setHtml(element, value);
                        else if(attr === TEXT) setText(element, value);
                        else setAttr(attr)(element, value);
                    });
            }
            if(!setter || setter === TEXT) {
                setter = setText;
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
