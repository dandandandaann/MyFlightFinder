
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function monthDays(month, year) {
        return new Date(year, month, 0).getDate();
    }
    Date.prototype.monthDays = function () {
        return monthDays(this.getMonth() + 1, this.getFullYear());
    };
    function onError(message, exception, dirObject) {
        if (exception)
            console.error(exception);
        if (dirObject)
            console.dir(dirObject);
        console.log('Error: ' + message);
        alert('Error: ' + message);
    }
    let weekDays = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
    ];
    let monthList = [
        { value: 0, text: "Janeiro" },
        { value: 1, text: "Feveriro" },
        { value: 2, text: "Março" },
        { value: 3, text: "Abril" },
        { value: 4, text: "Maio" },
        { value: 5, text: "Junho" },
        { value: 6, text: "Julho" },
        { value: 7, text: "Agosto" },
        { value: 8, text: "Setembro" },
        { value: 9, text: "Outubro" },
        { value: 10, text: "Novembro" },
        { value: 11, text: "Dezembro" },
    ];
    let yearList = [2022, 2023, 2024, 2025, 2026, 2027];

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        monthDays: monthDays,
        onError: onError,
        weekDays: weekDays,
        monthList: monthList,
        yearList: yearList
    });

    class LoyaltyProgram {
        constructor(origin, destination, month, year) {
            this.origin = origin;
            this.destination = destination;
            this.month = month;
            this.year = year;
        }
        // TODO: this should belongs to Calendar component
        fillCalendarFares(fares, date) {
            let totalDays = date.monthDays();
            // if (fares.calendarDayList && fares.calendarDayList.length < totalDays) { // TODO: fix this restriction?
            //     onError('Smiles não retornou tarifa para todos os dias do mês', null, fares);
            //     return;
            // }
            for (let day = 1; day <= totalDays; day++) {
                if (fares.calendarDayList[day - 1] && fares.calendarDayList[day - 1].miles) {
                    let tdDay = document.getElementById('day' + day);
                    let divMiles = tdDay.getElementsByClassName('miles')[0];
                    let divSmiles = divMiles.getElementsByClassName('smiles')[0];
                    let spanMiles = divMiles.getElementsByClassName('currency')[0];
                    let newFare = fares.calendarDayList[day - 1].miles;
                    spanMiles.innerText = 'milhas';
                    /*if (divSmiles.innerText) {
                        let divToolTip = divMiles.querySelector('.tooltiptext') as HTMLSpanElement;
                        if (!divToolTip) {
                            divToolTip = document.createElement('div');
                            divToolTip.classList.add('tooltiptext');
                            divSmiles.appendChild(divToolTip);
                        }
                        let spanToolTip = document.createElement('span');

                        if (parseInt(divSmiles.innerText) < newFare) {
                            spanToolTip.innerText = divSmiles.innerText;
                            divSmiles.innerText = newFare.toString();
                        }
                        else {
                            spanToolTip.innerText = newFare.toString();
                        }

                        divToolTip.appendChild(spanToolTip);
                        divToolTip.appendChild(document.createElement('br'));
                    }
                    else */
                    {
                        divSmiles.innerText = newFare.toString();
                    }
                    if (fares.calendarDayList[day - 1].isLowestPrice)
                        divSmiles.classList.add('best-smiles');
                    tdDay.setAttribute('onclick', `window.open('${this.dailyFareUrl(new Date(date.getFullYear(), date.getMonth(), day))}', 
                    '_blank');`);
                }
            }
        }
    }

    class Smiles extends LoyaltyProgram {
        constructor(origin, destination, month, year) {
            super(origin, destination, month, year);
            this.localResultUrl = './test-result.json';
        }
        searchFares(isTesting = false) {
            let url = isTesting ? this.localResultUrl : this.monthlyFaresUrl();
            let selectedDate = new Date(this.year, this.month);
            fetch(url)
                .then(async (response) => {
                console.log('Http request ok.');
                return await response.json();
            })
                .then(result => {
                var _a;
                if (result.hasCalendar == false || result.calendarStatus != 'ENABLED' || ((_a = result.calendarSegmentList) === null || _a === void 0 ? void 0 : _a.length) != 1) {
                    console.dir(result);
                    onError('Não foi possível obter dados da smiles.');
                    return;
                }
                console.log('Json parse ok.');
                var monthlyFares = result.calendarSegmentList[0];
                this.fillCalendarFares(monthlyFares, selectedDate);
                //addMonthArrows(currentDate);
            })
                .catch(e => onError('Boo...\n' + e, e));
        }
        monthlyFaresUrl() {
            let nextMonth = this.month + 1;
            let nextYear = this.year;
            if (this.month > 12) {
                nextMonth = 1;
                nextYear = nextYear + 1;
            }
            let day = 1;
            let today = new Date();
            if (today > new Date(this.year, this.month))
                day = today.getDate();
            let Number = Intl.NumberFormat('pt-BR', { minimumIntegerDigits: 2 });
            const monthlyFareUrl = 'https://api-air-calendar-prd.smiles.com.br/v1/airlines/calendar/month' +
                `?originAirportCode=${this.origin}&destinationAirportCode=${this.destination}` + // airport code
                `&startDate=${this.year}-${Number.format(this.month + 1)}-${Number.format(day)}` + // start date
                `&endDate=${nextYear}-${Number.format(nextMonth + 1)}-01` + // end date
                `&departureDate=${this.year}-${Number.format(this.month + 1)}-${today.monthDays()}` + // selected date
                '&adults=1&children=0&infants=0&forceCongener=false&cabin=ALL&bestFare=true&memberNumber=';
            return monthlyFareUrl;
        }
        dailyFareUrl(urlDate) {
            const dailyFareUrl = 'https://www.smiles.com.br/emissao-com-milhas?tripType=2&isFlexibleDateChecked=false&cabin=ALL&adults=1&segments=1&children=0&infants=0&searchType=congenere&segments=1' +
                `&originAirport=${this.origin}&destinationAirport=${this.destination}` +
                `&departureDate=${new Date(urlDate).getTime()}`;
            return dailyFareUrl;
        }
    }

    /* src\Calendar.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\Calendar.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let h1;
    	let a0;
    	let t1;
    	let span0;
    	let t2;
    	let span1;
    	let t3;
    	let a1;
    	let t5;
    	let div2;
    	let div1;
    	let table;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			a0.textContent = "🡨";
    			t1 = space();
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "🡪";
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			table = element("table");
    			attr_dev(a0, "id", "left");
    			attr_dev(a0, "class", "left-arrow");
    			add_location(a0, file$1, 137, 8, 5802);
    			attr_dev(span0, "id", "month");
    			add_location(span0, file$1, 138, 8, 5850);
    			attr_dev(span1, "id", "year");
    			add_location(span1, file$1, 139, 8, 5879);
    			attr_dev(a1, "id", "right");
    			attr_dev(a1, "class", "right-arrow");
    			add_location(a1, file$1, 140, 8, 5907);
    			attr_dev(h1, "class", "calendar-title");
    			add_location(h1, file$1, 136, 4, 5765);
    			add_location(div0, file$1, 135, 0, 5754);
    			attr_dev(table, "class", "calendar-table");
    			add_location(table, file$1, 145, 8, 6012);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$1, 144, 4, 5988);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$1, 143, 0, 5968);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(h1, a0);
    			append_dev(h1, t1);
    			append_dev(h1, span0);
    			append_dev(h1, t2);
    			append_dev(h1, span1);
    			append_dev(h1, t3);
    			append_dev(h1, a1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendar', slots, []);

    	onMount(async () => {
    		if (["localhost", "127.0.0.1"].some(x => window.location.href.includes(x))) {
    			$$invalidate(0, isRunningLocally = true);
    		}

    		Main();
    	});

    	let { origin } = $$props;
    	let { destination } = $$props;
    	let { month } = $$props;
    	let { year } = $$props;
    	let { isRunningLocally } = $$props;
    	let currentSelectedDate;
    	let smiles;

    	function Main() {
    		validateInput(true);
    		let selectedDate = new Date(year, month);
    		generateCalendar(selectedDate);
    	}

    	function searchFares(eventArg, originAirport, destinationAirport, selectedMonth, selectedYear) {
    		var _a, _b;

    		originAirport = originAirport !== null && originAirport !== void 0
    		? originAirport
    		: origin;

    		destinationAirport = destinationAirport !== null && destinationAirport !== void 0
    		? destinationAirport
    		: destination;

    		selectedMonth = selectedMonth !== null && selectedMonth !== void 0
    		? selectedMonth
    		: month;

    		selectedYear = selectedYear !== null && selectedYear !== void 0
    		? selectedYear
    		: year;

    		if (currentSelectedDate.getFullYear() != selectedYear || currentSelectedDate.getMonth() != selectedMonth) generateCalendar(new Date(selectedYear, selectedMonth));
    		let isTesting = false;

    		if ((_b = (_a = document.getElementById("isTesting")) === null || _a === void 0
    		? void 0
    		: _a.checked) !== null && _b !== void 0
    		? _b
    		: false) {
    			isTesting = true;
    			console.warn("Reading from local json file");
    		}

    		smiles = new Smiles(originAirport, destinationAirport, selectedMonth, selectedYear);
    		smiles.searchFares(isTesting);
    	}

    	function generateCalendar(selectedDate) {
    		currentSelectedDate = selectedDate;
    		let firstWeekday = new Date(selectedDate.getFullYear(), selectedDate.getMonth()).getDay();
    		let calendarTable = document.querySelector(".calendar-table");
    		let calendarBody = document.querySelector(".calendar-table>tbody");
    		if (calendarBody) calendarTable.innerHTML = "";
    		let calendarHead = document.createElement("thead");
    		let tr = document.createElement("tr");

    		weekDays.map(weekDay => {
    			let th = document.createElement("th");
    			th.innerText = weekDay;
    			tr.appendChild(th);
    		});

    		calendarHead.appendChild(tr);
    		calendarTable.appendChild(calendarHead);
    		calendarBody = document.createElement("tbody");
    		let totalDays = selectedDate.monthDays();
    		let day = 1;

    		for (let i = 1; i <= 6; i++) {
    			if (day > totalDays) continue;
    			tr = document.createElement("tr");

    			for (let j = 0; j < 7; j++) {
    				let td = document.createElement("td");

    				if (day > totalDays) {
    					td.innerHTML = "&nbsp;";
    				} else {
    					if (i === 1 && j < firstWeekday) {
    						td.innerHTML = "&nbsp;";
    					} else {
    						td.innerText = day.toString();
    						td.id = "day" + day;
    						let divMiles = document.createElement("div");
    						let spanMiles = document.createElement("span");
    						spanMiles.classList.add("currency");
    						let divSmiles = document.createElement("div");
    						divSmiles.classList.add("smiles");

    						// divSmiles.classList.add("tooltip");
    						divMiles.classList.add("miles");

    						divMiles.appendChild(divSmiles);
    						divMiles.appendChild(spanMiles);
    						td.appendChild(divMiles);
    						td.classList.add("day");
    						day++;
    					}
    				}

    				tr.appendChild(td);
    			}

    			calendarBody.appendChild(tr);
    		}

    		calendarTable.appendChild(calendarBody);
    		document.getElementById("month").textContent = monthList[selectedDate.getMonth()].text;
    		document.getElementById("year").textContent = selectedDate.getFullYear().toString();
    	}

    	function addMonthArrows(currentDate) {
    		document.getElementById("left").onclick = () => {
    			if (currentDate.getMonth() === 0) currentDate = new Date(currentDate.getFullYear() - 1, 11); else currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    			searchFares(null, origin, destination, currentDate.getMonth() + 1, currentDate.getFullYear());
    		};

    		document.getElementById("right").onclick = () => {
    			if (currentDate.getMonth() === 11) currentDate = new Date(currentDate.getFullYear() + 1, 0); else currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    			searchFares(null, origin, destination, currentDate.getMonth() + 1, currentDate.getFullYear());
    		};
    	}

    	function validateInput(throwError) {
    		let errorMessages = [];
    		let upperCase = /^[A-Z]+$/;
    		if (!origin || origin.length != 3 || !upperCase.test(origin)) errorMessages.push("Aeroporto de origem não informado corretamente.");
    		if (!destination || destination.length != 3 || !upperCase.test(destination)) errorMessages.push("Aeroporto de origem não informado corretamente.");

    		if (throwError) {
    			if (errorMessages === null || errorMessages === void 0
    			? void 0
    			: errorMessages.some(e => e)) {
    				errorMessages.map(error => console.warn(error));
    				alert(errorMessages.join(" "));
    				return false;
    			}
    		}

    		return errorMessages;
    	}

    	const writable_props = ['origin', 'destination', 'month', 'year', 'isRunningLocally'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('origin' in $$props) $$invalidate(1, origin = $$props.origin);
    		if ('destination' in $$props) $$invalidate(2, destination = $$props.destination);
    		if ('month' in $$props) $$invalidate(3, month = $$props.month);
    		if ('year' in $$props) $$invalidate(4, year = $$props.year);
    		if ('isRunningLocally' in $$props) $$invalidate(0, isRunningLocally = $$props.isRunningLocally);
    	};

    	$$self.$capture_state = () => ({
    		Smiles,
    		onMount,
    		util,
    		origin,
    		destination,
    		month,
    		year,
    		isRunningLocally,
    		currentSelectedDate,
    		smiles,
    		Main,
    		searchFares,
    		generateCalendar,
    		addMonthArrows,
    		validateInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('origin' in $$props) $$invalidate(1, origin = $$props.origin);
    		if ('destination' in $$props) $$invalidate(2, destination = $$props.destination);
    		if ('month' in $$props) $$invalidate(3, month = $$props.month);
    		if ('year' in $$props) $$invalidate(4, year = $$props.year);
    		if ('isRunningLocally' in $$props) $$invalidate(0, isRunningLocally = $$props.isRunningLocally);
    		if ('currentSelectedDate' in $$props) currentSelectedDate = $$props.currentSelectedDate;
    		if ('smiles' in $$props) smiles = $$props.smiles;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isRunningLocally, origin, destination, month, year, Main, searchFares];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			origin: 1,
    			destination: 2,
    			month: 3,
    			year: 4,
    			isRunningLocally: 0,
    			Main: 5,
    			searchFares: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*origin*/ ctx[1] === undefined && !('origin' in props)) {
    			console_1.warn("<Calendar> was created without expected prop 'origin'");
    		}

    		if (/*destination*/ ctx[2] === undefined && !('destination' in props)) {
    			console_1.warn("<Calendar> was created without expected prop 'destination'");
    		}

    		if (/*month*/ ctx[3] === undefined && !('month' in props)) {
    			console_1.warn("<Calendar> was created without expected prop 'month'");
    		}

    		if (/*year*/ ctx[4] === undefined && !('year' in props)) {
    			console_1.warn("<Calendar> was created without expected prop 'year'");
    		}

    		if (/*isRunningLocally*/ ctx[0] === undefined && !('isRunningLocally' in props)) {
    			console_1.warn("<Calendar> was created without expected prop 'isRunningLocally'");
    		}
    	}

    	get origin() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set origin(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destination() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destination(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRunningLocally() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRunningLocally(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Main() {
    		return this.$$.ctx[5];
    	}

    	set Main(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFares() {
    		return this.$$.ctx[6];
    	}

    	set searchFares(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (32:5) {#each monthList as month}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*month*/ ctx[15].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*month*/ ctx[15].value;
    			option.value = option.__value;
    			add_location(option, file, 32, 6, 845);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(32:5) {#each monthList as month}",
    		ctx
    	});

    	return block;
    }

    // (40:5) {#each yearList as year}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*year*/ ctx[12] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*year*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file, 40, 6, 1040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:5) {#each yearList as year}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if isRunningLocally}
    function create_if_block(ctx) {
    	let input;
    	let t0;
    	let label;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = text(" \r\n\t\t\t\t\t");
    			label = element("label");
    			label.textContent = "Local only";
    			attr_dev(input, "type", "checkbox");
    			input.checked = true;
    			attr_dev(input, "id", "isTesting");
    			add_location(input, file, 72, 5, 1837);
    			attr_dev(label, "for", "isTesting");
    			add_location(label, file, 73, 5, 1898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:4) {#if isRunningLocally}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let header;
    	let h1;
    	let t1;
    	let p0;
    	let a0;
    	let t3;
    	let ul;
    	let li;
    	let a1;
    	let t4;
    	let strong;
    	let t6;
    	let section;
    	let div2;
    	let div1;
    	let t7;
    	let select0;
    	let t8;
    	let select1;
    	let t9;
    	let br0;
    	let t10;
    	let label0;
    	let t12;
    	let input0;
    	let t13;
    	let br1;
    	let t14;
    	let label1;
    	let t16;
    	let div0;
    	let input1;
    	let t17;
    	let input2;
    	let t18;
    	let br2;
    	let br3;
    	let t19;
    	let button;
    	let t21;
    	let br4;
    	let t22;
    	let t23;
    	let calendar_1;
    	let updating_isRunningLocally;
    	let t24;
    	let footer;
    	let p1;
    	let t25;
    	let a2;
    	let t27;
    	let p2;
    	let t28;
    	let a3;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = monthList;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = yearList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*isRunningLocally*/ ctx[5] && create_if_block(ctx);

    	function calendar_1_isRunningLocally_binding(value) {
    		/*calendar_1_isRunningLocally_binding*/ ctx[11](value);
    	}

    	let calendar_1_props = {
    		origin: /*orginAirportInput*/ ctx[0],
    		destination: /*destinationAirportInput*/ ctx[1],
    		month: /*monthInput*/ ctx[2],
    		year: /*yearInput*/ ctx[3]
    	};

    	if (/*isRunningLocally*/ ctx[5] !== void 0) {
    		calendar_1_props.isRunningLocally = /*isRunningLocally*/ ctx[5];
    	}

    	calendar_1 = new Calendar({ props: calendar_1_props, $$inline: true });
    	/*calendar_1_binding*/ ctx[10](calendar_1);
    	binding_callbacks.push(() => bind(calendar_1, 'isRunningLocally', calendar_1_isRunningLocally_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "MyFlightFinder ✈️";
    			t1 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "View the Project on GitHub";
    			t3 = space();
    			ul = element("ul");
    			li = element("li");
    			a1 = element("a");
    			t4 = text("View On ");
    			strong = element("strong");
    			strong.textContent = "GitHub";
    			t6 = space();
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			t7 = text("Data:\r\n\t\t\t\t");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			br0 = element("br");
    			t10 = space();
    			label0 = element("label");
    			label0.textContent = "Aeroporto origem:";
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			br1 = element("br");
    			t14 = space();
    			label1 = element("label");
    			label1.textContent = "Aeroporto destino:";
    			t16 = space();
    			div0 = element("div");
    			input1 = element("input");
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t19 = space();
    			button = element("button");
    			button.textContent = "Pesquisar";
    			t21 = space();
    			br4 = element("br");
    			t22 = space();
    			if (if_block) if_block.c();
    			t23 = space();
    			create_component(calendar_1.$$.fragment);
    			t24 = space();
    			footer = element("footer");
    			p1 = element("p");
    			t25 = text("Project maintained by\r\n\t\t");
    			a2 = element("a");
    			a2.textContent = "dandandandaann";
    			t27 = space();
    			p2 = element("p");
    			t28 = text("Hosted on GitHub Pages — Theme by\r\n\t\t");
    			a3 = element("a");
    			a3.textContent = "orderedlist";
    			add_location(h1, file, 12, 2, 345);
    			attr_dev(a0, "href", "https://github.com/dandandandaann/MyFlightFinder");
    			add_location(a0, file, 14, 3, 396);
    			attr_dev(p0, "class", "view");
    			add_location(p0, file, 13, 2, 375);
    			add_location(strong, file, 21, 14, 601);
    			attr_dev(a1, "href", "https://github.com/dandandandaann/MyFlightFinder");
    			add_location(a1, file, 20, 4, 527);
    			add_location(li, file, 19, 3, 517);
    			add_location(ul, file, 18, 2, 508);
    			attr_dev(header, "class", "without-description");
    			add_location(header, file, 11, 1, 305);
    			set_style(select0, "width", "100px");
    			if (/*monthInput*/ ctx[2] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file, 30, 4, 750);
    			set_style(select1, "width", "100px");
    			if (/*yearInput*/ ctx[3] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file, 38, 4, 948);
    			add_location(br0, file, 43, 4, 1111);
    			attr_dev(label0, "for", "searchOrigin");
    			add_location(label0, file, 44, 4, 1123);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "maxlength", "3");
    			attr_dev(input0, "id", "originAirportCode");
    			set_style(input0, "width", "80px");
    			add_location(input0, file, 45, 4, 1180);
    			add_location(br1, file, 52, 4, 1331);
    			attr_dev(label1, "for", "searchDestination");
    			add_location(label1, file, 53, 4, 1343);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "searchDestination");
    			set_style(input1, "width", "200px");
    			add_location(input1, file, 55, 5, 1441);
    			set_style(div0, "display", "none");
    			add_location(div0, file, 54, 4, 1406);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "maxlength", "3");
    			attr_dev(input2, "id", "destinationAirportCode");
    			set_style(input2, "width", "80px");
    			add_location(input2, file, 61, 4, 1552);
    			add_location(br2, file, 68, 4, 1714);
    			add_location(br3, file, 68, 10, 1720);
    			add_location(button, file, 69, 4, 1732);
    			add_location(br4, file, 70, 4, 1796);
    			attr_dev(div1, "class", "input-settings");
    			add_location(div1, file, 28, 3, 705);
    			attr_dev(div2, "id", "calendar");
    			add_location(div2, file, 27, 2, 681);
    			add_location(section, file, 26, 1, 668);
    			attr_dev(div3, "class", "wrapper");
    			add_location(div3, file, 10, 0, 281);
    			attr_dev(a2, "href", "https://github.com/dandandandaann");
    			add_location(a2, file, 91, 2, 2236);
    			add_location(p1, file, 89, 1, 2204);
    			attr_dev(a3, "href", "https://github.com/orderedlist");
    			add_location(a3, file, 95, 2, 2352);
    			add_location(p2, file, 93, 1, 2308);
    			add_location(footer, file, 88, 0, 2193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, p0);
    			append_dev(p0, a0);
    			append_dev(header, t3);
    			append_dev(header, ul);
    			append_dev(ul, li);
    			append_dev(li, a1);
    			append_dev(a1, t4);
    			append_dev(a1, strong);
    			append_dev(div3, t6);
    			append_dev(div3, section);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t7);
    			append_dev(div1, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*monthInput*/ ctx[2]);
    			append_dev(div1, t8);
    			append_dev(div1, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*yearInput*/ ctx[3]);
    			append_dev(div1, t9);
    			append_dev(div1, br0);
    			append_dev(div1, t10);
    			append_dev(div1, label0);
    			append_dev(div1, t12);
    			append_dev(div1, input0);
    			set_input_value(input0, /*orginAirportInput*/ ctx[0]);
    			append_dev(div1, t13);
    			append_dev(div1, br1);
    			append_dev(div1, t14);
    			append_dev(div1, label1);
    			append_dev(div1, t16);
    			append_dev(div1, div0);
    			append_dev(div0, input1);
    			append_dev(div1, t17);
    			append_dev(div1, input2);
    			set_input_value(input2, /*destinationAirportInput*/ ctx[1]);
    			append_dev(div1, t18);
    			append_dev(div1, br2);
    			append_dev(div1, br3);
    			append_dev(div1, t19);
    			append_dev(div1, button);
    			append_dev(div1, t21);
    			append_dev(div1, br4);
    			append_dev(div1, t22);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div2, t23);
    			mount_component(calendar_1, div2, null);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p1);
    			append_dev(p1, t25);
    			append_dev(p1, a2);
    			append_dev(footer, t27);
    			append_dev(footer, p2);
    			append_dev(p2, t28);
    			append_dev(p2, a3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[6]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*calendar*/ ctx[4].searchFares)) /*calendar*/ ctx[4].searchFares.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*monthList*/ 0) {
    				each_value_1 = monthList;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*monthInput, monthList*/ 4) {
    				select_option(select0, /*monthInput*/ ctx[2]);
    			}

    			if (dirty & /*yearList*/ 0) {
    				each_value = yearList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*yearInput, yearList*/ 8) {
    				select_option(select1, /*yearInput*/ ctx[3]);
    			}

    			if (dirty & /*orginAirportInput*/ 1 && input0.value !== /*orginAirportInput*/ ctx[0]) {
    				set_input_value(input0, /*orginAirportInput*/ ctx[0]);
    			}

    			if (dirty & /*destinationAirportInput*/ 2 && input2.value !== /*destinationAirportInput*/ ctx[1]) {
    				set_input_value(input2, /*destinationAirportInput*/ ctx[1]);
    			}

    			if (/*isRunningLocally*/ ctx[5]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const calendar_1_changes = {};
    			if (dirty & /*orginAirportInput*/ 1) calendar_1_changes.origin = /*orginAirportInput*/ ctx[0];
    			if (dirty & /*destinationAirportInput*/ 2) calendar_1_changes.destination = /*destinationAirportInput*/ ctx[1];
    			if (dirty & /*monthInput*/ 4) calendar_1_changes.month = /*monthInput*/ ctx[2];
    			if (dirty & /*yearInput*/ 8) calendar_1_changes.year = /*yearInput*/ ctx[3];

    			if (!updating_isRunningLocally && dirty & /*isRunningLocally*/ 32) {
    				updating_isRunningLocally = true;
    				calendar_1_changes.isRunningLocally = /*isRunningLocally*/ ctx[5];
    				add_flush_callback(() => updating_isRunningLocally = false);
    			}

    			calendar_1.$set(calendar_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendar_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendar_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			/*calendar_1_binding*/ ctx[10](null);
    			destroy_component(calendar_1);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	var orginAirportInput = "GRU";
    	var destinationAirportInput = "LIS";
    	var monthInput = 8;
    	var yearInput = 2022;
    	let calendar;
    	let isRunningLocally = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		monthInput = select_value(this);
    		$$invalidate(2, monthInput);
    	}

    	function select1_change_handler() {
    		yearInput = select_value(this);
    		$$invalidate(3, yearInput);
    	}

    	function input0_input_handler() {
    		orginAirportInput = this.value;
    		$$invalidate(0, orginAirportInput);
    	}

    	function input2_input_handler() {
    		destinationAirportInput = this.value;
    		$$invalidate(1, destinationAirportInput);
    	}

    	function calendar_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			calendar = $$value;
    			$$invalidate(4, calendar);
    		});
    	}

    	function calendar_1_isRunningLocally_binding(value) {
    		isRunningLocally = value;
    		$$invalidate(5, isRunningLocally);
    	}

    	$$self.$capture_state = () => ({
    		Calendar,
    		monthList,
    		yearList,
    		orginAirportInput,
    		destinationAirportInput,
    		monthInput,
    		yearInput,
    		calendar,
    		isRunningLocally
    	});

    	$$self.$inject_state = $$props => {
    		if ('orginAirportInput' in $$props) $$invalidate(0, orginAirportInput = $$props.orginAirportInput);
    		if ('destinationAirportInput' in $$props) $$invalidate(1, destinationAirportInput = $$props.destinationAirportInput);
    		if ('monthInput' in $$props) $$invalidate(2, monthInput = $$props.monthInput);
    		if ('yearInput' in $$props) $$invalidate(3, yearInput = $$props.yearInput);
    		if ('calendar' in $$props) $$invalidate(4, calendar = $$props.calendar);
    		if ('isRunningLocally' in $$props) $$invalidate(5, isRunningLocally = $$props.isRunningLocally);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		orginAirportInput,
    		destinationAirportInput,
    		monthInput,
    		yearInput,
    		calendar,
    		isRunningLocally,
    		select0_change_handler,
    		select1_change_handler,
    		input0_input_handler,
    		input2_input_handler,
    		calendar_1_binding,
    		calendar_1_isRunningLocally_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
