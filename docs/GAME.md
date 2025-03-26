# Components

The code bases's design is loosely based off the `ECS` model for game development.
That is, everything in the game is a component. For example, cards are a component, status effects are a component, and players are a component.
This allows us to search for components using a "query". This is similar to to how you search for things in a relational database if
you, the reader, are familiar with that.
Components can be accessed with `game.components`. `components` is an instance of the `ComponentManager` class.
You should exclusively use this system to read the game state.

Components have two special properties:
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

You can similarly use the `components.filter` function to find ALL components that satisfy a function.

# Cards

## Changing the Token Cost For a Card
To change the token cost for a card simply follow this process:


1. First navigate to the card. The card should be in the `common/cards/<card type>` directory.
If the card is an advent of tcg card, it will be in the `common/cards/advent-of-tcg/<card type>` dictionary.

1. In the file for this card, change `token: ??` to the new value that you want.

1. Run the unit tests with the `npm run test:unit` command. If they fail, you may need to adjust starter decks so that they have a valid token cost.

## Adding a New Card

Adding a card has a few steps:

1. Navigate to the `common/cards/` directory. Find the correct folder to place your card in.
This folder should contain a `index.ts` file with a list of all cards in the directory.


1. Next you need to create your card. Here is a template for cards:
    ```ts
    const MyCard: CardTypeInterface = {
        ...cardTypeDefaults,
    	id: 'ethoslab_rare',
    	numericId: <New Numeric ID>,
    	name: 'Your Hermit Name',
    	expansion: 'default',
    	rarity: 'rare',
    	tokens: 0,
    }
    ```
    Notes:
    - `CardTypeInterface` is a type imported from `common/cards/types.ts`.
    `cardTypeDefaults` is a dictionary with a similar name imported from `common/cards/defaults.ts`. Make sure these line up!
    The project will helpfully not compile otherwise.
    - Different card types have different properties. Look at a similar card for an example.

1. Your card must be added to the `index.ts` file in the folder you placed it in. Place the card dictionary in the large array in this file.


Now when you open the game, your card will show up! Albeit, without a image.


### Setting An Image For Your Card
The image for your card should go in the `client/public/images/<your card type>` folder. For hermits additionally a file
must be placed in the `client/public/images/backgrounds/` folder for your hermit's background.

To generate the card images for production you have to options.

1. Run the scripts `npm run client:render-cards` or `npm run client:render-cards-nt`. These scripts require `imagemagick` to be installed.

2. Push your code to github. The helpful hc tcg github actions will generate these images for you and make a commit with them.

While developing your card, you can set `renderCardsDynamically: true` in `common/config/debug-config.js` to skip this step.

### Cards With Multiple Levels
For cards with multiple levels, such as Thorns or Instant Health, its best practice to share as much code between them as possible.
To accomplish this, you can create a function that returns a level of the card for given values.
Here is an example of this:

```ts
function newCard(
	props: {
		id: string
		name: string
		rarity: CardRarityT
		numericId: number
		tokens: TokenCostT
	},
	amount: number,
): SingleUse {
	return {
		...singleUse,
		id: props.id,
		numericId: props.numericId,
		name: props.name,
		expansion: 'default',
		rarity: props.rarity,
		tokens: props.tokens,
		description: `Deal ${amount} damage.`,
	}
}

export const LevelOne = newCard(
	{
		id: 'level_one',
		name: 'Level One',
		rarity: 'common',
		numericId: 42,
		tokens: 0,
	},
	30,
)

export const LevelTwo = newInstantHealth(
	{
		id: 'level_two',
		name: 'Level Two',
		rarity: 'rare',
		numericId: 43,
		tokens: 2,
	},
	60,
)
```

### Hooks
To perform an action when the game state changes, the hooks system should be used. See
[./hooks.md](hooks) for more information.

### Saving Information Between Rounds
Saving information between rounds should be done using status effects. This is to ensure
the card works properly with the mocking system that Rendog Rare and ZombieCleo Rare use.
See [./status-effects.md](Status Effects) for more information.

## Adding Tests For Cards
Card tests are done with [`jest`](https://jestjs.io/). Please become familiar with `jest` before continuing.

When creating a new card, you should add tests for any slightly complicated behavior or interactions with other cards that should never change.
Tests should be created in a suitable subdirectory in the `tests/unit/game` directory.
The `utils.ts` file provides you with tools to help create your tests, please read over this file before starting.

To create a test you can use the `testGame` util function. Here is an example of it in use:
```ts
import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Something', () => {
	test('Test Game', () => {
		expect(() =>
			testGame(
				{
					playerOneDeck: [EthosLabCommon],
					playerTwoDeck: [EthosLabCommon],
					saga: function* (game) {
						// Place your tests here
					},
				},
				{oneShotMode: true},
			),
		).toThrow()
	})
})
```

You can run the test you just added with `npm run test:unit -- -t "<your test name>"`.



## Changing the Token Cost For a Card
To change the token cost for a card simply follow this process:


1. First navigate to the card. The card should be in the `common/cards/<card type>` directory.
If the card is an advent of tcg card, it will be in the `common/cards/advent-of-tcg/<card type>` dictionary.

1. In the file for this card, change `token: ??` to the new value that you want.

1. Run the unit tests with the `npm run test:unit` command. If they fail, you may need to adjust starter decks so that they have a valid token cost.

## Adding a New Card

Adding a card has a few steps:

1. Navigate to the `common/cards/` directory. Find the correct folder to place your card in.
This folder should contain a `index.ts` file with a list of all cards in the directory.


1. Next you need to create your card. Here is a template for cards:
    ```ts
    const MyCard: CardTypeInterface = {
        ...cardTypeDefaults,
    	id: 'ethoslab_rare',
    	numericId: <New Numeric ID>,
    	name: 'Your Hermit Name',
    	expansion: 'default',
    	rarity: 'rare',
    	tokens: 0,
    }
    ```
    Notes:
    - `CardTypeInterface` is a type imported from `common/cards/types.ts`.
    `cardTypeDefaults` is a dictionary with a similar name imported from `common/cards/defaults.ts`. Make sure these line up!
    The project will helpfully not compile otherwise.
    - Different card types have different properties. Look at a similar card for an example.

1. Your card must be added to the `index.ts` file in the folder you placed it in. Place the card dictionary in the large array in this file.


Now when you open the game, your card will show up! Albeit, without a image.


### Setting An Image For Your Card
The image for your card should go in the `client/public/images/<your card type>` folder. For hermits additionally a file
must be placed in the `client/public/images/backgrounds/` folder for your hermit's background.

To generate the card images for production you have to options.

1. Run the scripts `npm run client:render-cards` or `npm run client:render-cards-nt`. These scripts require `imagemagick` to be installed.

2. Push your code to github. The helpful hc tcg github actions will generate these images for you and make a commit with them.

While developing your card, you can set `renderCardsDynamically: true` in `common/config/debug-config.js` to skip this step.

### Cards With Multiple Levels
For cards with multiple levels, such as Thorns or Instant Health, its best practice to share as much code between them as possible.
To accomplish this, you can create a function that returns a level of the card for given values.
Here is an example of this:

```ts
function newCard(
	props: {
		id: string
		name: string
		rarity: CardRarityT
		numericId: number
		tokens: TokenCostT
	},
	amount: number,
): SingleUse {
	return {
		...singleUse,
		id: props.id,
		numericId: props.numericId,
		name: props.name,
		expansion: 'default',
		rarity: props.rarity,
		tokens: props.tokens,
		description: `Deal ${amount} damage.`,
	}
}

export const LevelOne = newCard(
	{
		id: 'level_one',
		name: 'Level One',
		rarity: 'common',
		numericId: 42,
		tokens: 0,
	},
	30,
)

export const LevelTwo = newInstantHealth(
	{
		id: 'level_two',
		name: 'Level Two',
		rarity: 'rare',
		numericId: 43,
		tokens: 2,
	},
	60,
)
```

### Hooks
To perform an action when the game state changes, the hooks system should be used. See
[./hooks.md](hooks) for more information.

### Saving Information Between Rounds
Saving information between rounds should be done using status effects. This is to ensure
the card works properly with the mocking system that Rendog Rare and ZombieCleo Rare use.
See [./status-effects.md](Status Effects) for more information.

## Adding Tests For Cards
Card tests are done with [`jest`](https://jestjs.io/). Please become familiar with `jest` before continuing.

When creating a new card, you should add tests for any slightly complicated behavior or interactions with other cards that should never change.
Tests should be created in a suitable subdirectory in the `tests/unit/game` directory.
The `utils.ts` file provides you with tools to help create your tests, please read over this file before starting.

To create a test you can use the `testGame` util function. Here is an example of it in use:
```ts
import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Something', () => {
	test('Test Game', () => {
		expect(() =>
			testGame(
				{
					playerOneDeck: [EthosLabCommon],
					playerTwoDeck: [EthosLabCommon],
					saga: function* (game) {
						// Place your tests here
					},
				},
				{oneShotMode: true},
			),
		).toThrow()
	})
})
```

You can run the test you just added with `npm run test:unit -- -t "<your test name>"`.

# Status Effects

## Proper Use Of Status Effects

Status effects are the only system that should be used to store information between turns.
This is to ensure "mocking" cards like Rendog Rare and ZombieCleo Rare work correctly.

### Adding a New Status Effect

To create a status effect, create a file in `common/status-effects/`. Be sure to add the status effect
to the list in `common/status-effects/index.ts`. Otherwise, it will not work.

### Applying a Status Effect

Status effects can be applied to ALL card types, though most commonly they will be applied
to hermit cards. Applying a status effect requires two steps, first a component must be created,
then the effect can be applied to a card. In the following example, `creator` is the entity
of the component that created the status effect. This should be a card entity. `target` is
the entity of the card to apply this status effect to.

```ts
import StatusEffectComponent from 'common/components/status-effect-component'
import SleepingEffect from 'common/status-effects/sleeping'

target = game.components.find

game.components
	# Create the status effect component
	.new(StatusEffectComponent, SleepingEffect, creator.entity)
	# Apply the status effect to a card
	.apply(target.entity)
```

