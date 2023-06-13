import {GameModel} from '../../../../server/models/game-model'
import Card from '../_card'

class ItemCard extends Card {
	/**
	 * @param {import('types/cards').ItemDefs} defs
	 */
	constructor(defs) {
		super({
			type: 'item',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {import('types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'item') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit
		if (!pos.row?.hermitCard) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 * @returns {Array<import('types/cards').EnergyT>}
	 */
	getEnergy(game, instance, pos) {
		throw new Error('Implement getEnergy!')
	}
}

export default ItemCard
