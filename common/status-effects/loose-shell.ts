import {CardComponent} from '../components'
import {StatusEffect, systemStatusEffect} from './status-effect'

const LooseShellEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	icon: 'loose-shell',
	id: 'loose-shell',
	name: 'Loose Shell',
	description:
		'Turtle Shell will not protect this hermit until they first go AFK.',
}

export default LooseShellEffect
