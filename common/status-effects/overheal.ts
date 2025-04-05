import {CardComponent} from '../components'
import {StatusEffect, systemStatusEffect} from './status-effect'

const OverhealEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'overheal',
	icon: 'overheal',
	name: 'Overheal',
	description: 'This hermit can be healed above max hp.',
}

export default OverhealEffect
