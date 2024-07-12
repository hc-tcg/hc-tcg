import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

/*
- Beef confirmed that double damage condition includes other rare mumbos.
*/
class MumboJumboRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'mumbojumbo_rare',
		numericId: 81,
		name: 'Mumbo',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'prankster',
		health: 290,
		primary: {
			name: 'Moustache',
			cost: ['prankster'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Quite Simple',
			cost: ['prankster', 'prankster'],
			damage: 40,
			power:
				'Flip a coin twice. Do an additional 20hp damage for every heads. Total attack damage doubles if you have at least one other AFK Prankster.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary' || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 2)
			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			const pranksterAmount = player.board.rows.filter(
				(row, index) =>
					row.hermitCard &&
					index !== player.board.activeRow &&
					row.hermitCard.isHermit() &&
					row.hermitCard.props.type === 'prankster'
			).length

			attack.addDamage(this.props.id, headsAmount * 20)
			if (pranksterAmount > 0) attack.multiplyDamage(this.props.id, 2)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default MumboJumboRareHermitCard
