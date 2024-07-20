import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {GameModel} from '../../../models/game-model'
import {RowEntity} from '../../../entities'
import {executeExtraAttacks} from '../../../utils/attacks'

class SkizzlemanRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'skizzleman_rare',
		numericId: 172,
		name: 'Skizz',
		expansion: 'season_x',
		background: 'alter_egos',
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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const attackedEntities: Array<RowEntity | null> = []

			if (!attackedEntities.includes(attack.targetEntity)) return
			attackedEntities.push(attack.targetEntity)

			const extraAttack = game
				.newAttack({
					attacker: component.entity,
					target: attack.targetEntity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $vGas Light$`,
				})
				.addDamage(component.entity, 20)

			executeExtraAttacks(game, [extraAttack])
		})
	}
}

export default SkizzlemanRare
