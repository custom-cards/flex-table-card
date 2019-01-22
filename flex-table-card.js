
/** some helper functions, mmmh, am I the only one needing those? Am I doing something wrong? */
// typical [[1,2,3], [6,7,8]] to [[1, 6], [2, 7], [3, 8]] converter
transpose = m => m[0].map((x, i) => m.map(x => x[i]));

// single items -> Array with item with length == 1
listify = obj => ((obj instanceof Array) ? obj : [obj]);

// simply return the args, which were passed, mmh not needed anymore here...
//pipe = (...args) => args

// a map function, which splits args to multiple vars, python-like
//mmap = 

// omg, js is still very broken, trouble comparing strings? 80s? plain-C? wtf!
var compare = function(a, b) {
    if (typeof a == "string")
        return a.localeCompare(b);
    else if (typeof b == "string")
        return -1 * b.localeCompare(a);
    else
        return a - b;
}

/** flex-table data representation and keeper */
class DataTable {
    constructor(cfg) {
        this.cols = cfg.columns;
        this.cfg = cfg;

        this.col_ids = this.cols.map(col => col.prop || col.attr || col.attr_as_list);
        this.headers = this.cols.filter(col => !col.hidden).map((col, idx) =>
            col.name || this.col_ids[idx]);

        this.rows = [];
    }

    add(...rows) {
        this.rows.push(...rows.map(row => row.render_data(this.cols)));
    }

    clear_rows() {
        this.rows = [];
    }

    get_rows() {
        // sorting is allowed asc/desc for one column
        if (this.cfg.sort_by) {
            let sort_col = this.cfg.sort_by;
            let sort_dir = 1;
            if (sort_col) {
                if (["-", "+"].includes(sort_col.slice(-1))) {
                    // "-" => descending, "+" => ascending
                    sort_dir = ((sort_col.slice(-1)) == "-") ? -1 : +1;
                    sort_col = sort_col.slice(0, -1);
                }
            }

            // determine col-by-idx to be sorted with...
            var sort_idx = this.cols.findIndex((col) => 
                ["attr", "prop", "attr_as_list"].some(attr => 
                    attr in col && sort_col == col[attr]));

            // if applicable sort according to config
            if (sort_idx > -1)
                this.rows.sort((x, y) => sort_dir * compare(x.data[sort_idx], y.data[sort_idx]));
            else
                console.error(`config.sort_by: ${this.cfg.sort_by}, but column not found!`);
        }
        // mark rows to be hidden due to 'strict' property
        this.rows = this.rows.filter(row => !row.hidden);

        // truncate shown rows to 'max rows', if configured
        if ("max_rows" in this.cfg && this.cfg.max_rows > -1)
            this.rows = this.rows.slice(0, this.cfg.max_rows);

        return this.rows;
    }
}

/** One level down, data representation for each row (including all cells) */
class DataRow { 
    constructor(entity, strict, raw_data=null) {
        this.entity = entity;
        this.hidden = false;
        this.strict = strict;
        this.raw_data = raw_data;
        this.data = null;
        this.has_multiple = false;
    } 

    get_raw_data(col_cfgs) {
        this.raw_data = col_cfgs.map((col) => {			
            if ("attr" in col) {
                return ((col.attr in this.entity.attributes) ?
                    this.entity.attributes[col.attr] : null);

            } else if ("prop" in col) {
                // 'object_id' and 'name' not working -> make them work:
                if (col.prop == "object_id") {
                    return this.entity.entity_id.split(".").slice(1).join(".");

                    // 'name' automagically resolves to most verbose name
                } else if (col.prop == "name") {
                    if ("friendly_name" in this.entity.attributes)
                        return this.entity.attributes.friendly_name;
                    else if ("name" in this.entity)
                        return this.entity.name;
                    else if ("name" in this.entity.attributes)
                        return this.entity.attributes.name;
                    else
                        return this.entity.entity_id;

                    // other state properties seem to work as expected...
                } else
                    return ((col.prop in this.entity) ? this.entity[col.prop] : null);

            } else if ("attr_as_list" in col) {
                this.has_multiple = true;
                return this.entity.attributes[col.attr_as_list];

            } else 
                console.error(`no selector found for col: ${col.name} - skipping...`);
            return null;
        });
    }

    render_data(col_cfgs) {
        // apply passed "modify" configuration setting by using eval()
        // assuming the data is available inside the function as "x"
        this.data = this.raw_data.map((raw, idx) => {
            if (raw === "undefined" || typeof raw === "undefined" || raw === null) 
                return ((this.strict) ? null : "n/a");
            let x = raw;
            return (col_cfgs[idx].modify) ? eval(col_cfgs[idx].modify) : x;
        });

        this.hidden = this.data.some(data => (data === null));
        return this;
    }
}


/** The HTMLElement, which is used as a base for the Lovelace custom card */
class FlexTableCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.card_height = 1;
        this.tbl = null;
    }

    _getRegEx(pats, invert=false) {
        // compile and convert wildcardish-regex to real RegExp
        const real_pats = pats.map((pat) => pat.replace(/\*/g, '.*'));
        const merged = real_pats.map((pat) => `(${pat})`).join("|");
        if (invert)
            return new RegExp(`^(?:(?!${merged}).)*$`, 'gi');
        else 
            return new RegExp(`^${merged}$`, 'gi');
    }

    _getEntities(hass, incl, excl) {
        // apply inclusion regex
        const incl_re = listify(incl).map(pat => this._getRegEx([pat])); 
        // make sure to respect the incl-implied order: no (incl-)regex-stiching, collect 
        // results for each include and finally reduce to a single list of state-keys
        let keys = incl_re.map((regex) => 
            Object.keys(hass.states).filter(e_id => e_id.match(regex))).
                reduce((out, item) => out.concat(item), []);
        if (excl) {
            // apply exclusion, if applicable (here order is not affecting the output(s))
            const excl_re = this._getRegEx(listify(excl), true);
            keys = keys.filter(e_id => e_id.match(excl_re));
        }
        return keys.map(key => hass.states[key]);
    }

    setConfig(config) {
        // get & keep card-config and hass-interface
        const root = this.shadowRoot;
        if (root.lastChild) 
            root.removeChild(root.lastChild);

        const cfg = Object.assign({}, config);

        // assemble html 
        const card = document.createElement('ha-card');
        card.header = cfg.title;
        const content = document.createElement('div');
        const style = document.createElement('style');

        this.tbl = new DataTable(cfg);

        // some css style
        style.textContent = `
                        table {
                                width: 100%;
                                padding: 16px;
                        }
                        thead th { text-align: left; }
                        tbody tr:nth-child(odd)  { background-color: var(--paper-card-background-color); }
                        tbody tr:nth-child(even) { background-color: var(--secondary-background-color);  }
                `;
        // table skeleton, body identified with: 'flextbl'
        content.innerHTML = `
                <table>
                    <thead>
                        <tr>${this.tbl.headers.map((name) => `<th>${name}</th>`).join("")}</tr>
                    </thead>
                    <tbody id='flextbl'></tbody>
                </table>
                `;
        card.appendChild(style);
        card.appendChild(content);
        root.appendChild(card)
        this._config = cfg;
    }

    _updateContent(element, rows) {
        // callback for updating the cell-contents
        element.innerHTML = rows.map((row) => 
            `<tr id="entity_row_${row.entity.entity_id}">${row.data.map((cell) => 
                `<td>${cell}</td>`).join("")}</tr>`).join("");

        // if configured, set clickable row to show entity popup-dialog
        rows.forEach(row => {
            const elem = this.shadowRoot.getElementById(`entity_row_${row.entity.entity_id}`);
            // bind click()-handler to row (if configured)
            elem.onclick = (this.tbl.cfg.clickable) ? (function(clk_ev) {
                // create and fire 'details-view' signal
                let ev = new Event("hass-more-info", {
                    bubbles: true, cancelable: false, composed: true 
                });
                ev.detail = { entityId: row.entity.entity_id };
                this.dispatchEvent(ev);
            }) : null;
        });
    }

    set hass(hass) {
        const config = this._config;
        const root = this.shadowRoot;

        // get "data sources / origins" i.e, entities
        let entities = this._getEntities(hass, config.entities.include, config.entities.exclude);

        // `raw_rows` to be filled with data here, due to 'attr_as_list' it is possible to have
        // multiple data `raw_rows` acquired into one cell(.raw_data), so re-iterate all rows
        // to---if applicable---spawn new DataRow objects for these accordingly
        let raw_rows = entities.map(e => new DataRow(e, config.strict));
        raw_rows.forEach(e => e.get_raw_data(config.columns))

        // now add() the raw_data rows to the DataTable
        this.tbl.clear_rows();
        raw_rows.forEach(row_obj => {
            if (!row_obj.has_multiple)
                this.tbl.add(row_obj);
            else
                this.tbl.add(...transpose(row_obj.raw_data).map(new_raw_data => 
                    new DataRow(row_obj.entity, row_obj.strict, new_raw_data)));
        });

        // finally set card height and insert card
        this._setCardSize(this.tbl.rows.length);
        // all preprocessing / rendering will be done here inside DataTable::get_rows()
        this._updateContent(root.getElementById('flextbl'), this.tbl.get_rows());
    }

    _setCardSize(num_rows) {
        this.card_height = parseInt(num_rows * 0.5);
    }

    getCardSize() {
        return this.card_height;
    }
}

customElements.define('flex-table-card', FlexTableCard);
