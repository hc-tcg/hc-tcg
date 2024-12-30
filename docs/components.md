## Components

The code bases's design is loosely based off the `ECS` model for game developement.
That is, everything in the game is a compoent. For example, cards are a component, status effects are a componet, and players are a component.

Componets have two special properties:
- All components have a unique id.
- Components can be queried with the component query API.

## Querying Board State

To check the current game state, you can use the component query api.

