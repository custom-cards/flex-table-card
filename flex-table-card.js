"use strict";

// VERSION info
var VERSION = "1.2.0";

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
        return a.toString().localeCompare(b, navigator.language);
    else if (isNaN(b))
        return -1 * b.toString().localeCompare(a, navigator.language);
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
        return parseFloat(data);
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
    duration(data) {
        let h = (data > 3600) ? Math.floor(data / 3600).toString() + ':' : '';
        let m = (data > 60) ? Math.floor((data % 3600) / 60).toString().padStart(2, 0) + ':' : '';
        let s = (data > 0) ? Math.floor((data % 3600) % 60).toString() : '';
        if (m) s = s.padStart(2, 0);
        return h + m + s;
    }
    duration_h(data) {
        let d = (data > 86400) ? Math.floor(data / 86400).toString() + 'd ' : '';
        let h = (data > 3600) ? Math.floor((data % 86400) / 3600) : ''
        h = (d) ? h.toString().padStart(2,0) + ':' : ((h) ? h.toString() + ':' : '');

        let m = (data > 60) ? Math.floor((data % 3600) / 60).toString().padStart(2, 0) + ':' : '';
        let s = (data > 0) ? Math.floor((data % 3600) % 60).toString() : '';
        if (m) s = s.padStart(2, 0);
        return d + h + m + s;
    }


}


/** flex-table data representation and keeper */
class DataTable {
    constructor(cfg) {
        this.cfg = cfg;
        this.sort_by = cfg.sort_by;

        // Provide default column name option if not supplied
        this.cols = cfg.columns.map((col, idx) => {
            return { name: col.name || `Col${idx}`, ...col }
            });

        this.headers = this.cols.filter(col => !col.hidden).map(
            (col, idx) => new Object({
                id: "Col" + idx,
                name: col.name,
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
        // sorting is allowed asc/desc for multiple columns
        if (this.sort_by) {
            let sort_cols = listify(this.sort_by);

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
                    ["id", "attr", "prop", "attr_as_list", "data", "name"].some(attr =>
                        attr in col && out.col == col[attr]));
                return out;
            });

            // sort conf checks
            sort_conf = sort_conf.filter((conf) => conf.idx !== -1 && conf.idx !== null);
            if (sort_conf.length > 0) {
                
                this.rows.sort((x, y) => 
                    sort_conf.reduce((out, conf) => 
                        out || conf.dir * compare(
                            x.data[conf.idx] && (x.data[conf.idx].sort_unmodified ? x.data[conf.idx].raw_content : x.data[conf.idx].content),
                            y.data[conf.idx] && (y.data[conf.idx].sort_unmodified ? y.data[conf.idx].raw_content : y.data[conf.idx].content)),
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

    updateSortBy(idx) {
        let new_sort = this.headers[idx].name;
        if (this.sort_by && new_sort === this.sort_by.slice(0, -1)) {
            this.sort_by = new_sort + (this.sort_by.slice(-1) === "-" ? "+" : "-");
        } else {
            this.sort_by = new_sort + "+";
        }
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


    get_raw_data(col_cfgs, config, hass) {
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
                    } else if (col_key === "_name" && "name" in this.entity.attributes) {
                        // '_name' denotes 'attributes.name'
                        raw_content.push(this.entity.attributes.name);
                    } else if (col_key === "icon") {
                        // 'icon' will show the entity's default icon
                        let _icon = this.entity.attributes.icon;
                        raw_content.push(`<ha-icon id="icon" icon="${_icon}"></ha-icon>`);
                    } else if (col_key === "state" && config.auto_format && !col.no_auto_format) {
                        // format entity state
                        raw_content.push(hass.formatEntityState(this.entity));
                    } else if (col_key in this.entity) {
                        // easy direct member of entity, unformatted
                        raw_content.push(this.entity[col_key]);
                    } else if (col_key in this.entity.attributes) {
                        // finally fall back to '.attributes' member
                        if (config.auto_format && !col.no_auto_format) {
                            raw_content.push(hass.formatEntityAttributeValue(this.entity, col_key));
                        }
                        else {
                            raw_content.push(this.entity.attributes[col_key]);
                        }
                    } else if (col_key === "area") {
                        // 'area' will show the entity's or its device's assigned area, if any
                        raw_content.push(this._get_area_name(this.entity.entity_id, hass));
                    } else if (col_key === "floor") {
                        // 'floor' will show the entity's area's floor, if any
                        raw_content.push(this._get_floor_name(this.entity.entity_id, hass));
                    } else if (col_key === "device") {
                        // 'device' will show the entity's device name, if any
                        raw_content.push(this._get_device_name(this.entity.entity_id, hass));
                    } else if (col_key === "device_hw_version") {
                        // 'device_hw_version' will show the entity's device hardware version, if any
                        raw_content.push(this._get_device_value(this.entity.entity_id, hass, "hw_version"));
                    } else if (col_key === "device_manufacturer") {
                        // 'device_manufacturer' will show the entity's device manufacturer, if any
                        raw_content.push(this._get_device_value(this.entity.entity_id, hass, "manufacturer"));
                    } else if (col_key === "device_model") {
                        // 'device_model' will show the entity's device model, if any
                        raw_content.push(this._get_device_value(this.entity.entity_id, hass, "model"));
                    } else if (col_key === "device_serial_number") {
                        // 'device_serial_number' will show the entity's device serial number, if any
                        raw_content.push(this._get_device_value(this.entity.entity_id, hass, "serial_number"));
                    } else if (col_key === "device_sw_version") {
                        // 'device_sw_version' will show the entity's device software version, if any
                        raw_content.push(this._get_device_value(this.entity.entity_id, hass, "sw_version"));
                    } else if (col_key === "device_via_device") {
                        // 'device_via_device' will show the entity's device via name, if any
                        raw_content.push(this._get_device_via(this.entity.entity_id, hass));
                    } else if (col_key === "platform") {
                        // 'platform' will show the entity's platform (domain), if any
                        raw_content.push(this._get_platform(this.entity.entity_id, hass));
                    } else {
                        // no matching data found, complain:
                        //raw_content.push("[[ no match ]]");

                        let pos = col_key.indexOf('.');
                        if (pos < 0)
                        {
                            raw_content.push(null);
                        }
                        else
                        {
                            // if the col_key field contains a dotted object (eg: day.monday)
                            //  then traverse each object to ensure that it exists
                            //  until the final object value is found.
                            // if at any point in the traversal, the object is not found
                            //  then null will be used as the value.
                            // Works for arrays as well as single values.
                            let objs = col_key.split('.');
                            let struct = this.entity.attributes;
                            let values = [];
                            if (struct) {
                                for (let idx = 0; struct && idx < objs.length; idx++) {
                                    if (Array.isArray(struct) && isNaN(objs[idx])) {
                                        struct.forEach(function (item, index) {
                                            values.push(struct[index][objs[idx]]);
                                        });
                                    }
                                    else {
                                        struct = (objs[idx] in struct) ? struct[objs[idx]] : null;
                                    }
                                }
                                // If no array found, single value is in struct.
                                if (values.length == 0) values = struct;
                            }
                            raw_content.push(values);
                        }
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
            
            return ([null, undefined].every(x => raw_content !== x)) ? raw_content : new Array();
        });
        return null;
    }

    _get_device_name(entity_id, hass) {
        var device_id;
        if (hass.entities[entity_id] != null) {
            device_id = hass.entities[entity_id].device_id;
        }
        return device_id == null ? "-" : hass.devices[device_id].name_by_user || hass.devices[device_id].name;
    }

    _get_device_via(entity_id, hass) {
        var device_id;
        var via_device_id;
        if (hass.entities[entity_id] != null) {
            device_id = hass.entities[entity_id].device_id;
        }
        if (device_id != null) {
            via_device_id = hass.devices[device_id].via_device_id
        }
        return via_device_id == null ? "-" : hass.devices[via_device_id].name_by_user || hass.devices[via_device_id].name;
    }

    _get_device_value(entity_id, hass, parameter) {
        var device_id;
        if (hass.entities[entity_id] != null) {
            device_id = hass.entities[entity_id].device_id;
        }
        return device_id == null || hass.devices[device_id][parameter] == null ? "-" :
            hass.devices[device_id][parameter];
    }

    _get_area_name(entity_id, hass) {
        var area_id;
        if (hass.entities[entity_id] != null) {
            area_id = hass.entities[entity_id].area_id;
            if (area_id == null) {
                let device_id = hass.entities[entity_id].device_id;
                if (device_id != null) area_id = hass.devices[device_id].area_id;
            }
        }
        return area_id == null || hass.areas[area_id] == null ? "-" : hass.areas[area_id].name;
    }

    _get_floor_name(entity_id, hass) {
        var area_id;
        var floor_id;
        if (hass.entities[entity_id] != null) {
            area_id = hass.entities[entity_id].area_id;
            if (area_id == null) {
                let device_id = hass.entities[entity_id].device_id;
                if (device_id != null) area_id = hass.devices[device_id].area_id;
            }
            if (area_id != null) floor_id = hass.areas[area_id].floor_id;
        }
        return floor_id == null || hass.floors[floor_id] == null ? "-" : hass.floors[floor_id].name;
    }

    _get_platform(entity_id, hass) {
        var entity = hass.entities[entity_id]
        return entity == null || entity.platform == null ? "-" : entity.platform;
    }

    render_data(col_cfgs) {
        // apply passed "modify" configuration setting by using eval()
        // assuming the data is available inside the function as "x"
        this.data = this.raw_data.map((raw, idx) => {
            let x = raw;
            let cfg = col_cfgs[idx];
			let fmt = new CellFormatters();
            if (cfg.fmt) {
                x = fmt[cfg.fmt](x);
                if (fmt.failed)
                   x = null;
            }

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
                hide: cfg.hidden,
                raw_content: raw,
                sort_unmodified: cfg.sort_unmodified,
                tap_action: cfg.tap_action,
                double_tap_action: cfg.double_tap_action,
                hold_action: cfg.hold_action,
                edit_action: cfg.edit_action,
            });
        });
        this.hidden = this.data.some(data => (data === null));
        return this;
    };
}

// Replace cell references with actual data.
function getRefs(source, row_data, row_cells) {
    function _replace_col(match, p1) {
        return row_data[p1].content;
    }
    function _replace_cell(match, p1) {
        return row_cells[p1].innerText == "\n" ? "" : row_cells[p1].innerText; // empty cell contains <br>
    }
    function _replace_text(value) {
        const regex_col = /col\[(\d+)\]/gm;
        const regex_cell = /cell\[(\d+)\]/gm;
        value = String(value);
        let modify = value.replace(regex_col, _replace_col);
        modify = modify.replace(regex_cell, _replace_cell);
        return modify;
    }

    // Search for col and cell references (e.g. "col[3]", "cell[2]") and replace with actual data values.
    if (source) {
        if (typeof source === "object") {
            return JSON.parse(_replace_text(JSON.stringify(source)));
        }
        else {
            // Process simple string.
            return _replace_text(source);
        }
    }
    else {
        return "";
    }
}

// Used for feedback during mouse/touch hold
var holdDiskDiam = 98;
var rippleDuration = 600; // in ms


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

    // Used to detect changes requiring a table refresh.
    #old_last_updated = "";
    #old_rowcount = 0;
    #last_config = null;

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
        if (!config.entities) {
            throw new Error('Please provide the "entities" option as a list.');
        }

        if (!config.columns) {
            throw new Error('Please provide the "columns" option as a list.');
        }

        if (config.action || config.service) {
            const action_config = config.action ? config.action.split('.') : config.service.split('.');
            if (action_config.length != 2) {
                throw new Error('Please specify action in "domain.action" format.');
            }
        }

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
            ".type-custom-flex-table-card":
                                        "overflow: auto;",
            "table":                    `width: 100%; padding: 16px; ${cfg.selectable ? "user-select: text;" : ""} `,
            "thead th":                 "height: 1em;",
            "tr td":                    "padding-left: 0.5em; padding-right: 0.5em; position: relative; overflow: hidden; ",
            "th":                       "padding-left: 0.5em; padding-right: 0.5em; ",
            "tr td.left":               "text-align: left; ",
            "th.left":                  "text-align: left; ",
            "tr td.center":             "text-align: center; ",
            "th.center":                "text-align: center; ",
            "tr td.right":              "text-align: right; ",
            "th.right":                 "text-align: right; ",
            ".headerSortDown::after, .headerSortUp::after":
                                        "content: ''; position: relative; left: 2px; border: 6px solid transparent; ",
            ".headerSortDown::after":   "top: 12px; border-top-color: var(--primary-text-color); ",
            ".headerSortUp::after":     "bottom: 12px; border-bottom-color: var(--primary-text-color); ",
            ".headerSortDown, .headerSortUp":
                                        "text-decoration: underline; ",
            "tbody tr:nth-child(odd)":  "background-color: var(--table-row-background-color); ",
            "tbody tr:nth-child(even)": "background-color: var(--table-row-alternative-background-color); ",
            "th ha-icon":               "height: 1em; vertical-align: top; ",
            "tfoot *":                  "border-style: solid none solid none;",
            "td.enable-hover:hover":    "background-color: rgba(var(--rgb-secondary-text-color), 0.2); ",
            ".mouseheld::after":        `content: ''; opacity: 0.7; z-index: 999; position: absolute; display: inline-block; animation: disc 200ms linear; top: var(--after-top, 0); left: var(--after-left, 0); width: ${holdDiskDiam}px; height: ${holdDiskDiam}px; border-radius: 50%; background-color: rgba(var(--rgb-primary-color), 0.285); `,
            "@keyframes disc":          "0% { transform: scale(0); opacity: 0; } 100% {transform: scale(1); opacity: 0.7; }",
            "span.ripple":              `position: absolute; border-radius: 50%; transform: scale(0); animation: ripple ${rippleDuration}ms linear; background-color: rgba(127, 127, 127, 0.7); `,
            "@keyframes ripple":        "to { transform: scale(4); opacity: 0; } ",
            ".search-box":              "align-items: center; padding: 14px; border-bottom: 1px solid var(--divider-color); background-color: var(--primary-background-color); ",
            ".input-wrapper":           "display: flex; border: 1px solid var(--outline-color); height: 30px; border-radius: 10px; cursor: text; background-color: var(--card-background-color); ",
            ".input-wrapper:hover":     "border: 1px solid var(--outline-hover-color); ",
            ".input-wrapper:focus-within":
                                        "border: 1px solid var(--primary-color); ",
            ".input":                   "border: none; width: -webkit-fill-available; background-color: var(--card-background-color); ",
            "input:focus":              "outline: none; ",
            ".icon":                    "padding: 6px; fill: var(--primary-text-color); ",
            ".icon.trailing":           "cursor: pointer; position: relative; overflow: hidden; visibility: hidden; width: 12px; height: 12px; margin-right: 2px; padding-right: 16px; padding-bottom: 12px; padding-left: 4px;  ",
            ".icon.trailing:hover":     "background-color: var(--primary-background-color); border-radius: 50%; ",
            ".svg-trailing":            "margin-left: 2px; ",
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
            th_html_begin: `<th class="${cfg.columns[idx].align || 'left'}" id="${obj.id}">`,
            th_html_end: `${obj.name}</th>`,
            icon_html: ((obj.icon) ? `<ha-icon id='icon' icon='${obj.icon}'></ha-icon>` : "")
        }));

        // search filter box, if configured
        const search_box = `
                    <div class="search-box">
                      <div id="search-wrapper" class="input-wrapper">
                        <div class="icon leading">
                          <svg width="18"; height="18"; focusable="false" role="img" viewBox="0 0 24 24">
                            <g>
                              <path class="primary-path" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"></path>
                            </g>
                          </svg>
                        </div>
                        <input id="search-input" class="input" placeholder="Search..." type="text" autocomplete="off">
                        <div id="clear-input" class="icon trailing">
                          <svg class="svg-trailing" width="18"; height="18"; focusable="false" role="img" viewBox="0 0 24 24">
                            <g>
                              <path class="primary-path" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div >
        `;

        // table skeleton, body identified with: 'flextbl', footer with 'flexfoot'
        content.innerHTML = `
                ${cfg.enable_search ? search_box : ""}
                <table>
                    <thead>
                        <tr>
                            ${my_headers.map((obj, idx) =>
                                `${obj.th_html_begin}${obj.icon_html}${obj.th_html_end}`).join("")}
                        </tr>
                    </thead>
                    <tbody id='flextbl'></tbody>
                    <tfoot id='flexfoot'></tfoot>
                </table>
                `;
        // push css-style & table as content into the card's DOM tree
        card.appendChild(style);
        card.appendChild(content);
        // append card to _root_ node...
        root.appendChild(card);

        // add sorting click handler to header elements, if allowed
        if (!config.disable_header_sort) {

            this.tbl.headers.map((obj, idx) => {
                root.getElementById(obj.id).onclick = (click) => {
                    // remove previous sort by
                    this.tbl.headers.map((obj, idx) => {
                        root.getElementById(obj.id).classList.remove("headerSortDown");
                        root.getElementById(obj.id).classList.remove("headerSortUp");
                    });
                    this.tbl.updateSortBy(idx);
                    if (this.tbl.sort_by.indexOf("+") != -1) {
                        root.getElementById(obj.id).classList.add("headerSortUp");
                    } else {
                        root.getElementById(obj.id).classList.add("headerSortDown");
                    }
                    this._updateContent(
                        root.getElementById("flextbl"),
                        this.tbl.get_rows()
                    );
                };
            });

            // Add event listeners for Search feature
            if (config.enable_search) {
                const inputText = this.shadowRoot.getElementById('search-input');
                const clearButton = this.shadowRoot.getElementById('clear-input');
                const table = this.shadowRoot.getElementById('flextbl');

                inputText.addEventListener("input", () => _filterRows(this, inputText, clearButton, table));
                clearButton.addEventListener("click", () => _clearSearch(inputText));
                inputText.addEventListener('keydown', (event) => {
                    _handle_keydown(event, inputText);
                });
            }

            function _filterRows(flex_table_card, inputText, clearButton, table) {
                // Update visibility of clear button based on existence of text
                clearButton.style.visibility = inputText.value.length > 0 ? 'visible' : 'hidden';

                // Filter table rows based on search text
                const table_rows = table.querySelectorAll('tbody tr');
                const filter = inputText.value.trim().toLowerCase();
                table_rows.forEach((row) => {
                    const rowText = row.textContent.toLowerCase();
                    row.hidden = !rowText.includes(filter);
                });

                // Update footer with only unfiltered rows
                if (cfg.display_footer) {
                    const footer = root.getElementById('flexfoot');
                    const data_rows = flex_table_card.tbl.get_rows();
                    flex_table_card._updateFooter(footer, cfg, table_rows, data_rows);
                }
            }

            function _clearSearch(inputText) {
                inputText.value = "";
                inputText.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            }

            function _handle_keydown(e, inputText) {
                // Clear search text on Escape pressed
                if (e.key === 'Escape' || e.keyCode === 27) {
                    _clearSearch(inputText);
                }
            }
        }
        this._config = cfg;
    }

    _setup_cell_for_editing(elem, row, col, index) {
        function _handle_lost_focus(e) {
            // Check if user changed text.
            if (this.textContent != this.dataset.original) {
                const actionConfig = {
                    tap_action: {
                        action: "perform-action",
                        perform_action: col.edit_action.perform_action,
                        data: getRefs(col.edit_action.data, row.data, elem.cells),
                        target: col.edit_action.target ?? { entity_id: row.entity.entity_id },
                        confirmation: getRefs(col.edit_action.confirmation, row.data, elem.cells)
                    },
                };

                let ev = new Event("hass-action", {
                    bubbles: true, cancelable: false, composed: true
                });
                ev.detail = {
                    config: actionConfig,
                    action: "tap",
                };

                this.dispatchEvent(ev);
                this.dataset.original = this.textContent;
            }
        }

        function _handle_keydown(e) {
            // Discard edit on Escape pressed
            if (e.key === 'Escape' || e.keyCode === 27) {
                this.textContent = this.dataset.original;
            }
            else if (e.key === 'Enter' || e.keyCode === 13) {
                // Accept edit on Enter pressed (lose focus)
                this.blur();
                e.preventDefault();
            }
        }

        let cell = elem.cells[index];
        cell.classList.add("enable-hover");
        cell.addEventListener("blur", _handle_lost_focus);
        cell.addEventListener("keydown", _handle_keydown);
    }

    _get_html_for_editable_cell(cell) {
        if (cell.edit_action) {
            return 'contenteditable="true" data-original="' + cell.pre + cell.content + cell.suf + '"'
        }
        else {
            return "";
        }
    }

    _updateContent(table, rows) {
        // callback for updating the cell-contents
        table.innerHTML = rows.map((row, index) =>
            `<tr id="entity_row_${row.entity.entity_id}_${index}">${row.data.map(
                (cell) => ((!cell.hide) ?
                    `<td class="${cell.css}" ${this._get_html_for_editable_cell(cell)}>${cell.pre}${cell.content}${cell.suf}</td>` : "")
            ).join("")}</tr>`).join("");

        function _fireEvent(obj, action_type, actionConfig) {
            let ev = new Event("hass-action", {
                bubbles: true, cancelable: false, composed: true
            });

            let atype = action_type.replace("_action", "");
            ev.detail = {
                config: actionConfig,
                action: atype,
            };
            obj.dispatchEvent(ev);
        }

        // Define handlers for cell actions.
        function _handle_more_info(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "more-info",
                    entity: row.entity.entity_id,
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_toggle(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "toggle",
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
                entity: row.entity.entity_id,
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_perform_action(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "perform-action",
                    perform_action: col[action_type].perform_action,
                    data: getRefs(col[action_type].data, row.data, elem.cells),
                    target: col[action_type].target ?? { entity_id: row.entity.entity_id },
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_navigate(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "navigate",
                    navigation_path: getRefs(col[action_type].navigation_path ?? col.content, row.data, elem.cells),
                    navigation_replace: col[action_type].navigation_replace,
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_url(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "url",
                    url_path: getRefs(col[action_type].url_path ??
                        col.content, row.data, elem.cells)
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_assist(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: {
                    action: "assist",
                    start_listening: col[action_type].start_listening,
                    pipeline_id: col[action_type].pipeline_id,
                    confirmation: getRefs(col[action_type].confirmation, row.data, elem.cells)
                },
            };

            _fireEvent(obj, action_type, actionConfig);
        }

        function _handle_fire_dom_event(obj, action_type, elem, row, col) {
            const actionConfig = {
                [action_type]: getRefs(col[action_type], row.data, elem.cells)
            };

            _fireEvent(obj, action_type, actionConfig);
        }
        function _handle_action(obj, action_type, elem, row, col) {
            let action;
            switch (action_type) {
                case "tap_action":
                    action = col.tap_action;
                    break;
                case "double_tap_action":
                    action = col.double_tap_action;
                    break;
                case "hold_action":
                    action = col.hold_action;
                    break;
                default:
                    throw new Error(`Expected one of tap_action, double_tap_action, hold_action, but received: ${action_type}`)
            }

            switch (action["action"]) {
                case "more-info":
                    _handle_more_info(obj, action_type, elem, row, col);
                    break;
                case "toggle":
                    _handle_toggle(obj, action_type, elem, row, col);
                    break;
                case "perform-action":
                    _handle_perform_action(obj, action_type, elem, row, col);
                    break;
                case "navigate":
                    _handle_navigate(obj, action_type, elem, row, col);
                    break;
                case "url":
                    _handle_url(obj, action_type, elem, row, col);
                    break;
                case "assist":
                    _handle_assist(obj, action_type, elem, row, col);
                    break;
                case "fire-dom-event":
                    _handle_fire_dom_event(obj, action_type, elem, row, col);
                    break;
                case "edit":
                    _handle_edit(obj, action_type, elem, row, col);
                    break;
                case "none":
                    break;
                default:
                    throw new Error(`Expected one of none, toggle, more-info, perform-action, url, navigate, assist, fire-dom-event, but received: ${action["action"]}`);
            }
        }

        rows.forEach((row, index) => {
            const elem = this.shadowRoot.getElementById(`entity_row_${row.entity.entity_id}_${index}`);
            let colindex = -1;

            function _do_ripple(target) {
                const circle = document.createElement("span");
                const diameter = Math.max(target.clientWidth, target.clientHeight);
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = "0px";
                circle.style.top = "0px";
                circle.classList.add("ripple");
                target.appendChild(circle);
                const timerId = setTimeout(() => {
                    circle.remove();
                }, rippleDuration);
            }

            // Setup any actionable columns
            row.data.forEach((col) => {
                if (!col.hide) {
                    colindex++;
                    let cell = elem.cells[colindex];
                    let clickTimer = 0;
                    let holdTimer = 0;
                    let isHolding = false;

                    if (col.tap_action) {
                        const clickWait = col.double_tap_action? 300 : 0;
                        function handleClick(e) {
                            let event = e;
                            if (clickTimer == 0 && holdTimer == 0) {
                                // Set timer to perform action after waiting for possible double click
                                clickTimer = setTimeout(() => {
                                    _do_ripple(this);
                                    _handle_action(this, "tap_action", elem, row, col);
                                    clickTimer = 0;
                                }, clickWait);
                            }
                            // Double click or hold happening instead of click
                            else {
                                clearTimeout(clickTimer);
                                clickTimer = 0;
                            }
                        }
                        cell.classList.add("enable-hover");
                        cell.addEventListener("click", handleClick);
                    };

                    if (col.double_tap_action) {
                        function handleDoubleClick(e) {
                            clearTimeout(clickTimer);
                            clickTimer = 0;
                            _do_ripple(e.target);
                            _handle_action(this, "double_tap_action", elem, row, col);
                        }
                        cell.classList.add("enable-hover");
                        cell.addEventListener("dblclick", handleDoubleClick);
                    };

                    if (col.hold_action) {
                        const holdDuration = 500;
                        var targetRect;

                        function handleMouseDown(e) {
                            isHolding = false;
                            targetRect = e.target.getBoundingClientRect();
                            var xpt;
                            var ypt;
                            if (e instanceof MouseEvent) {
                                xpt = e.clientX;
                                ypt = e.clientY;
                            }
                            else {
                                xpt = e.targetTouches[0].clientX;
                                ypt = e.targetTouches[0].clientY;
                            }
                            var x = xpt - targetRect.left - (holdDiskDiam/2);
                            var y = ypt - targetRect.top - (holdDiskDiam / 2);
                            holdTimer = setTimeout(() => {
                                isHolding = true;
                                cell.style.setProperty('--after-left', `${x}px`);
                                cell.style.setProperty('--after-top', `${y}px`);
                                cell.style.setProperty('overflow', 'visible');
                                cell.classList.add("mouseheld");
                            }, holdDuration);
                        }

                        function handleMouseUp(e) {
                            if (isHolding) {
                                isHolding = false;
                                _do_ripple(e.target);
                                _handle_action(this, "hold_action", elem, row, col);
                                e.preventDefault();
                            }
                            else {
                                clearTimeout(holdTimer);
                                holdTimer = 0;
                            }
                        }

                        function handleCancel(e) {
                            if (e instanceof TouchEvent && e.targetTouches.length > 0 && targetRect) {
                                var xpt = e.targetTouches[0].clientX;
                                var ypt = e.targetTouches[0].clientY;
                                // If touch within original target, do nothing.
                                if ((targetRect.left <= xpt && xpt <= targetRect.right) &&
                                    (targetRect.top <= ypt && ypt <= targetRect.bottom)) {
                                    return;
                                }
                            }
                            cell.style.setProperty('overflow', 'hidden');
                            cell.classList.remove("mouseheld");
                            isHolding = false;
                        }

                        // Add event listeners
                        cell.classList.add("enable-hover");
                        cell.addEventListener('mousedown', handleMouseDown);
                        cell.addEventListener('touchstart', handleMouseDown);
                        cell.addEventListener('mouseup', handleMouseUp);
                        cell.addEventListener('touchend', handleMouseUp);
                        window.addEventListener('mouseup', handleCancel);
                        cell.addEventListener('touchend', handleCancel);
                        window.addEventListener('touchmove', handleCancel);
                    };

                    if (col.edit_action) {
                        this._setup_cell_for_editing(elem, row, col, colindex);
                    }
                }
            });

            // if configured, set clickable row to show entity popup-dialog
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

        // If search enabled, may need to re-hide rows. Simulate text entry in search box.
        if (this.tbl.cfg.enable_search) {
            const inputText = this.shadowRoot.getElementById('search-input');
            inputText.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
    }

    _updateFooter(footer, config, table_rows, data_rows) {
        var innerHTML = '<tr>';
        var colnum = -1;
        var raw = "";
        var colspan_remainder = 0

        config.columns.map((col, idx) => {
            if (!col.hidden) {
                colnum++;
                if (colspan_remainder > 0)
                    // Skip column if previous colspan would overlap it
                    colspan_remainder--;
                else {
                    var cfg = config.columns[idx];
                    if (col.footer_type) {
                        switch (col.footer_type) {
                            case 'sum':
                                raw = this._sumColumn(table_rows, data_rows, colnum);
                                break;
                            case 'average':
                                raw = this._avgColumn(table_rows, data_rows, colnum);
                                break;
                            case 'count':
                                raw = Array.from(table_rows).filter(row => !row.hidden).length;
                                break;
                            case 'max':
                                raw = this._maxColumn(table_rows, data_rows, colnum);
                                break;
                            case 'min':
                                raw = this._minColumn(table_rows, data_rows, colnum);
                                break;
                            case 'text':
                                raw = col.footer_text;
                                break;
                            default:
                                console.log("Invalid footer_type: ", col.footer_type);
                        }
                        let x = raw;
                        let value = cfg.footer_modify ? eval(cfg.footer_modify) : x;
                        if (col.footer_type == 'text') {
                            let colspan = cfg.footer_colspan ? cfg.footer_colspan : 1;
                            innerHTML += `<th id="tfootcol${colnum}" colspan=${colspan}>${value}</th>`;
                            colspan_remainder = colspan - 1;
                        }
                        else
                            innerHTML += `<td id="tfootcol${colnum}" class="${cfg.align || ""}">${cfg.prefix || ""}${value}${cfg.suffix || ""}</td>`;
                    }
                    else {
                        innerHTML += '<td></td>'
                    }
                }
            }
        });

        innerHTML += '</tr>';
        footer.innerHTML = innerHTML;
    }

    _sumColumn(table_rows, data_rows, colnum) {
        var sum = 0;
        for (var i = 0; i < data_rows.length; i++) {
            if (!table_rows[i].hidden) {
                let cellValue = this._findNumber(data_rows[i].data[colnum].sort_unmodified ? data_rows[i].data[colnum].raw_content : data_rows[i].data[colnum].content);
                if (!Number.isNaN(cellValue)) sum += cellValue;
            }
        }
        return sum;
    }

    _avgColumn(table_rows, data_rows, colnum) {
        var sum = 0;
        var count = 0;
        for (var i = 0; i < data_rows.length; i++) {
            if (!table_rows[i].hidden) {
                let cellValue = this._findNumber(data_rows[i].data[colnum].sort_unmodified ? data_rows[i].data[colnum].raw_content : data_rows[i].data[colnum].content);
                if (!Number.isNaN(cellValue)) {
                    sum += cellValue;
                    count++;
                }
            }
        }
        return sum / count;
    }

    _maxColumn(table_rows, data_rows, colnum) {
        var max = Number.MIN_VALUE;
        for (var i = 0; i < data_rows.length; i++) {
            if (!table_rows[i].hidden) {
                let cellValue = this._findNumber(data_rows[i].data[colnum].sort_unmodified ? data_rows[i].data[colnum].raw_content : data_rows[i].data[colnum].content);
                if (!Number.isNaN(cellValue)) {
                    if (cellValue > max) max = cellValue;
                }
            }
        }
        return max == Number.MIN_VALUE ? Number.NaN : max;
    }

    _minColumn(table_rows, data_rows, colnum) {
        var min = Number.MAX_VALUE;
        for (var i = 0; i < data_rows.length; i++) {
            if (!table_rows[i].hidden) {
                let cellValue = this._findNumber(data_rows[i].data[colnum].sort_unmodified ? data_rows[i].data[colnum].raw_content : data_rows[i].data[colnum].content);
                if (!Number.isNaN(cellValue)) {
                    if (cellValue < min) min = cellValue;
                }
            }
        }
        return min == Number.MAX_VALUE ? Number.NaN : min;
    }

    // Trim whitespace and leading non-numeric, but not minus sign
    _findNumber(val) {
        if (typeof val === "number") {
            return val;
        }
        else {
            let value = val.trim();
            return (Number.isNaN(parseFloat(value[0])) && value[0] !== '-') ? parseFloat(value.substring(1)) : parseFloat(value);
        }
    }
    set hass(hass) {
        const config = this._config;
        const root = this.shadowRoot;

        if (config.static_data) {
            // Use static data to populate
            if (config !== this.#last_config) {
                this.#last_config = config;
                let entities = new Array();
                let static_data = { "entity_id": "None", "attributes": config.static_data };
                entities.push(static_data);
                this._fill_card(entities, config, root, hass);
            }
            return;
        }
        // get "data sources / origins" i.e, entities
        let entities = this._getEntities(hass, config.entities, config.entities.include, config.entities.exclude);

        // Check for changes requiring a table refresh.
        // Return if no changes detected.
        let rowcount = entities.length;
        if (rowcount == this.#old_rowcount) {
            let last_updated_arr = entities.map(a => a.last_updated);
            let max = last_updated_arr.sort().slice(-1)[0];
            if (max == this.#old_last_updated) return;
            this.#old_last_updated = max;
        }
        this.#old_rowcount = rowcount;

        if (config.action || config.service) {
            // Use action to populate
            const action_config = config.action ? config.action.split('.') : config.service.split('.');
            let domain = action_config[0];
            let action = action_config[1];
            let action_data = config.action_data || config.service_data;

            let entity_list = entities.map((entity) =>
                entity.entity_id
            );

            hass.callWS({
                "type": "call_service",
                "domain": domain,
                "service": action,
                "service_data": action_data,
                "target": entity_list.length ? { "entity_id": entity_list } : undefined,
                "return_response": true,
            }).then(return_response => {
                const entities = new Array();
                Object.keys(return_response.response).forEach((entity_id, idx) => {
                    let resp_obj = {};
                    if (entity_list.length > 0) {
                        // Return payload(s) below entity key(s).
                        const entity_key = (Object.keys(return_response.response))[idx];
                        resp_obj = { "entity_id": entity_id, "attributes": return_response.response[entity_key] };
                    }
                    else {
                        // Return entire response payload.
                        resp_obj = { "entity_id": entity_id, "attributes": return_response.response };
                    }
                    entities.push(resp_obj);
                })
                this._fill_card(entities, config, root, hass);
            });
        }
        else {
            // Use entities to populate
            this._fill_card(entities, config, root, hass);
        }
    }

    _fill_card(entities, config, root, hass) {
        // `raw_rows` to be filled with data here, due to 'attr_as_list' it is possible to have
        // multiple data `raw_rows` acquired into one cell(.raw_data), so re-iterate all rows
        // to---if applicable---spawn new DataRow objects for these accordingly
        let raw_rows = entities.map(e => new DataRow(e, config.strict));
        raw_rows.forEach(e => e.get_raw_data(config.columns, config, hass))

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
        const data_rows = this.tbl.get_rows();
        const table = root.getElementById('flextbl');
        this._updateContent(table, data_rows);
        const table_rows = table.querySelectorAll('tbody tr');
        if (config.display_footer) this._updateFooter(root.getElementById("flexfoot"), config, table_rows, data_rows);
    }

    _setCardSize(num_rows) {
        this.card_height = parseInt(num_rows * 0.5);
    }

    getCardSize() {
        return this.card_height;
    }

    getGridOptions() {
        return {
            columns: "full",
        };
    }
}

customElements.define('flex-table-card', FlexTableCard);


window.customCards = window.customCards || [];
window.customCards.push({
    type: "flex-table-card",
    name: "Flex Table Card",
    description: "The Flex Table card gives you the ability to visualize tabular data." // optional
});

console.info(`%c FLEX-TABLE-CARD %c Version ${VERSION} `, "font-weight: bold; color: #000; background: #aeb", "font-weight: bold; color: #000; background: #ddd");
