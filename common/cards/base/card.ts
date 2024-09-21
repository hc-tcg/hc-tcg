import {CardComponent} from '../../components'
import {DefaultDictionary} from '../../types/game-state'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

/** Type that allows multiple functions in a card to share values. */
export class InstancedValue<T> extends DefaultDictionary<CardComponent, T> {
	public set(component: CardComponent, value: T) {
		this.setValue(component.entity, value)
	}

	public get(component: CardComponent): T {
		return this.getValue(component.entity)
	}

	public clear(component: CardComponent) {
		this.clearValue(component.entity)
	}
}

export function getCardImage() {


}

