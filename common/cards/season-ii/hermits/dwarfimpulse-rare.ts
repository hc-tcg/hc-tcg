import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import GoldenAxe from '../../default/single-use/golden-axe'

class DwarfImpulseRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'dwarf_impulse_rare',
		numericId: 152,
		name: 'Dwarf Impulse',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		type: 'miner',
		health: 260,
		primary: {
			name: 'Barrel Roll',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Can I Axe You A Question?',
			cost: ['miner', 'miner'],
			damage: 80,
			power:
				"When played with Golden Axe, Golden Axe ignores all opponent's attached effect cards and redirects it's damage to one of your opponent's AFK Hermits.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component
		let secondaryUsedThisTurn = false

		player.hooks.onAttach

		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			if (!(activeInstance instanceof GoldenAxe)) return

			activeInstance.selectionAvailable = true
		})

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.isAttacker(component.entity) && attack.type === 'secondary') {
				secondaryUsedThisTurn = true
			}

			const goldenAxe = game.components.find(
				CardComponent,
				query.card.slot(query.slot.singleUse),
				query.card.is(GoldenAxe)
			)
			if (!goldenAxe || !secondaryUsedThisTurn) return

			attack.shouldIgnoreCards.push(
				query.card.slot(
					query.every(query.slot.opponent, query.slot.attach, query.not(query.slot.active))
				)
			)
		})
	}
}

export default DwarfImpulseRare
