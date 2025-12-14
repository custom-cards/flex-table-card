## Configuration
The `flex-table-card` aims for more flexibility for tabular-ish visuallization needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- lots of possibilities for configuration: entity selection (include, exclude), action (formerly service) call responses, (hidden-)column-sorting, js-based content manipulation, row limiting and more...
- the ability to edit data and trigger actions

Flex Table gives you the possibility to visualize any tabular data within Lovelace. Especially overviews with high data densities can be easily realized.

**Configuration Options**

***Top-level options***

| Name                   | Type            | Required?     | Description
| ----                   | ----            | ------------- | -----------
| `type`                 | string          | **required**  | `custom:flex-table-card`
| `title`                | string          |   optional    | A title for the card
| `strict`               | boolean         |   optional    | If `true`, each cell must have a match, or row will be hidden [example](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-sorting-strict.md)
| `sort_by[-\|+]`        | col-id          |   optional    | Sort by given column, '+' (ascending) or '-' (descending) [example](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-sorting-strict.md)
| `disable_header_sort`  | boolean         |   optional    | Disable manual sorting by column headers (default: `false`)
| `max_rows`             | int             |   optional    | Restrict the number of (shown) rows to this maximum number
| `clickable`            | boolean         |   optional    | Activates the entities' on-click popup dialog.<a href="#fn1"><sup>[1]</sup></a>
| `selectable`           | boolean         |   optional    | Allows text to be selected and copied
| `enable_search`        | boolean         |   optional    | Enables search bar at top of table to filter rows by text (default: `false`)
| `auto_format`          | boolean         |   optional    | Format state and attribute data using display precision and unit of measurement, if applicable (default: `false`)
| `display_footer`       | boolean         |   optional    | Display additional summary row at end for column totals, averages, etc. (default: `false`, see column options below)
| `css`                  | section         |   optional    | Modify the CSS-style of this flex-table instance [(css example)](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-css.md)
| `...`                  | item(s)         |   optional    | CSS rules, one per line (no hyphen in front of the line)
| `entities`             | section         | **required**  | Section defining the entities, either as the *data sources* or for use by an action (see below). If no entities are required for an action or if using `static_data`, use [] and omit `include/exclude`
| `- ...`                | item(s)         | **required**  | List of entities, one per line if not using `include`/`exclude`
| `action`               | string          |   optional    | Action to act as *data source* instead of entities. Use `entities` to define entities for the action.<a href="#fn2"><sup>[2]</sup></a> See [Examples - Loading from Actions and Scripts](example-cfg-services.md#examples---loading-from-actions-and-scripts)
| `action_data`          | section         |   optional    | Section defining `data` required by the action, if any (see below)
| `...`                  | item(s)         |   optional    | Data items for action, if needed, one per line (no hyphen in front of the line)
| `static_data`          | section         |   optional    | Section to provide *data source* instead of entities or actions. See [Examples - Displaying Static Data](example-cfg-static-data.md#examples---displaying-static-data)
| `...`                  | dict            |   optional    | Dictionary defining static data (see below)
| `columns`              | section         | **required**  | Section defining the column(s) and its contents (see below)
| `- ...`                | item(s)         | **required**  | 


<a name="fn1">1.</a>When `clickable` is used with column actions double actions will occur, which is probably not desirable.

<a name="fn2">2.</a>`Actions` were formerly called `Services`. For backward compatibility, `service` and `service_data` options will continue to be supported for several releases.
                      
***`entities` options (2nd level): selection / querying / filtering***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| `include`            | regexp   | **required**  | Defines the initial entity data source(s), or initial entities for an action (not required if entities not used by action) [basics](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-basics.md)
| `exclude`            | regexp   |   optional    | Reduces the *included* data sources(s) 
 
[auto-entities](https://github.com/thomasloven/lovelace-auto-entities) are also supported, see the 
[examples](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-autoentities.md).
 
***`action_data` options (2nd level)***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| depends on action    | string   |   optional    | Defines any data used by the action. Same format as the `data` section of the action call.
 
[Action call examples](example-cfg-services.md).

***`static_data` options (2nd level)***

| option       | Type     | Required?       | Description
| ------       | ----     | -------------   | -----------
| group key    | string   | **required**    | Top-level dictionary key for the static data array, referenced in `data` selectors of columns.
| data array   | array    | **required**    | Array of dictionaries defining the static data rows, the keys in each dictionary matching the `data` selectors of columns.
 
[Static data examples](example-cfg-static-data.md).

***`css` options (2nd level): [css adaptations](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-css.md)***

| option                 | Type     | Required?     | Description
| ----                   | ----     | ------------- | -----------
| `<css_selector>`       | string   |   optional    | the original &lt;css_selector&gt; will be replaced with option's value
| `<css_selector>+`      | string   |   optional    | `<css_selector>`'s contents are appended to the existing `<css_selector>`;

***`columns` options (2nd level): header definition, column identifcation***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| `name`               | string   |   optional    | column header
| `id`                 | string   |   optional    | unique identifier e.g., to sort one of multiple equally referencing cells

If neither `name` nor `id` is set the identifier for the column will be derived from the content
definition. Apart from `sort_by` no other option requires referencing of this identifier, for easy referencing by
`sort_by` it is considered best practice to set `id` and use it for `sort_by`. [More details and examples](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-headers.md)


***`columns` options (2nd level): visibility, [cell formatting](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-simple-cell-formatting.md), [content manipulation](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-advanced-cell-formatting.md)***

| option                 | Type     | Required?     | Description
| ----                   | ----     | ------------- | -----------
| `data`                 | string   | **required**  | selector for data to be shown, see [column data examples](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-data.md)
| `hidden`               | bool     |   optional    | `true` to avoid showing the column (e.g., for sorting)
| `icon`                 | string   |   optional    | use `icon` inside header (left of `name`), typical `mdi:something` ([cheatsheet](https://cdn.materialdesignicons.com/4.5.95/))
| `modify`               | string   |   optional    | apply java-script code, `x` is data, i.e., `(x) => eval(<modfiy>)`<a href="#fn3"><sup>[3]</sup></a>
| `align`                | enum     |   optional    | text alignment, one of: `left`, `center`, `right` (default: `left`)
| `prefix`               | string   |   optional    | to be applied _before_ all cell contents 
| `suffix`               | string   |   optional    | to be appended _after_ all cell contents
| `no_auto_format`       | boolean  |   optional    | Disable auto formatting for this column when auto_format: true (default: `false`)
| `multi_delimiter`      | string   |   optional    | defaults to ' ', concat multiple selector-data using this string
| `fmt`                  | string   |   optional    | format using predefined 'formatters'<a href="#fn4"><sup>[4]</sup></a>
| `sort_unmodified`      | boolean  |   optional    | Sort using original value before `modify` option, if any, is applied (default: `false`)
| `footer_type`          | string   |   optional    | Used with `display_footer`, one of `sum`, `average`, `count`, `max`, `min`, or `text`
| `footer_text`          | string   |   optional    | Used with `display_footer`, text to be dispayed in this and optionally across several more columns (see `footer_colspan`)
| `footer_colspan`       | string   |   optional    | Used with `display_footer` and `footer_text`, displays text across specified number of columns
| `footer_modify`        | string   |   optional    | Used with `display_footer`, performs same function as `modify` but for summary row only<a href="#fn3"><sup>[3]</sup></a>

<!--|&nbsp;&lt;content&gt; |          | **required**  | see in `column contents` below, one of those must exist! -->

<a name="fn3">3.</a> Use `modify` and `footer_modify` with _caution_ and at your own risk only. This will directly execute code using `eval()`, which is by definition a safety risk. Especially avoid processing any third party APIs / contents with `flex-table-card` using the `modify` or `footer_modify` parameters, *only apply these parameters if you are 100% sure about the contents and origin of the data.* 
Apart from that `modify` and `footer_modify` are very powerful, see [advanced cell formatting](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-advanced-cell-formatting.md).

**Note: In releases after v0.7.7, using `modify` as a data selector is discouraged. The `data` option can now be used to walk complex structures where `modify` was once needed.**

<a name="fn4">4.</a> Currently the available formatters are:

| Name                     | Example Input            | Result              | Description
| ----                     | -------------            | ------              | -----------
| `full_datetime`          | 2025-08-02T07:20:00      | 1754140800000       | Convert a string representation of date into timestamp.
| `hours_passed`           | 2025-12-14T04:32:47.123Z | 13.89               | Provide hours passed since date/time
| `hours_mins_passed`      | 2025-12-14T04:32:47.123Z | 13 hours 53 minutes | Provide hours and minutes passed since date/time
| `number`                 | 250 (modify: x+1): 2501  | 251                 | Convert to Float datatype
| `duration`               | 1000                     | 16:40               | Convert seconds to [[h:]m:]s format
| `duration_h`             | 86461                    | 1d 00:01:01         | Convert seconds to [[[d ]h:]m:]s format
| `icon`                   | mdi:light-switch         | Icon is displayed   | Wrap icon name in `ha-icon` tag
| `device_connections`     | [["mac","64:...:5f"]]    | MAC: 64:...:5F      | Format array of device connections, one per line
| `device_connections_bt`  | [["bluetooth","64:..."]] | 64:...              | Extract and format only Bluetooth addresses from device connections array, one per line
| `device_connections_mac` | [["mac","D0:..."]]       | D0:...              | Extract and format only MAC addresses from device connections array, one per line
| `device_identifiers`     | [["waqi","76.."]]        | waqi: 76..          | Format array of device identifiers, one per line

Feel free to contribute formatters. Just share your best `modify` line to allow others to use them, too.


***`columns` options (2nd level): [editing and calling actions](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-calling-actions.md)***

| option                 | Type     | Required?     | Description
| ----                   | ----     | ------------- | -----------
| `tap_action`           | string   |   optional    | Action taken on cell tap. See [Using Tap Actions](example-cfg-calling-actions.md#using-tap-actions) and [action documentation](https://www.home-assistant.io/dashboards/actions/#tap-action).
| `hold_action`          | string   |   optional    | Action taken on tap-and-hold. See [Using Tap Actions](example-cfg-calling-actions.md#using-tap-actions) and [action documentation](https://www.home-assistant.io/dashboards/actions/#hold-action).
| `double__tap_action`   | string   |   optional    | Action taken on double tap. See [Using Tap Actions](example-cfg-calling-actions.md#using-tap-actions) and [action documentation](https://www.home-assistant.io/dashboards/actions/#double-tap-action).
| `edit_action`          | string   |   optional    | Enables editing and defines action taken to commit edit. See [Using Edit Actions](example-cfg-calling-actions.md#using-edit-actions) and [action documentation](https://www.home-assistant.io/dashboards/actions/#tap-action).

In addition to the `action` types described in the [action documentation](https://www.home-assistant.io/dashboards/actions/#tap-action)
(`more-info`, `toggle`, etc.), the undocumented `action` type `fire-dom-event` is also supported. This is typically used with third-party
integrations such as [`browser_mod`](https://github.com/thomasloven/hass-browser_mod). See
[Using Tap Actions](example-cfg-calling-actions.md#using-tap-actions) for an example of its use.

The tap actions above allow the use of references to data in other columns in the current row on many of their parameters.

Column references take the form of `cell[n]` and `col[n]`, where `n` is the column index number, beginning at zero. The difference 
between them is that `cell` can only reference visible columns, whereas `col` can also reference hidden columns, and for that reason 
may use a different index for subsequent columns after a hidden one. Also, during editing operations with `edit_action`, `cell` 
references will always reflect the latest value (what is visible in the cell), whereas the `col` reference will contain the value 
from the last card refresh.

Action parameters that may contain cell references are:

| Action           | Parameter
| ------           | ---------
| `more-info`      | `entity`
| `toggle`         | `entity`
| `perform-action` | `data`, `target`
| `navigate`       | `navigation_path`
| `url`            | `url_path`
| `fire-dom-event` | entire custom block
| All Actions      | `confirmation`


In some Actions, the entity or entities used for the action can be either the row entity 
or explicitly stated with the `entity` or `target` parameter.

| Action           | Entity Used
| ------           | -----------
| `more-info`      | `entity` if specified, otherwise row entity
| `toggle`         | `entity` if specified, otherwise row entity
| `perform-action` | `target` if specified, otherwise row entity<a href="#fn5"><sup>[5]</sup></a>
| `navigate`       | N/A
| `url`            | N/A
| `assist`         | N/A
| `fire-dom-event` | N/A

<a name="fn5">5.</a>When using `perform-action`, some actions will not need or allow an entity_id.
To prevent the entity_id from being passed, you can add the line:

```yaml
target: {}
```

at the same indent level as `perform_action` and `data`.

Note:  Legacy terms `call-service`, `service`, and `service_data` are not supported for column actions. Use only terms documented in
[Home Assistant Actions documentation](https://www.home-assistant.io/dashboards/actions/) and the above-mentioned `fire-dom-event` action.

[Return to main README.md](../README.md)
