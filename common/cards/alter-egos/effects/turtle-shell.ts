import assert from 'assert'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {PlayerEntity} from '../../../entities'
import {GameModel, GameValue} from '../../../models/game-model'
import LooseShellEffect from '../../../status-effects/loose-shell'
import {beforeDefence} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

type ActiveInfo = {
	readonly hermit: CardComponent
	readonly stage:
		| 'opponent-activated'
		| 'player-activated'
		| 'defend-then-discard'
		| 'too-late'
}

const lastActiveHermit = new GameValue<
	Record<PlayerEntity, ActiveInfo | undefined>
>(() => {
	return {}
})

const updateRecord = (
	game: GameModel,
	player: PlayerEntity,
	value: ActiveInfo,
) => {
	lastActiveHermit.get(game)[player] = value
	console.info(
		`${value.hermit.props.name} (${value.hermit.slot.inRow() && value.hermit.slot.row.index + 1}) is now "${value.stage}"`,
	)
}

const TurtleShell: Attach = {
	...attach,
	id: 'turtle_shell',
	numericId: 125,
	name: 'Turtle Shell',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	description:
		"Attach to any of your AFK Hermits. On that Hermit's first turn after becoming active, any damage done by your opponent to that Hermit is prevented, and then this card is discarded.",
	attachCondition: query.every(
		attach.attachCondition,
		query.not(query.slot.active),
	),
	onCreate(game: GameModel, component: CardComponent) {
		if (game.id in lastActiveHermit.values) return
		lastActiveHermit.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			newObserver.subscribe(
				player.hooks.onActiveRowChange,
				(oldHermit, newHermit) => {
					if (oldHermit !== null) {
						if (
							lastActiveHermit.get(game)[player.entity]?.hermit.entity ===
							newHermit.entity
						) {
							// Ladder was used to move active hermit to new row
							return
						}
					}
					updateRecord(game, player.entity, {
						hermit: newHermit,
						stage:
							game.currentPlayerEntity === player.entity
								? 'player-activated'
								: 'opponent-activated',
					})
				},
			)

			newObserver.subscribe(player.hooks.onTurnStart, () => {
				game.components.filter(PlayerComponent).forEach((player) => {
					const activeHermit = player.getActiveHermit()
					if (activeHermit === null) {
						delete lastActiveHermit.get(game)[player.entity]
						return
					}

					const activeInfo = lastActiveHermit.get(game)[player.entity]
					assert(activeInfo)
					switch (activeInfo.stage) {
						case 'opponent-activated':
							updateRecord(game, player.entity, {
								hermit: activeHermit,
								stage: 'player-activated',
							})
							break
						case 'player-activated':
							updateRecord(game, player.entity, {
								hermit: activeHermit,
								stage: 'defend-then-discard',
							})
							break
						case 'defend-then-discard':
							updateRecord(game, player.entity, {
								hermit: activeHermit,
								stage: 'too-late',
							})
							break
					}
				})
			})
		})
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		let activated = false
		let shouldDiscard = false

		if (query.slot.active(game, component.slot)) {
			// Only possible with Emerald or Grian's Borrow
			const activeInfo = lastActiveHermit.get(game)[player.entity]
			if (activeInfo) {
				activated = activeInfo.stage !== 'too-late'
				if (!activated)
					game.components
						.new(StatusEffectComponent, LooseShellEffect, component.entity)
						.apply(activeInfo.hermit.entity)
				shouldDiscard = activeInfo.stage === 'defend-then-discard'
			}
		}

		observer.subscribe(
			player.hooks.onActiveRowChange,
			(oldActiveHermit, newActiveHermit) => {
				const myHermitCard = game.components.find(
					CardComponent,
					query.card.isHermit,
					query.card.row(query.row.hasCard(component.entity)),
				)

				if (!myHermitCard) return

				if (newActiveHermit.entity === myHermitCard.entity) {
					const activeInfo = lastActiveHermit.get(game)[player.entity]
					if (activeInfo && activeInfo.hermit.entity === myHermitCard.entity) {
						if (activeInfo.stage === 'too-late') {
							game.components
								.new(StatusEffectComponent, LooseShellEffect, component.entity)
								.apply(activeInfo.hermit.entity)
							return
						}
						activated = true
						if (activeInfo.stage === 'defend-then-discard') shouldDiscard = true
					}
				} else if (
					oldActiveHermit?.entity === myHermitCard.entity &&
					!shouldDiscard
				) {
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							(_game, effect) => effect.creatorEntity === component.entity,
							query.not(query.effect.targetEntity(null)),
						)
						?.remove()
					activated = false
					shouldDiscard = false
				}
			},
		)

		observer.subscribe(component.hooks.onChangeSlot, (newSlot) => {
			if (query.slot.active(game, newSlot)) return
			game.components
				.find(
					StatusEffectComponent,
					query.effect.is(LooseShellEffect),
					(_game, effect) => effect.creatorEntity === component.entity,
					query.not(query.effect.targetEntity(null)),
				)
				?.remove()
			activated = false
			shouldDiscard = false
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (shouldDiscard) {
				component.discard()
			}
		})

		observer.subscribe(player.opponentPlayer.hooks.onTurnStart, () => {
			if (activated) {
				shouldDiscard = true
			}
		})

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.EFFECT_BLOCK_DAMAGE,
			(attack) => {
				if (!component.slot.inRow()) return
				if (!activated) return

				if (!attack.isTargeting(component)) return
				// Do not block backlash or status-effect attacks
				if (attack.isBacklash || attack.isType('status-effect')) return

				if (attack.getDamage() > 0) {
					// Block all damage
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
				}
			},
		)
	},
	onDetach(game, component) {
		game.components
			.filter(
				StatusEffectComponent,
				query.effect.is(LooseShellEffect),
				(_game, effect) => effect.creatorEntity === component.entity,
				query.not(query.effect.targetEntity(null)),
			)
			.forEach((effect) => effect.remove())
	},
}

export default TurtleShell
