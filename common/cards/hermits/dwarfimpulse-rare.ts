import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {CardEntity, RowEntity} from '../../entities'
import {GameModel} from '../../models/game-model'
import {IgnoreAttachSlotEffect} from '../../status-effects/ignore-attach'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import GoldenAxe from '../single-use/golden-axe'
import {Hermit} from '../types'

const DwarfImpulseRare: Hermit = {
	...hermit,
	id: 'dwarfimpulse_rare',
	numericId: 1233,
	name: 'Dwarf Impulse',
	shortName: 'D. Impulse',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: ['miner'],
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
					) ||
					player.singleUseCardUsed
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
						game.components
							.filterEntities(
								CardComponent,
								query.card.slot(
									query.every(
										query.slot.opponent,
										query.slot.hermit,
										query.not(query.slot.active),
									),
								),
							)
							.forEach((hermit) =>
								game.components
									.new(
										StatusEffectComponent,
										IgnoreAttachSlotEffect,
										component.entity,
									)
									.apply(hermit),
							)
					},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_SET_TARGET,
			(attack) => {
				if (!goldenAxeRedirect || !attack.isAttacker(goldenAxeEntity)) return
				attack.setTarget(component.entity, goldenAxeRedirect)
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				goldenAxeRedirect = null
				goldenAxeEntity = null
			},
		)
	},
}

export default DwarfImpulseRare
