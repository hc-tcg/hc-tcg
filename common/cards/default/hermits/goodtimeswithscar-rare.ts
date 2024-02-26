import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'
import {removeStatusEffect} from '../../../utils/board'

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

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(instance, () => {
			if (player.custom[reviveNextTurn]) {
				if (!row || row.health === null || row.health > 0) return

				row.health = 50

				const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
					return ail.targetInstance === pos.card?.cardInstance
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail.statusEffectInstance)
				})

				opponentPlayer.hooks.afterAttack.remove(instance)
			}
		})

		player.hooks.onTurnStart.add(instance, () => {
			delete player.custom[reviveNextTurn]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		delete player.custom[reviveNextTurn]
	}
}

export default GoodTimesWithScarRareHermitCard
