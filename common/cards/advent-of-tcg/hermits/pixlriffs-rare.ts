import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
} from '../../../components'
import query from '../../../components/query'
import {CardEntity} from '../../../entities'
import {GameModel, GameValue} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PixlriffsRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'pixlriffs_rare',
		numericId: 215,
		name: 'Pixl',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
		health: 290,
		primary: {
			name: 'Lore Keeper',
			cost: ['explorer'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'World Build',
			cost: ['explorer', 'explorer', 'any'],
			damage: 90,
			power:
				'If this Hermit has moved since the start of your turn, World Build deals 40hp more damage.',
		},
	}

	hermitStartingRow = new GameValue<Record<CardEntity, number | undefined>>(
		() => {
			return {}
		},
	)

	public override onCreate(game: GameModel, component: CardComponent) {
		if (Object.hasOwn(this.hermitStartingRow.values, game.id)) return
		this.hermitStartingRow.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			newObserver.subscribe(player.hooks.onTurnStart, () => {
				game.components
					.filter(
						CardComponent,
						query.card.currentPlayer,
						query.card.slot(query.slot.hermit),
					)
					.forEach((hermitComponent) => {
						if (!hermitComponent.slot.inRow()) return
						this.hermitStartingRow.get(game)[hermitComponent.entity] =
							hermitComponent.slot.row.index
					})
			})

			newObserver.subscribe(player.hooks.onAttach, (instance) => {
				if (!instance.slot.inRow() || instance.slot.type !== 'hermit') return
				this.hermitStartingRow.get(game)[instance.entity] =
					instance.slot.row.index
			})

			newObserver.subscribe(player.hooks.onDetach, (instance) => {
				delete this.hermitStartingRow.get(game)[instance.entity]
			})
		})
	}

	public override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const startingRowIndex =
				this.hermitStartingRow.get(game)[component.entity]
			if (
				startingRowIndex !== undefined &&
				startingRowIndex !== player.activeRow?.index
			) {
				// TODO: Handle "Puppetry"/"Role Play" + Ender Pearl + "Jumpscare" + Naughty Regift to move, return to original row, then use "World Build" in the same turn
				attack.addDamage(component.entity, 40)
			}
		})
	}
}

export default PixlriffsRare
