import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'
import { removeAilment } from '../../utils/board'

class GoodTimesWithScarRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_rare',
			numericId: 33,
			name: 'Scar',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Scarred For Life',
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deathloop',
				cost: ['builder', 'any'],
				damage: 70,
				power:
					'If this Hermit is knocked out next turn, they are revived with 50hp.\n\nCan only be revived once.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			player.custom[reviveNextTurn] = true
		})

		opponentPlayer.hooks.afterAttack.add(instance, () => {
			if (player.custom[reviveNextTurn]) {
				if (!row || row.health === null || row.health > 0) return

				row.health = 50

				const ailmentsToRemove = game.state.ailments.filter((ail) => {
					return ail.targetInstance === pos.card?.cardInstance
				})
				ailmentsToRemove.map((ail) => {
					removeAilment(game, pos, ail.ailmentInstance)
				})

				opponentPlayer.hooks.afterAttack.remove(instance)
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[reviveNextTurn]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[reviveNextTurn]
	}
}

export default GoodTimesWithScarRareHermitCard
