type GlossaryEntry = {
	name: string
	description: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
	missed: {
		name: 'Missed',
		description:
			'A missed attack does not deal any damage, including damage from its ability. Effects and status effects can not miss.',
	},
	turnSkip: {
		name: 'Turn Skip',
		description:
			'A player whose turn is skipped can only choose to change their active Hermit. They still draw a card at the end of their turn. Turns can not be skipped consecutively.',
	},
	weak: {
		name: 'Weak',
		description:
			"Hermits take 20hp extra damage if they are weak to the Hermit they were attacked by, provided the attack doesn't miss.",
	},
	knockout: {
		name: 'Knockout',
		description:
			'When your Hermit card is knocked out and removed from the game board, you lose one life.',
	},
}
