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
		const {player, opponentPlayer} = pos

		const canRevives: {[key: string]: boolean} = (player.custom[this.getKey('reviveNextTurn')] ||=
			{}) // Singleton pattern so a player has one persistent Deathloop record

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const attackerInstance = attack.getAttacker()?.row.hermitCard.cardInstance
			if (!attackerInstance) return
			// If this instance is not blocked from reviving, make possible next turn
			if (canRevives[attackerInstance] === undefined) canRevives[attackerInstance] = true
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(instance, (attack) => {
			console.log(canRevives)
			const targetInstance = attack.getTarget()?.row.hermitCard.cardInstance
			if (!targetInstance || !canRevives[targetInstance]) return
			const row = attack.getTarget()?.row
			if (!row || row.health === null || row.health > 0) return

			row.health = 50

			game.state.statusEffects.forEach((ail) => {
				if (ail.targetInstance === targetInstance) {
					removeStatusEffect(game, pos, ail.statusEffectInstance)
				}
			})

			// Prevents hermits from being revived more than once by Deathloop
			canRevives[targetInstance] = false
		})

		player.hooks.onTurnStart.add(instance, () => {
			Object.entries(canRevives).forEach(([cardInstance, wasNotRevived]) => {
				if (wasNotRevived) delete canRevives[cardInstance]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const canRevives = player.custom[this.getKey('reviveNextTurn')]
		const canCleanUp = () => !Object.keys(canRevives).length
		// Remove hooks
		player.hooks.onAttack.remove(instance)

		if (canCleanUp()) {
			opponentPlayer.hooks.afterAttack.remove(instance)
			player.hooks.onTurnStart.remove(instance)
		} else {
			// Reassign hooks to detach when canRevives is empty
			player.hooks.onTurnStart.add(instance, () => {
				Object.entries(canRevives).forEach(([cardInstance, wasNotRevived]) => {
					if (wasNotRevived) delete canRevives[cardInstance]
				})

				opponentPlayer.hooks.afterAttack.remove(instance)
				player.hooks.onTurnStart.remove(instance)
				if (canCleanUp()) player.hooks.afterAttack.remove(instance)
			})
			player.hooks.afterAttack.add(instance, (attack) => {
				const targetRow = attack.getTarget()?.row
				const targetInstance = targetRow?.hermitCard.cardInstance
				if (!targetInstance || !canRevives[targetInstance]) return
				if (!targetRow || targetRow.health === null || targetRow.health > 0) return
				delete canRevives[targetInstance]

				if (canCleanUp()) player.hooks.afterAttack.remove(instance)
			})
		}
	}
}

export default GoodTimesWithScarRareHermitCard
