import {SlotComponent} from '../../../components'
import query from '../../../components/query'
import {beforeAttack} from '../../../types/priorities'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Inverter: SingleUse = {
	...singleUse,
	id: 'inverter',
	name: 'Inverter',
	expansion: 'default',
	numericId: 300,
	rarity: 'rare',
	tokens: 5,
	description: 'Invert all damage done this turn.',
	showConfirmationModal: true,
	log: (values) => values.defaultLog,
	onAttach(game, component, observer) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				console.log('Inverted')
				if (attack.player.entity === player.opponentPlayer.entity) return
				return attack.multiplyDamage(component.entity, -1)
			},
		)
	},
}

export default Inverter
