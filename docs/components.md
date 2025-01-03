## Components

The code bases's design is loosely based off the `ECS` model for game developement.
That is, everything in the game is a compoent. For example, cards are a component, status effects are a componet, and players are a component.
Componets can be accesed with `game.components`. `components` is an instance of the `ComponentManager` class.
You should exclusively use this system to read the game state.

Componets have two special properties:
- All components have a unique id, called the `entity`.
- Components can be queried with the component query API.

## Querying Game State

To check the current game state, you can use the component query api.
Component queries follow this format:
```ts
function example(game) {
    game.components.find(ComponentType, componentQueryFunction)
}
```
Here is an example query for the active hermit card:

```ts
import {CardComponent} from 'common/components'
import query from 'common/components/query'

function example(game) {
    game.components.find(
        CardComponent,
        query.every(query.card.isHermit, query.card.active)
    )
}
```

You can similarly use the `componets.filter` function to find ALL components that satisfy a function.

