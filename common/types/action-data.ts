import {HermitAttackType} from './attack'
import {SlotTypeT} from './cards'
import {AttackAction, CardT, PlayCardAction} from './game-state'
import {PickResultT, PickedSlotT} from './pick-process'
import {PickResult} from './server-requests'

export const slotToPlayCardAction: Record<SlotTypeT, PlayCardAction> = {
	hermit: 'PLAY_HERMIT_CARD',
	item: 'PLAY_ITEM_CARD',
	effect: 'PLAY_EFFECT_CARD',
	single_use: 'PLAY_SINGLE_USE_CARD',
}
export const attackToAttackAction: Record<HermitAttackType, AttackAction> = {
	'single-use': 'SINGLE_USE_ATTACK',
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
}
export const attackActionToAttack: Record<AttackAction, HermitAttackType> = {
	SINGLE_USE_ATTACK: 'single-use',
	PRIMARY_ATTACK: 'primary',
	SECONDARY_ATTACK: 'secondary',
}

// @TODO long term all data types that can be sent to server should be here

export type PlayCardActionData = {
	type: PlayCardAction
	payload: {
		pickedSlot: PickedSlotT
		card: CardT
		playerId: string
	}
}

export type AttackActionData = {
	type: AttackAction
	payload: {
		pickResults: Record<string, Array<PickResultT>>
		playerId: string
	}
}

export type PickCardActionData = {
	type: 'PICK_CARD'
	payload: {
		pickResult: PickResult
	}
}

export type AnyActionData = PlayCardActionData | AttackActionData | PickCardActionData
