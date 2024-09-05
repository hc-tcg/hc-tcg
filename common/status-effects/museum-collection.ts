import {PlayerComponent} from '../components'
import {Counter, systemStatusEffect} from './status-effect'

const MuseumCollectionEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'museum-collection',
	icon: 'museum-collection',
	name: 'Museum Collection Size',
	description:
		'Number of cards you\'ve played this turn. Each card adds 20 damage to the attack "Biffa\'s Museum".',
	counter: 0,
	counterType: 'number',
	applyCondition: (_game, value) => {
		return (
			value instanceof PlayerComponent &&
			!value.hasStatusEffect(MuseumCollectionEffect)
		)
	},
}

export default MuseumCollectionEffect
