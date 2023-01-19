const scrappedList = [
	[
		'Instant Health',
		'Common',
		'Health',
		'Heals +30hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
	],
	[
		'Splash Potion of Healing',
		'Common',
		'Health',
		"Heals player's active and AFK Hermits +20hp.\n\nDiscard after use.",
	],
	[
		'Instant Health II',
		'Rare',
		'Health',
		'Heals +60hp.\n\nCan be used on active or AFK Hermits. Discard after use.',
	],
	[
		'Bed',
		'Ultra Rare',
		'Health',
		"Player sleeps for the next 2 turns. Can't attack. Restores full health.\n\nCan still draw and attach cards while sleeping.\n\nDiscard after player wakes up.",
	],
	[
		'Golden Apple',
		'Ultra Rare',
		'Health',
		'Heals +100hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
	],
	[
		'Bow',
		'Common',
		'Attack',
		'Does +40hp damage to any opposing AFK Hermit.\n\nDiscard after use.',
	],
	[
		'Chorus Fruit',
		'Common',
		'Attack',
		"Swap active Hermit with AFK Hermit at the end of the player's turn.\n\nDiscard after use.",
	],
	[
		'Iron Sword',
		'Common',
		'Attack',
		'Does +20hp damage to opposing Hermit.\n\nDiscard after use.',
	],
	[
		'TNT',
		'Common',
		'Attack',
		'Does +60hp damage to opposing Hermit.\n\nAlso does +20hp damage to user.\n\nDiscard after use.',
	],
	[
		'Crossbow',
		'Rare',
		'Attack',
		"Does +40hp damage to opposing Hermit and +10hp damage to AFK Hermit of player's choice.\n\nDiscard after use.",
	],
	[
		'Diamond Sword',
		'Rare',
		'Attack',
		'Does +40hp damage to opposing Hermit.\n\nDiscard after use.',
	],
	[
		'Golden Axe',
		'Rare',
		'Attack',
		'Does +40hp damage.\n\nIgnores any attached Effect card.\n\nDiscard after use.',
	],
	[
		'Lava Bucket',
		'Rare',
		'Attack',
		'BURNS the opposing Hermit\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN. Discard after use.',
	],
	[
		'Splash Potion of Poison',
		'Rare',
		'Attack',
		'POISONS the opposing Hermit.\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the POISON. Discard after use.',
	],
	[
		'Wolf',
		'Rare',
		'Attack',
		'Opponent takes +20hp damage every time user is attacked until user is knocked out.\n\nDiscard after user is knocked out.',
	],
	[
		'Netherite Sword',
		'Ultra Rare',
		'Attack',
		'Does +60hp damage to opposing Hermit.\n\nDiscard after use.',
	],
	[
		'Milk Bucket',
		'Common',
		'Defense',
		'Stops POISON.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent POISON.\n\nDiscard after user is knocked out.',
	],
	[
		'Gold Armor',
		'Common',
		'Defense',
		'Protects from the first +30hp damage taken.\n\nDiscard following any damage taken.',
	],
	[
		'Iron Armor',
		'Common',
		'Defense',
		'Protects from the first +20hp damage taken.\n\nDiscard after user is knocked out.',
	],
	[
		'Shield',
		'Common',
		'Defense',
		'Protects from the first +10hp damage taken.\n\nDiscard following any damage taken.',
	],
	[
		'Water Bucket',
		'Common',
		'Defense',
		'Stops BURN.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent BURN.\n\nDiscard after user is knocked out.',
	],
	[
		'Diamond Armor',
		'Rare',
		'Defense',
		'Protects from the first +30hp damage.\n\nDiscard after user is knocked out.',
	],
	[
		'Invisibility Potion',
		'Rare',
		'Defense',
		"Flip a Coin.\n\nIf heads, no damage is done on opponent's next turn. If tails, double damage is done.\n\nDiscard after use.",
	],
	[
		'Clock',
		'Ultra Rare',
		'Defense',
		'Opponent skips their next turn.\n\nDiscard after use.',
	],
	[
		'Netherite Armor',
		'Ultra Rare',
		'Defense',
		'Protects from the first +40hp damage.\n\nDiscard after user is knocked out.',
	],
	[
		'Totem',
		'Ultra Rare',
		'Defense',
		'Player recovers +10hp after being knocked out and remains in battle.\n\nDiscard when applied.',
	],
	[
		'Composter',
		'Common',
		'Hand',
		'Discard 2 cards in you hand. Draw 2 cards.\n\nDiscard after use.',
	],
	[
		'Flint & Steel',
		'Common',
		'Hand',
		'Discard your hand. Draw 3 cards.\n\nDiscard after use.',
	],
	[
		'Lead',
		'Common',
		'Hand',
		"Move 1 of your opponents active Hermit's item cards to any their AFK Hermit.\n\nReceiving Hermit must have open item card slot.\n\nDiscard after use.",
	],
	[
		'Chest',
		'Rare',
		'Hand',
		'Look through discard pile and select 1 card to return to hand.\n\nDiscard after use.',
	],
	[
		'Emerald',
		'Rare',
		'Hand',
		'Swap 1 effect card with opposing Hermit.\n\nDiscard after use.',
	],
	[
		'Spyglass',
		'Rare',
		'Hand',
		'Opponent must reveal any 3 cards in their hand.\n\nDiscard after use.',
	],
	[
		'Fishing Rod',
		'Ultra Rare',
		'Hand',
		'Player draws 2 cards from deck.\n\nDiscard after use.',
	],
	[
		'Thorns',
		'Common',
		'Book',
		'Opposing Hermit takes +10HP damage after attack.\n\nDiscard after user is knocked out.',
	],
	[
		'Knockback',
		'Rare',
		'Book',
		"Opposing Hermit goes AFK following user's attack.\n\nOpponent chooses replacement.\n\nCan only be used if opponent has at least 1 AFK Hermit. Discard after use.",
	],
	[
		'Efficiency',
		'Ultra Rare',
		'Book',
		'A coin flip is no longer required and "heads" is assumed.\n\nDiscard after use.',
	],
]

const makeEffectCard = (source) => ({
	id: source[0].toLowerCase().replaceAll(' ', '_'),
	name: source[0],
	rarity: source[1].toLowerCase().replaceAll(' ', '_'),
	description: source[3],
	type: source[3].endsWith('Discard after use.') ? 'single_use' : 'effect',
})

export default scrappedList.reduce((result, item) => {
	const card = makeEffectCard(item)
	result[card.id] = card
	return result
}, {})
