## Hooks

Hooks are used to respond to a change in game state.
Both the game and player components have hooks, that can be subscribed to using an *Observer* component.

Here is an example of subscribing to a hook:

```ts
function example(game, observer) {
    observer.subscribe(
    	game.hooks.onTurnStart,
    	(attack) => {
    		...
    	},
    )
}
```

There also exists priority hooks. Priority hooks have extra control over the order that each
listener receives an event. Available priorities are stored in the `common/types/priorities.ts` file.
There is one "priority dictionary" for each priority hook.
You can go to references for a certain priority category to see when it is used and how.

For priority hooks these use the `subscribeWithPriority` function.
Here is an example of subribing to the `game.hooks.beforeAttack` hook.

```ts
import {beforeAttack} from 'common/types/priorities.ts'

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

