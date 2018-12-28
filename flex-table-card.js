class FlexTableCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.card_height = 1;
  }

  _getRegEx(pat) {
		// compile and convert wildcardish-regex to real regex
    return new RegExp(`^${pat.replace(/\*/g, '.*')}$`, 'i');
  }

  _listify(obj) {
		// if obj is an Array() -> ok, else return obj inside an Array
    return (obj instanceof Array) ? obj : [obj];
  }

  _getEntities(hass, incl, excl) {
    // prepare (convert wildcardish regex to the real-stuff)
    const incl_re = this._listify(incl).map(this._getRegEx);
    const excl_re = (excl) ? this._listify(excl).map(this._getRegEx) : null;
    // apply inclusion regex
    let keys = Object.keys(hass.states).
    	filter(e_id => incl_re.some((regex) => e_id.match(regex)));
    // apply exclusion, if set
    if (excl)
      keys = keys.filter(e_id => excl_re.some((regex) => !(e_id.match(regex))));
    return keys.map(key => hass.states[key]);
  }
  

  setConfig(config) {
	// keep hass-config
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);

	// assemble html 
    const card = document.createElement('ha-card');
    card.header = config.title;
    const content = document.createElement('div');
    const style = document.createElement('style');

    // most ugly, simply copy&paste from below: @TODO, @FIXME
    var hidecols = cardConfig.columns.map(
	    (col, idx) => (col.hidden && idx)).filter((idx) => idx);	
    var head_cols = cardConfig.columns.filter((col, idx) => (!hidecols.includes(idx)));

    style.textContent = `
      table {
        width: 100%;
        padding: 16px;
      }
      thead th {
        text-align: left;
      }
      tbody tr:nth-child(odd) {
        background-color: var(--paper-card-background-color);
      }
      tbody tr:nth-child(even) {
        background-color: var(--secondary-background-color);
      }
    `;
    content.innerHTML = `
      <table>
        <thead>
          <tr>` +
      `${head_cols.map((col) => `<th>${col.name || col.attr}</th>`).join("")}` +
      `</tr>
        </thead>
        <tbody id='flextbl'>
        </tbody>
      </table>
      `;
    card.appendChild(style);
    card.appendChild(content);
    root.appendChild(card)
    // DOM ready to be injected....
    this._config = cardConfig;
  }

  _updateContent(element, rows) {
    // callback for updating the cell-contents
    element.innerHTML = rows.map((row) => {
      return "<tr>" +
        `${row.map((cell) => `<td>${cell}</td>`).join("")}` +
        "</tr>";
    }).join("");
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;

    // get "data sources"
    let entities = this._getEntities(hass, 
    	config.entities.include, config.entities.exclude);
		
    // construct table structure, ..,
    var full_tbl = [];

    function apply_eval(all_x, cmd_string) {
      return all_x.map((x) => eval(cmd_string));
    }

    // @todo: pythonic way to do this, js best-practice is how?
    var zip = rows => rows[0].map((_, c) => rows.map(row => row[c]));
    entities.forEach(entity => {
      zip(config.columns.map((col) => {
	var out_data = null;
        if ("attr" in col) {
            out_data = [((col.attr in entity.attributes) ?
              entity.attributes[col.attr] : null)];
        } else if ("prop" in col) {
	  // 'object_id' and 'name' not working -> make them work:
	  if (col.prop == "object_id") {
	      out_data = [entity.entity_id.split(".").slice(1).join(".")];

	  // 'name' automagically resolves to most verbose name
          } else if (col.prop == "name") {
	      if ("friendly_name" in entity.attributes)
                  out_data = [entity.attributes.friendly_name];
	      else if ("name" in entity)
		  out_data = [entity.name];
	      else if ("name" in entity.attributes)
		  out_data = [entity.attributes.name];
	      else
		  out_data = [entity.entity_id];
	  // other state properties seem to work as expected...
	  } else
              out_data = [((col.prop in entity) ? entity[col.prop] : null)];

        } else if ("attr_as_list" in col) {
          /*return entity.attributes[col.attr_as_list].map(
		(x) => Object({ data: x }));*/
	  out_data = entity.attributes[col.attr_as_list];

        } else {
          console.log("this 'should' not happen...");
	
          //return [{ "data": null }];
        }
	// apply passed "modify" configuration setting by using eval()
	// assuming the data is available inside the function as "x"
	if (typeof col.modify != "undefined")
	    out_data = out_data.map((x) => eval(col.modify));
            //out_data = apply_eval(out_data, col.modify);

	if (typeof out_data == "undefined")
	    return [];
	else
	    return out_data.map((d) => new Object({data: d}));


      // do the *transpose*, to allow row-wise output
      })).forEach(row => full_tbl.push(row));
    });

    // care for 'strict' configuration option
    var rows = (config.strict) ?
      full_tbl.filter((row) => row.every((cell) => cell.data !== null)).map(
	      (x) => x.map((y) => y.data)) :
      full_tbl.map((row) => row.map(
	      (cell) => (cell.data == null) ? "n/a" : cell.data));

    // sorting is allowed asc/desc for one column
    if (config.sort_by !== undefined) {
        var sort_col = config.sort_by;
        var sort_dir = 1;
        if (config.sort_by !== undefined) {
            if (["-", "+"].includes(config.sort_by.slice(-1))) {
                sort_col = config.sort_by.slice(0, -1);
                sort_dir = ((config.sort_by.slice(-1)) == "-") ? -1 : +1;
            }
        }
        var sort_idx = config.columns.findIndex((col) => col.attr == sort_col);
	// special comparision handling for string, omg this is dissapointing JS
	var cmp = function(a, b) {
	   if (typeof a == "string")
		return a.localeCompare(b);
	   else if (typeof b == "string")
		return -1 * b.localeCompare(a);
	   else
		return a - b;
	}
	// if applicable sort according to config
	if (sort_idx > -1)
	    rows.sort((x, y) => sort_dir * cmp(x[sort_idx], y[sort_idx]));
	else
	    console.log(`ERROR: config.sort_by: ${config.sort_by}, but column not found!`);
    }
    // truncate shown rows to 'max rows', if configured
    if ("max_rows" in config && config.max_rows > -1)
      rows = rows.slice(0, config.max_rows);

    // hide cols, if requested by config (for hidden sorting)
    var hidecols = config.columns.map(
	(col, idx) => (col.hidden && idx)).filter((idx) => idx);	
    rows = rows.map(
	(row) => row.filter((col, idx) => (!hidecols.includes(idx))));

    // finally set card height and insert card
    this._setCardSize(rows.length);
    this._updateContent(root.getElementById('flextbl'), rows);
  }

  _setCardSize(num_rows) {
    this.card_height = parseInt(num_rows * 0.5);
  }

  getCardSize() {
    return this.card_height;
  }
}

customElements.define('flex-table-card', FlexTableCard);
