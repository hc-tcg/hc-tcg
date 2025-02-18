import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {MockedAttack, setupMockCard} from '../../utils/attacks'
import BerryBush from '../advent-of-tcg/attach/berry-bush'
import ArmorStand from '../attach/armor-stand'
import {InstancedValue} from '../card'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.hermit,
	query.not(query.slot.empty),
	query.not(query.slot.active),
	query.not(query.slot.has(ArmorStand, BerryBush)),
)

const mockedAttacks = new InstancedValue<MockedAttack | null>(() => null)

const ZombieCleoRare: Hermit = {
	...hermit,
	id: 'zombiecleo_rare',
	numericId: 116,
	name: 'Cleo',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'pvp',
	health: 290,
	primary: {
		name: 'Dismissed',
		cost: ['pvp'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Puppetry',
		cost: ['pvp', 'pvp', 'pvp'],
		damage: 0,
		power: 'Use an attack from any of your AFK Hermits.',
	},
	getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	) {
		if (hermitAttackType !== 'secondary')
			return hermit.getAttack.call(this, game, component, hermitAttackType)

		const mockedAttack = mockedAttacks.get(component)
		if (!mockedAttack) return null

		let newAttack = mockedAttack.getAttack()
		if (!newAttack) return null

		const attackName = mockedAttack.attackName
		newAttack.updateLog((values) => {
			if (
				values.attack.getDamageMultiplier() === 0 ||
				!values.attack.target?.getHermit()
			) {
				return `${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked with ${values.attackName} and missed`
			}
			return `${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
				values.target
			} with $v${mockedAttack.hermitName}'s ${attackName}$ for ${values.damage} damage`
		})
		return newAttack
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				// Make sure we have an afk hermit to pick
				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick one of your AFK Hermits',
					canPick: pickCondition,
					onResult: (pickedSlot) => {
						const pickedCard =
							pickedSlot.getCard() as CardComponent<Hermit> | null
						if (!pickedCard) return

						game.addCopyAttackModalRequest({
							player: player.entity,
							modal: {
								type: 'copyAttack',
								name: 'Cleo: Choose an attack to copy',
								description:
									"Which of the Hermit's attacks do you want to copy?",
								hermitCard: pickedCard.entity,
								cancelable: true,
							},
							onResult: (modalResult) => {
								if (!modalResult) return
								if (modalResult.cancel) {
									// Cancel this attack so player can choose a different hermit to imitate
									game.state.turn.currentAttack = null
									game.cancelPickRequests()
									return
								}
								if (!modalResult.pick) return

								// Store the card to copy when creating the attack
								mockedAttacks.set(
									component,
									setupMockCard(game, component, pickedCard, modalResult.pick),
								)

								return
							},
							onTimeout: () => {
								mockedAttacks.set(
									component,
									setupMockCard(game, component, pickedCard, 'primary'),
								)
							},
						})
					},
					onTimeout() {
						// We didn't pick someone so do nothing
					},
				})
			},
		)

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			if (query.card.is(ZombieCleoRare)(game, component))
				if (!game.components.exists(SlotComponent, pickCondition)) {
					blockedActions.push('SECONDARY_ATTACK')
				}

			return blockedActions
		})
	},
	onDetach(
		_game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		mockedAttacks.clear(component)
	},
}

export default ZombieCleoRare
