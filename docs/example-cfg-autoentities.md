## Examples - Auto Entities

<!-- [full text section] -->
Example configuration to use flex-table-card in conjunction with [auto-entities](https://github.com/thomasloven/lovelace-auto-entities):

<!-- [listing section] -->
``` yaml
# Auto Entities configuration
type: 'custom:auto-entities'
filter:
  include:
    - name: "/^Luci .*$/"
    - entity_id: "/light.luce_*/"
card:
  # Flex Table configuration
  # Filtering is obviously missing because auto-entities will take care of that
  type: 'custom:flex-table-card'
  title: Auto Entities Example
  clickable: true
  columns:
    - data: friendly_name              
      name: Friendly Name
    - data: state           
      name: State 
  css:
    table+: 'padding-top: 5px;'
    'tbody tr:nth-child(even)': 'background-color: #a2542f6;'
    td.left: 'padding: 10px 10px 10px 10px'
    th.left: 'padding: 0px 0px 10px 3px'
    'th.left:nth-child(1)': 'width: 33%;'
    'th.left:nth-child(2)': 'width: 33%;'
    'th.left:nth-child(3)': 'width: 33%;'
```

<!-- [example image section] -->
<!-- use issue #29 for dumping images and link them here -->
![Result](https://user-images.githubusercontent.com/16034687/78148053-a98e0600-7434-11ea-8e75-16e942d277f5.png)

[Return to main README.md](../README.md)
