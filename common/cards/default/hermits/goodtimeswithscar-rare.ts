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

			const attackerInstance = attack.attacker?.row.hermitCard.cardInstance
			if (!attackerInstance) return
			// If this instance is not blocked from reviving, make possible next turn
			if (canRevives[attackerInstance] == undefined) canRevives[attackerInstance] = true
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(instance, (attack) => {
			const targetInstance = attack.target?.row.hermitCard.cardInstance
			if (targetInstance && canRevives[targetInstance]) {
				const row = attack.target?.row
				if (!row || row.health === null || row.health > 0) return

				row.health = 50

				const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
					return ail.targetInstance === targetInstance
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail.statusEffectInstance)
				})

				// Prevents hermits from being revived more than once by Deathloop
				canRevives[targetInstance] = false
			}
		})

		player.hooks.onTurnStart.add(instance, () => {
			Object.entries(canRevives).forEach(([cardInstance, wasNotRevived]) => {
				if (wasNotRevived) delete canRevives[cardInstance]
			})
		})

		player.hooks.onHermitDeath.add(instance, (hermitPos) => {
			// Remove revived hermits after they died, if a hermit is replayed after being discarded it should be able to revive again
			const hermitInstance = hermitPos.card?.cardInstance
			if (hermitInstance) delete canRevives[hermitInstance]
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
			player.hooks.onHermitDeath.remove(instance)
		} else {
			// Reassign hooks to detach when canRevives is empty
			player.hooks.onTurnStart.add(instance, () => {
				Object.entries(canRevives).forEach(([cardInstance, wasNotRevived]) => {
					if (wasNotRevived) delete canRevives[cardInstance]
				})

				opponentPlayer.hooks.afterAttack.remove(instance)
				player.hooks.onTurnStart.remove(instance)
				if (canCleanUp()) player.hooks.onHermitDeath.remove(instance)
			})
			player.hooks.onHermitDeath.add(instance, (hermitPos) => {
				const hermitInstance = hermitPos.card?.cardInstance
				if (hermitInstance) delete canRevives[hermitInstance]

				if (canCleanUp()) player.hooks.onHermitDeath.remove(instance)
			})
		}
	}
}

export default GoodTimesWithScarRareHermitCard
