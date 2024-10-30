import {CardComponent} from '../components'
import {hiddenStatusEffect, StatusEffect} from './status-effect'

const SculkCatalystTriggeredEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'sculk-catalyst-triggered',
}

export default SculkCatalystTriggeredEffect
