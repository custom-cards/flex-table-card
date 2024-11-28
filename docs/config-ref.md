## Configuration
The `flex-table-card` aims for more flexibility for tabular-ish visuallization needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- lots of possibilities for configuration: entity selection (include, exclude), action (formerly service) call responses, (hidden-)column-sorting, js-based content manipulation, row limiting and more...

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
| `clickable`            | boolean         |   optional    | Activates the entities' on-click popup dialog
| `auto_format`          | boolean         |   optional    | Format state and attribute data using display precision and unit of measurement, if applicable (default: `false`)
| `display_footer`       | boolean         |   optional    | Display additional summary row at end for column totals, averages, etc. (default: `false`, see column options below)
| `css`                  | section         |   optional    | Modify the CSS-style of this flex-table instance [(css example)](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-css.md)
| `- ...`                | item(s)         |   optional    | 
| `entities`             | section         | **required**  | Section defining the entities, either as the *data sources* or for use by an action (see below). If no entities are required for an action, use [] and omit `include/exclude`
| `- ...`                | item(s)         | **required**  | 
| `action`               | string          |   optional    | Action* to act as *data source* instead of entities. Use `entities` to define entities for the action.
| `action_data`          | section         |   optional    | Section defining `data` required by the action, if any (see below)
| `- ...`                | item(s)         |   optional    | 
| `columns`              | section         | **required**  | Section defining the column(s) and its contents (see below)
| `- ...`                | item(s)         | **required**  | 

* `Actions` were formerly called `Services`. For backward compatibility, `service` and `service_data` options will continue to be supported for several releases.
                      
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
| `modify`               | string   |   optional*   | apply java-script code, `x` is data, i.e., `(x) => eval(<modfiy>)`
| `align`                | enum     |   optional    | text alignment, one of: `left`, `center`, `right` (default: `left`)
| `prefix`               | string   |   optional    | to be applied _before_ all cell contents 
| `suffix`               | string   |   optional    | to be appended _after_ all cell contents
| `no_auto_format`       | boolean  |   optional    | Disable auto formatting for this column when auto_format: true (default: `false`)
| `multi_delimiter`      | string   |   optional    | defaults to ' ', concat multiple selector-data using this string
| `fmt`                  | string   |   optional    | format using predefined 'formatters'
| `sort_unmodified`      | boolean  |   optional    | Sort using original value before `modify` option, if any, is applied (default: `false`)
| `footer_type`          | string   |   optional    | Used with `display_footer`, one of `sum`, `average`, `count`, `max`, `min`, or `text`
| `footer_text`          | string   |   optional    | Used with `display_footer`, text to be dispayed in this and optionally across several more columns (see `footer_colspan`)
| `footer_colspan`       | string   |   optional    | Used with `display_footer` and `footer_text`, displays text across specified number of columns
| `footer_modify`        | string   |   optional*   | Used with `display_footer`, performs same function as `modify` but for summary row only

<!--|&nbsp;&lt;content&gt; |          | **required**  | see in `column contents` below, one of those must exist! -->

*Use `modify` and `footer_modify` with _caution_ and at your own risk only. This will directly execute code using `eval()`, which is by definition a safety risk. Especially avoid processing any third party APIs / contents with `flex-table-card` using the `modify` or `footer_modify` parameters, *only apply these parameters if you are 100% sure about the contents and origin of the data.* 
Apart from that `modify` and `footer_modify` are very powerful, see [advanced cell formatting](https://github.com/custom-cards/flex-table-card/blob/master/docs/example-cfg-advanced-cell-formatting.md).

**Note: In releases after v0.7.7, using `modify` as a data selector is discouraged. The `data` option can now be used to walk complex structures where `modify` was once needed.**

### Currently the available *formatters are: 
* `full_datetime`
* `hours_passed` 
* `hours_mins_passed`
* `number`
* `duration`
* `duration_h`

Feel free to contribute, just share your best `modify` line to allow others to use them, too.


[Return to main README.md](../README.md)
