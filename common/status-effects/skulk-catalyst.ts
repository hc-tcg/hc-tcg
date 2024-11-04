import {CardComponent} from '../components'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const SculkCatalystTriggeredEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'sculk-catalyst-triggered',
}

export default SculkCatalystTriggeredEffect
