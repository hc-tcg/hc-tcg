import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {GameModel} from '../../../models/game-model'
import {executeExtraAttacks} from '../../../utils/attacks'
import * as query from '../../../components/query'
import {RowEntity} from '../../../entities'
import {AttackDefs} from '../../../types/attack'

class SkizzlemanRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'skizzleman_rare',
		numericId: 172,
		name: 'Skizz',
		expansion: 'season_x',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
		health: 290,
		primary: {
			name: 'Hupper Cut ',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Gas Light',
			cost: ['builder', 'builder'],
			damage: 70,
			power:
				"At the end of your turn, deal 20hp damage to each of your opponent's AFK hermits that took damage this turn.",
		},
	}

	newGasLightAttack(component: CardComponent, target: RowEntity) {
		return {
			attacker: component.entity,
			target: target,
			type: 'secondary',
			log: (values) => `${values.target} took ${values.damage} damage from $vGas Light$`,
		} satisfies AttackDefs
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		let attackedEntities = new Set<RowEntity>()
		let usedSecondary = false

		observer.subscribe(player.hooks.onTurnStart, () => {
			attackedEntities = new Set()
			usedSecondary = false
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (attack.isAttacker(component.entity) && attack.type === 'secondary') {
				usedSecondary = true
			}
		})

		observer.subscribe(opponentPlayer.hooks.onDefence, (attack) => {
			// Status effect attacks have a special case because they happen at the end of the turn
			if (attack.type === 'status-effect' && attack.targetEntity) {
				if (
					attackedEntities.has(attack.targetEntity) ||
					opponentPlayer.activeRowEntity === attack.targetEntity
				)
					return
				attack.addNewAttack(game.newAttack(this.newGasLightAttack(component, attack.targetEntity)))
				return
			}

			if (attack.targetEntity) attackedEntities.add(attack.targetEntity)
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (!usedSecondary) return
			let extraAttacks = [...attackedEntities.values()].map((entity) => {
				let attack = game
					.newAttack(this.newGasLightAttack(component, entity))
					.addDamage(component.entity, 20)
				attack.shouldIgnoreCards.push(query.card.entity(component.entity))
				return attack
			})

			executeExtraAttacks(game, extraAttacks)
		})
	}
}

export default SkizzlemanRare
