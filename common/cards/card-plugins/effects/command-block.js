import EffectCard from './_effect-card'

class CommandBlockEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'command_block',
			name: 'Command Block',
			rarity: 'rare',
			description:
				"Attach to any active or AFK Hermit.\n\nItems attached to this Hermit become any type.\n\nThis card can only be removed once the Hermit it's attached to is knocked out.",
		})		
	}

	/**
	 * @returns {boolean}
	 */
	getIsRemovable() {
		return false
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default CommandBlockEffectCard
