type GlossaryEntry = {
	name: string
	description: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
	missed: {
		name: 'Missed',
		description: "Missed attacks deal 0 damage, but don't prevent any abilities from happening.",
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
		description: 'When your Hermit card is knocked out, you lose one life.',
	},
}
