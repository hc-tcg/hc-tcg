import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {CardEntity, RowEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import GoldenAxe from '../../default/single-use/golden-axe'

const DwarfImpulseRare: Hermit = {
	...hermit,
	id: 'dwarfimpulse_rare',
	numericId: 152,
	name: 'Dwarf Impulse',
	shortName: 'D. Impulse',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
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
		shortName: 'Axe A Question',
		cost: ['miner', 'miner'],
		damage: 80,
		power:
			"When used with a Golden Axe effect card, all effect cards attached to your opponent's Hermits are ignored, and you can choose one of your opponent's AFK Hermits to take all damage from Golden Axe.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let goldenAxeRedirect: RowEntity | null = null
		let goldenAxeEntity: CardEntity | null = null

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				if (
					activeInstance.entity !== component.entity ||
					hermitAttackType !== 'secondary'
				)
					return

				if (
					!game.components.exists(
						CardComponent,
						query.card.opponentPlayer,
						query.card.slot(query.slot.hermit),
						query.not(query.card.active),
					)
				)
					return

				goldenAxeEntity = game.components.findEntity(
					CardComponent,
					query.card.slot(query.slot.singleUse),
					query.card.is(GoldenAxe),
				)

				if (!goldenAxeEntity) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message:
						"Pick one one of your opponent's AFK Hermits to target with Golden Axe",
					canPick: query.every(
						query.slot.opponent,
						query.slot.hermit,
						query.not(query.slot.empty),
					),
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						goldenAxeRedirect = pickedSlot.rowEntity
					},
				})
			},
		)

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!goldenAxeRedirect) return
			if (
				!attack.isAttacker(goldenAxeEntity) &&
				!attack.isAttacker(component.entity)
			)
				return

			attack.targetEntity = goldenAxeRedirect

			attack.shouldIgnoreCards.push(
				query.card.slot(
					query.every(
						query.slot.opponent,
						query.slot.attach,
						query.not(query.slot.active),
					),
				),
			)
		})

		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			goldenAxeRedirect = null
			goldenAxeEntity = null
		})
	},
}

export default DwarfImpulseRare
