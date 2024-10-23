import {CardComponent} from '../components'
import {StatusEffectComponent} from '../components'
import {DefaultDictionary} from '../types/game-state'

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> extends DefaultDictionary<
	CardComponent | StatusEffectComponent,
	T
> {
	public set(component: CardComponent | StatusEffectComponent, value: T) {
		this.setValue(component.entity, value)
	}

	public get(component: CardComponent | StatusEffectComponent): T {
		return this.getValue(component.entity)
	}

	public clear(component: CardComponent | StatusEffectComponent) {
		this.clearValue(component.entity)
	}
}
