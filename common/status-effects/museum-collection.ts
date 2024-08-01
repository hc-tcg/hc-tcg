import {Counter, PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {PlayerComponent} from '../components'

class MuseumCollectionEffect extends PlayerStatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		icon: 'museum-collection',
		name: 'Museum Collection Size',
		description:
			'Number of cards you\'ve played this turn. Each card adds 20 damage to the attack "Biffa\'s Museum".',
		counter: 0,
		counterType: 'number',
		applyCondition: (_game, value) => {
			return value instanceof PlayerComponent && !value.hasStatusEffect(MuseumCollectionEffect)
		},
	}
}

export default MuseumCollectionEffect
