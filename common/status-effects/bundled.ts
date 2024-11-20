import {CardComponent} from '../components'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const BundledEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'bundled',
}

export default BundledEffect
