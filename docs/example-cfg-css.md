## Examples - CSS / Low-Level Formatting

By configuring options within `css`, `flex-table-card` allows full low-level
control of the underlying CSS for this specific `flex-table-card` instance.

Usually this should be handled by the currently active theme within 
home-assistant. Nevertheless, one might want to have more control how 
`flex-table-card` is shown. 

The currently used CSS is to be found
[here](https://github.com/custom-cards/flex-table-card/blob/a5db6ee51c54240b64a304a33b452d87dc43e87f/flex-table-card.js#L217).
The following CSS selectors are used: `table`, `thead th`, `tr td`, `tr
td.left`, `th`, `th.left`, `tr td.center`, `th.center`, `tr td.right`,
`th.right`, `tbody tr:nth-child(odd)`, `tbody tr:nth-child(even)`

`css` can contain any number of arbitrary (also additional) css-selectors and
values.  Providing a "+" at the end of the css-selector translates to
__appending__ the provided option value to the (not necessarily) existing
&lt;css_selector&gt;, omitting the "+" will always __replace__ the
css-selector's contents. 

The curly brackets are omitted, thus a &lt;css-selector&gt; and its assigned
&lt;value&gt; always translates to: 
```css 
<css-selector>: { <value> } 
```

A complete example:

``` yaml
type: custom:flex-table-card 
title: Fancy tabular temperature data
strict: true
max_rows: 10
entities:
  include: sensor.*

columns:
  - name: NodeID
    data: node_id
  - name: Temperature
    data: temperature

css:
  # remove borders from table (by appending 'border:0;' to its value)
  table+: "border: 0;"

  # remove borders from table (replace any existing value for this css-selector) 
  table: "border:0;"

  # complex css-selectors also work, as long as the json-key is in quotes
  'tbody tr:nth-child(even)': 'background-color: #a2542f6;'

  # custom color (`#4eb`) for a column (by index, here `1`)
  'tbody tr td:nth-child(1)': 'background-color: #efb'

  # custom color for full row (`#a3b`) include `!important` to enable overwriting of default colors
  tbody tr: 'background-color: #a3b !important'

  # custom color (`#aaa`) for column  header, change font-color using simple `color:`
  thead th: 'background-color: #aaa'

  # apply to only specific columns by index, similar to the 1st CSS-property above 
  'thead th:nth-child(2)': 'background-color: #5f3'
```


[Return to main README.md](../README.md)
