import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {applyStatusEffect, hasStatusEffect, removeStatusEffect} from '../../../utils/board'
import Card, {Hermit, hermit} from '../../base/card'

class GoodTimesWithScarRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'goodtimeswithscar_rare',
		numericId: 33,
		name: 'Scar',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
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
				'If this Hermit is knocked out before the start of your next turn, they are revived with 50hp.\nDoes not count as a knockout. This Hermit can only be revived once using this ability.',
		},
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'knockout',
			},
		],
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		let reviveReady = false

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			// If this instance is not blocked from reviving, make possible next turn
			if (!hasStatusEffect(game, instance, 'revived-by-deathloop')) {
				reviveReady = true
			}
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(instance, (attack) => {
			const targetInstance = attack.getTarget()?.row.hermitCard
			if (!targetInstance) return
			if (!reviveReady) return

			reviveReady = false

			const row = attack.getTarget()?.row
			if (!row || row.health === null || row.health > 0) return

			row.health = 50

			game.state.statusEffects.forEach((ail) => {
				if (ail.targetInstance.instance === targetInstance.instance) {
					removeStatusEffect(game, pos, ail)
				}
			})

			game.battleLog.addEntry(
				player.id,
				`Using $vDeathloop$, $p${row.hermitCard.props.name}$ revived with $g50hp$`
			)

			// Prevents hermits from being revived more than once by Deathloop
			applyStatusEffect(game, 'revived-by-deathloop', instance)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default GoodTimesWithScarRareHermitCard
