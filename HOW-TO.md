# How To!

This document contains information on how to work on parts of the game.

# Adding a Card

Adding a card has a few steps:

1. Navigate to the `common/cards/` directory. Find the correct folder to place your card in.
This folder should contain a `index.ts` file with a list of all cards in the directory.


1. Next you need to create your card. Here is a template for cards:
```ts
const MyCard: CardTypeInterface = {
    ...cardTypeDefaults,
	id: 'ethoslab_rare',
	numericId: 20,
	name: 'Etho',
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


Now when you open the game, your card will show up! Albiet, without a image.


## Setting An Image For Your Card
The image for your card should go in the `client/public/images/<your card type>` folder. For hermits additionally a file
must be placed in the `client/public/images/backgrounds/` folder for your hermit's background.

To generate the card images for production you have to options.

1. Run the scripts `npm run client:render-cards` or `npm run client:render-cards-nt`. These scripts require `imagemagick` to be installed.

2. Push your code to github. The helpful hc tcg github actions will generate these images for you and make a commit with them.


# Adding a Status Effect

Adding status effects is quite similar to cards.




