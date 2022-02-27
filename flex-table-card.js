"use strict";

// VERSION info
var VERSION = "0.7.1";

// typical [[1,2,3], [6,7,8]] to [[1, 6], [2, 7], [3, 8]] converter
var transpose = m => m[0].map((x, i) => m.map(x => x[i]));

// single items -> Array with item with length == 1
var listify = obj => ((obj instanceof Array) ? obj : [obj]);

// mk - added sorting for numbers and IP addresses
var compare = function(a, b) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(a)){
		var a1 = a.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
		if (b === null)
			var b1 = 0
		else
			var b1 = b.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
        return (a1 - b1);
	}   else if (isNaN(a))
        return a.toString().localeCompare(b);
    else if (isNaN(b))
        return -1 * b.toString().localeCompare(a);
	else
        return parseFloat(a) - parseFloat(b);
}

// version(string) compare
function compareVersion(vers1, vers2) {
    // only accept strings as versions
    if (typeof vers1 !== "string")
        return false;
    if (typeof vers2 !== "string")
        return false;
    vers1 = vers1.split(".");
    vers2 = vers2.split(".");
    // iterate in parallel from left-most (major version part) to right-most (minor version part)
    for (let i=0; i<Math.min(vers1.length, vers2.length); ++i) {
        vers1[i] = parseInt(vers1[i], 10);
        vers2[i] = parseInt(vers2[i], 10);
        if (vers1[i] > vers2[i])
            return 1;
        if (vers1[i] < vers2[i])
            return -1;
        // else (both are equal, continue to next minor-er version token)
    }
    // if this point is reached, return 0 (equal) if lengths are equal, otherwise the one with
    // more minor version numbers is considered 'newer'
    return (vers1.length == vers2.length) ? 0 : (vers1.length < vers2.length ? -1 : 1);
}

class CellFormatters {
    constructor() {
        this.failed = false;
    }
    number(data) {
        return parseFloat(data) || null;
    }
    full_datetime(data) {
        return Date.parse(data);
    }
    hours_passed(data) {
        return Math.round((Date.now() - Date.parse(data)) / 36000.) / 100;
    }
    hours_mins_passed(data) {
        const hourDiff = (Date.now() - Date.parse(data));
        //const secDiff = hourDiff / 1000;
        const minDiff = hourDiff / 60 / 1000;
        const hDiff = hourDiff / 3600 / 1000;
        const hours = Math.floor(hDiff);
        const minutes = minDiff - 60 * hours;
        const minr = Math.floor(minutes);
        return (!isNaN(hours) && !isNaN(minr)) ? hours + " hours " + minr + " minutes" : null;
    }
    

}


/** flex-table data representation and keeper */
class DataTable {
    constructor(cfg) {
        this.cols = cfg.columns;
        this.cfg = cfg;

        this.col_ids = this.cols.map(col => col.prop || col.attr || col.attr_as_list);

        this.headers = this.cols.filter(col => !col.hidden).map(
            (col, idx) => new Object({
                // if no 'col.name' use 'col_ids[idx]' only if there is no col.icon set!
                name: col.name || ((!col.icon) ? this.col_ids[idx] : ""),
                icon: col.icon || null
            }));

        this.rows = [];
    }

    add(...rows) {
        this.rows.push(...rows.map(row => row.render_data(this.cols)));
    }

    clear_rows() {
        this.rows = [];
    }

    is_empty() {
      return (this.rows.length == 0);
    }

    get_rows() {
        // sorting is allowed asc/desc for one column
        if (this.cfg.sort_by) {
            let sort_cols = listify(this.cfg.sort_by);
            
            let sort_conf = sort_cols.map((sort_col) => {
                let out = { dir: 1, col: sort_col, idx: null };
                if (["-", "+"].includes(sort_col.slice(-1))) {
                    // "-" => descending, "+" => ascending
                    out.dir = (((sort_col.slice(-1)) == "-") ? -1 : +1);
                    out.col = sort_col.slice(0, -1);
                }
                // DEPRECATION CHANGES ALSO TO BE DONE HERE:
                // determine col-by-idx to be sorted with...
                out.idx = this.cols.findIndex((col) =>
                    ["id", "attr", "prop", "attr_as_list", "data"].some(attr =>
                        attr in col && out.col == col[attr]));
                return out;
            });

            // sort conf checks
            sort_conf = sort_conf.filter((conf) => conf.idx !== -1 && conf.idx !== null);
            if (sort_conf.length > 0) {
                
                this.rows.sort((x, y) => 
                    sort_conf.reduce((out, conf) => 
                        out || conf.dir * compare(
                            x.data[conf.idx] && x.data[conf.idx].content,
                            y.data[conf.idx] && y.data[conf.idx].content),
                        false
                    )
                );

            } else {
                console.error("cannot sort, no applicable columns found");
            }


        }
        // mark rows to be hidden due to 'strict' property
        this.rows = this.rows.filter(row => !row.hidden);

        // truncate shown rows to 'max rows', if configured
        if ("max_rows" in this.cfg && this.cfg.max_rows > -1)
            this.rows = this.rows.slice(0, this.cfg.max_rows);

        return this.rows;
    }
}

/** just for the deprecation warning (spam avoidance) */
var show_deprecation = true;
function show_deprecation_message() {
        if (!show_deprecation)
            return;
        // console.log(), console.warn(), console.error(), alert()
        console.log("DEPRECATION WARNING: 'multi', 'attr', 'attr_as_list', 'prop' as column " +
          "data source selector is deprecated, use 'data' instead! You can simply replace all " +
          "occurences of the above with 'data' and it will work _and_ this message will vanish! " +
          "THIS IS THE FIRST DEPRECATION WARNING, more severe will follow before removal! " +
          "For more details: https://github.com/custom-cards/flex-table-card");
        show_deprecation = false;
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
        //this.colspan = null;
    }


    get_raw_data(col_cfgs) {
        this.raw_data = col_cfgs.map((col) => {

            /* collect pairs of 'column_type' and 'column_key' */
            let col_getter = new Array();

            // newest and soon to be the only way to reference data sources!
            // effectively a merge of all the 'classic' selectors, including 'multi'
            // -> 'prop' will be used, if one of 'name', 'object_id' or 'key in this.entity'
            // -> otherwise 'attr' will be assumed
            // -> expansion from a list (as 'attr_as_list') will be automatically applied
            //    (by testing for Array.isArray(this.entity.attributes[col.data]))
            // -> 'multi' can be done by simply separating each data-src with ","
            // THIS WILL BE BREAKING OLD STUFF, INTRODUCE DEPRECATION WARNINGS!!!!!
            if ("data" in col) {
                for (let tok of col.data.split(","))
                    col_getter.push(["auto", tok.trim()]);

            // OLD data source selection: CALL DEPRECATION WARNING HERE!!!
            // start with console.log(), continue with console.warn(), console.error()
            //            and final phase: alert()
            } else if ("multi" in col) {
                show_deprecation_message();

                for(let item of col.multi)
                    col_getter.push([item[0], item[1]]);

            } else if ("attr" in col || "prop" in col || "attr_as_list" in col ) {
                show_deprecation_message();

                if ("attr" in col)
                    col_getter.push(["attr", col.attr]);
                else if ("prop" in col)
                    col_getter.push(["prop", col.prop]);
                else if ("attr_as_list" in col)
                    col_getter.push(["attr_as_list", col.attr_as_list]);

            } else
                    console.error(`no 'data' found for col: ${col.name} - skipping...`);

            /* fill each result for 'col_[type,key]' pair into 'raw_content' */
            var raw_content = new Array();
            for (let item of col_getter) {
                let col_type = item[0];
                let col_key = item[1];

                // newest stuff, automatically dispatch to correct data source
                if (col_type == "auto") {
                    if (col_key === "name") {
                        // "smart" name determination
                        if ("friendly_name" in this.entity.attributes)
                            raw_content.push(this.entity.attributes.friendly_name);
                        else if ("name" in this.entity)
                            raw_content.push(this.entity.name);
                        else if ("name" in this.entity.attributes)
                            raw_content.push(this.entity.attributes.name);
                        else
                            raw_content.push(this.entity.entity_id);
                    } else if (col_key === "object_id") {
                        // return Object ID ('entity_id' after 1st dot)
                        raw_content.push(this.entity.entity_id.split(".").slice(1).join("."));
                    } else if (col_key === "_state" && "state" in this.entity.attributes) {
                        // '_state' denotes 'attributes.state'
                        raw_content.push(this.entity.attributes.state);
                    } else if (col_key === "icon") {
                        // 'icon' will show the entity's default icon
                        let _icon = this.entity.attributes.icon;
                        raw_content.push(`<ha-icon id="icon" icon="${_icon}"></ha-icon>`);
                    } else if (col_key in this.entity) {
                        // easy direct member of entity
                        raw_content.push(this.entity[col_key]);
                    } else if (col_key in this.entity.attributes) {
                        // finally fall back to '.attributes' member
                        raw_content.push(this.entity.attributes[col_key]);
                    } else {
                        // no matching data found, complain:
                        //raw_content.push("[[ no match ]]");
                        raw_content.push(null);
                    }

                    // @todo: not really nice to clean `raw_content` up here, why
                    //        putting garbage in it in the 1st place? Need to check
                    //        if this is ever executed, since the data-collection
                    //        improvements...
                    /*raw_content = raw_content.filter(
                        (item) => item !== undefined && item.slice(0, 9) !== 'undefined'
                    );*/

                    // technically all of the above might be handled as list
                    this.has_multiple = Array.isArray(raw_content.slice(-1)[0]);

                ////////// ALL OF THE FOLLOWING TO BE REMOVED ONCE DEPRECATION IS REALIZED....
                //
                // collect the "raw" data from the requested source(s)
                } else if(col_type == "attr") {
                    raw_content.push(((col_key in this.entity.attributes) ?
                        this.entity.attributes[col_key] : null));

                } else if (col_type == "prop") {
                    // 'object_id' and 'name' not working -> make them work:
                    if (col_key == "object_id") {
                        raw_content.push(this.entity.entity_id.split(".").slice(1).join("."));

                    // 'name' automagically resolves to most verbose name
                    } else if (col_key == "name") {
                        if ("friendly_name" in this.entity.attributes)
                            raw_content.push(this.entity.attributes.friendly_name);
                        else if ("name" in this.entity)
                            raw_content.push(this.entity.name);
                        else if ("name" in this.entity.attributes)
                            raw_content.push(this.entity.attributes.name);
                        else
                            raw_content.push(this.entity.entity_id);

                    // other state properties seem to work as expected... (no multiples allowed!)
                    } else
                        raw_content.push((col_key in this.entity) ? this.entity[col_key] : null);

                } else if (col_type == "attr_as_list") {
                    this.has_multiple = true;
                    raw_content.push(this.entity.attributes[col_key]);
                //
                ////////// ... REMOVAL UNTIL THIS POINT HERE (DUE TO DEPRECATION)

                } else {
                    console.error(`no selector found for col: ${col.name} - skipping...`);
                    //raw_content.push("[failed selecting data]");
                }
            }
            /* finally concat all raw_contents together using 'col.multi_delimiter' */
            let delim = (col.multi_delimiter) ? col.multi_delimiter : " ";

            ////////// REMOVE ON DEPRECATION:
            if ("multi" in col && col.multi.length > 1)
                raw_content = raw_content.map((obj) => String(obj)).join(delim);
            // new approach, KEEP AFTER DEPRECATION: (maybe without 'else' working anyways?!)
            else if ("data" in col && raw_content.length > 1)
                raw_content = raw_content.map((obj) => String(obj)).join(delim);
            else
                raw_content = raw_content[0];

            let fmt = new CellFormatters();
            if (col.fmt) {
                raw_content = fmt[col.fmt](raw_content);
                if (fmt.failed)
                    raw_content = null;
            }
            return ([null, undefined].every(x => raw_content !== x)) ? raw_content : new Array();
        });
        return null;
    }

    render_data(col_cfgs) {
        // apply passed "modify" configuration setting by using eval()
        // assuming the data is available inside the function as "x"
        this.data = this.raw_data.map((raw, idx) => {
            let x = raw;
            let cfg = col_cfgs[idx];
            let content = (cfg.modify) ? eval(cfg.modify) : x;

            // check for undefined/null values and omit if strict set
            if (content === "undefined" || typeof content === "undefined" || content === null ||
                    content == "null" || (Array.isArray(content) && content.length == 0))
                return ((this.strict) ? null : "n/a");

            return new Object({
                content: content,
                pre: cfg.prefix || "",
                suf: cfg.suffix || "",
                css: cfg.align || "left",
                hide: cfg.hidden
            });
        });
        this.hidden = this.data.some(data => (data === null));
        return this;
    };
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

    _getEntities(hass, entities, incl, excl) {
        const format_entities = (e) => {
            if(!e) return null;
            if(typeof(e) === "string")
                return {entity: e.trim()}
            return e;
        }

        if (!incl && !excl && entities) {
                       entities = entities.map(format_entities);
            return entities.map(e => hass.states[e.entity]);
        }

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

        // CSS styles as assoc-data to allow seperate updates by key, i.e., css-selector
        var css_styles = {
            "table":                    "width: 100%; padding: 16px; ",
            "thead th":                 "height: 1em;",
            "tr td":                    "padding-left: 0.5em; padding-right: 0.5em; ",
            "th":                       "padding-left: 0.5em; padding-right: 0.5em; ",
            "tr td.left":               "text-align: left; ",
            "th.left":                  "text-align: left; ",
            "tr td.center":             "text-align: center; ",
            "th.center":                "text-align: center; ",
            "tr td.right":              "text-align: right; ",
            "th.right":                 "text-align: right; ",
            "tbody tr:nth-child(odd)":  "background-color: var(--table-row-background-color); ",
            "tbody tr:nth-child(even)": "background-color: var(--table-row-alternative-background-color); ",
            "th ha-icon":               "height: 1em; vertical-align: top; "
        }
        // apply CSS-styles from configuration
        // ("+" suffix to key means "append" instead of replace)
        if ("css" in cfg) {
            for(var key in cfg.css) {
                var is_append = (key.slice(-1) == "+");
                var css_key = (is_append) ? key.slice(0, -1) : key;
                if(is_append && css_key in css_styles)
                    css_styles[css_key] += cfg.css[key];
                else
                    css_styles[css_key] = cfg.css[key];
            }
        }

        // assemble final CSS style data, every item within `css_styles` will be translated to:
        // <key> { <any-string-value> }
        style.textContent = "";
        for(var key in css_styles)
            style.textContent += key + " { " + css_styles[key] + " } \n";

        // temporary for generated header html stuff
        let my_headers = this.tbl.headers.map((obj, idx) => new Object({
            th_html_begin: `<th class="${cfg.columns[idx].align || 'left'}">`,
            th_html_end: `${obj.name}</th>`,
            icon_html: ((obj.icon) ? `<ha-icon id='icon' icon='${obj.icon}'></ha-icon>` : "")
        }));


        // table skeleton, body identified with: 'flextbl'
        content.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            ${my_headers.map((obj, idx) =>
                                `${obj.th_html_begin}${obj.icon_html}${obj.th_html_end}`).join("")}
                        </tr>
                    </thead>
                    <tbody id='flextbl'></tbody>
                </table>
                `;
        // push css-style & table as content into the card's DOM tree
        card.appendChild(style);
        card.appendChild(content);
        // append card to _root_ node...
        root.appendChild(card);
        this._config = cfg;
    }

    _updateContent(element, rows) {
        // callback for updating the cell-contents
        element.innerHTML = rows.map((row) =>
            `<tr id="entity_row_${row.entity.entity_id}">${row.data.map(
                (cell) => ((!cell.hide) ?
                    `<td class="${cell.css}">${cell.pre}${cell.content}${cell.suf}</td>` : "")
            ).join("")}</tr>`).join("");

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
        let entities = this._getEntities(hass, config.entities, config.entities.include, config.entities.exclude);

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

