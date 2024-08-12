import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
} from '../../../components'
import {PlayerEntity} from '../../../entities'
import {GameModel, GameValue} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PixlriffsRare extends CardOld {
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

	startingRow = new GameValue<Record<PlayerEntity, number | undefined>>(() => {
		return {}
	})

	public override onCreate(game: GameModel, component: CardComponent) {
		if (Object.hasOwn(this.startingRow.values, game.id)) return
		this.startingRow.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			newObserver.subscribe(player.hooks.onTurnStart, () => {
				const startingRowIndex = player.activeRow?.index
				if (!startingRowIndex) {
					newObserver.subscribe(player.hooks.onAttach, (_instance) => {
						if (!player.activeRow) return
						this.startingRow.get(game)[player.entity] = player.activeRow.index
						newObserver.unsubscribe(player.hooks.onAttach)
					})
				}
				this.startingRow.get(game)[player.entity] = startingRowIndex
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

			const startingRowIndex = this.startingRow.get(game)[player.entity]
			// Attacker should only be able to change rows with Ender Pearl and Ladder after a knockout
			if (
				startingRowIndex !== undefined &&
				startingRowIndex !== player.activeRow?.index
			)
				attack.addDamage(component.entity, 40)
		})
	}
}

export default PixlriffsRare
