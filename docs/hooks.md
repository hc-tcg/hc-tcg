## Hooks

Hooks are used to respond to a change in game state.
Both the game and player components have hooks, that can be subscribed to using an *Observer* component.

Some hooks are priority hooks, for these use the `subscribeWithPriority` function.
Here is an example of subribing to the `game.hooks.beforeAttack` hook.

```ts
function example(game, observer) {
    observer.subscribeWithPriority(
    	game.hooks.beforeAttack,
    	beforeAttack.HERMIT_APPLY_ATTACK,
    	(attack) => {
    		...
    	},
    )
}
```

