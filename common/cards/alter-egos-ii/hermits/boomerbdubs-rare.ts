import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class BoomerBdubsRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'boomerbdubs_rare',
		numericId: 228,
		name: 'Boomer Bdubs',
		shortName: 'Boomer B.',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'redstone',
		health: 290,
		primary: {
			name: 'Boom',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'Watch This',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power:
				'Flip a coin as many times as you want.\nDo an additional 20hp damage for every heads, but if tails is flipped, this attack deals 0hp total damage.',
		},
	}

	public override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = component
		const componentKey = this.getInstanceKey(component)

		let extraDamage = 0

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			const activeHermit = getActiveRow(player)?.hermitCard

			if (!activeHermit) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Boomer BDubs: Coin Flip',
						modalDescription: 'Do you want to flip a coin for your attack?',
						cards: [],
						selectionSize: 0,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'

					const flip = flipCoin(player, activeHermit)[0]

					if (flip === 'tails') {
						extraDamage = 0
						return 'SUCCESS'
					}

					extraDamage += 20

					player.hooks.getAttackRequests.call(activeInstance, hermitAttackType)

					// This is sketchy AF but fortune needs to be removed after the first coin flip
					// to prevent infinite flips from being easy.
					const fortuneInstances = player.playerDeck.filter(
						(card) => card.props.numericId === 'fortune'
					)
					fortuneInstances.forEach((card) => player.hooks.onCoinFlip.remove(card))

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})

		player.hooks.beforeAttack.add(component, (attack) => {
			if (attack.id !== componentKey || attack.type !== 'secondary') return
			if (extraDamage === 0) {
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
				return
			}

			attack.addDamage(this.props.id, extraDamage)
		})
	}

	public override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = component
		const componentKey = this.getInstanceKey(component)

		player.hooks.getAttackRequests.remove(component)
		player.hooks.beforeAttack.remove(component)
		player.hooks.onTurnEnd.remove(component)
	}
}

export default BoomerBdubsRare
