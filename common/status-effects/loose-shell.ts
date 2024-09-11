import {CardComponent} from '../components'
import {StatusEffect, systemStatusEffect} from './status-effect'

const LooseShellEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	icon: 'loose-shell',
	id: 'loose-shell',
	name: 'Loose Shell',
	description:
		'Turtle Shell will not protect this hermit until the next time they become active.',
}

export default LooseShellEffect
