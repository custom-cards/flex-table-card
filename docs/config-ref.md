## Configuration
The `flex-table-card` aims for more flexibility for tabular-ish visuallization needs, by realizing:

- unlimited columns / rows 
- various different data-sources may be used in a single table
- lots of possibilities for configuration: entity selection (include, exclude), (hidden-)column-sorting, js-based content manipulation, row limiting and more...

Flex Table gives you the possibility to visualize any tabular data within Lovelace. Especially overviews with high data densities can be easily realized. Some screenshots:

**Configuration Options**

***Top-level options***

| Name                   | Type            | Required?     | Description
| ----                   | ----            | ------------- | -----------
| `type`                 | string          | **required**  | `custom:flex-table-card`
| `title`                | string          |   optional    | A title for the card
| `strict`               | boolean         |   optional    | If `true`, each cell must have a match, or row will be hidden
| `sort_by[-\|+]`        | col-id          |   optional    | Sort by given column identifier, append '+' (ascending) or '-' (descending)
| `max_rows`             | int             |   optional    | Restrict the number of (shown) rows to this maximum number
| `clickable`            | boolean         |   optional    | Activates the entities' on-click popup dialog
| `css`                  | section         |   optional    | Adapt, extend the CSS-style of this flex-table instance (see below)
| `- ...`                | section item(s) |   optional    | 
| `entities`             | section         | **required**  | Section defining the entities, i.e., *data sources* (see below)
| `- ...`                | section item(s) | **required**  | 
| `columns`              | section         | **required**  | Section defining the column(s) and its contents (see below)
| `- ...`                | section item(s) | **required**  | 
                      
                      
***`entities` options (2nd level): selection / querying / filtering***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| include              | regexp   | **required**  | Defines the initial entity data source(s)
| exclude              | regexp   |   optional    | Reduces the *included* data sources(s) 
 
***`css` options (2nd level): css adaptations***

| option                     | Type     | Required?     | Description
| ----                       | ----     | ------------- | -----------
| &lt;css_selector&gt;       | string   |   optional    | the original &lt;css_selector&gt; will be replaced with option's value
| &lt;css_selector&gt;+      | string   |   optional    | &lt;css_selector&gt;'s contents are appended to the existing &lt;css_selector&gt;


***`columns` options (2nd level): header definition, column identifcation***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| name                 | string   |   optional    | column header
| id                   | string   |   optional    | unique identifier e.g., to sort one of multiple equally referencing cells

If neither `name` nor `id` is set the identifier for the column will be derived from the content
definition. Apart from `sort_by` no other option requires referencing of this identifier, for easy referencing by
`sort_by` it is considered best practice to set `id` and use it for `sort_by`. 

***`columns` options (2nd level): visibility, formatting, content manipulation***

| option               | Type     | Required?     | Description
| ----                 | ----     | ------------- | -----------
| hidden               | bool     |   optional    | `true` to avoid showing the column (e.g., for sorting)
| icon                 | string   |   optional    | use `icon` inside header (left of `name`), typical `mdi:something` ([cheatsheet](https://cdn.materialdesignicons.com/4.5.95/))
| modify               | string   |   optional*   | apply java-script code, `x` is data, i.e., `(x) => eval(<modfiy>)`
| align                | enum     |   optional    | text alignment, one of: `left`, `center`, `right` (default: `left`)
| prefix               | string   |   optional    | to be applied _before_ all cell contents 
| suffix               | string   |   optional    | to be appended _after_ all cell contents

<!--|&nbsp;&lt;content&gt; |          | **required**  | see in `column contents` below, one of those must exist! -->

*Use `modify` with _caution_ and on your own risk only. This will directly execute code using `eval()`, which is by definition a safety risk. Especially avoid processing any third party APIs / contents with `flex-table-card` using the `modify` parameter, *only apply this parameter, if you are 100% sure about the contents and origin of the data.*

***`columns` (content) options (2nd level): column (cell) content definition, one required and mutually exclusive***

| option            | Type              | Description
| ---------------   | ----              | -----------
| attr              | regexp            | matches to the first attribute matching this regexp
| prop              | string            | matches the entity's state members, e.g. **state** (any from [here](https://www.home-assistant.io/docs/configuration/state_object/) )
| attr_as_list      | string            | matched attribute is expected to contain a list, each expanded to a row

***`columns` (content) options (2nd level): allows multiple content definitions for a single cell***
| option            | Type              | Description
| ---------------   | ----              | -----------
| multi             | list-of-2-strings | matches each pair within list as above: select multiple matches, concat all using `multi_delimiter` see [#19](https://github.com/custom-cards/flex-table-card/issues/19) for an example.
| multi_delimiter   | string            | defaults to ' ', thus concat `multi`-items using a whitespace


[Return to main README.md](../README.md)
