import {SlotEntity} from '../entities'
import {HermitAttackType} from './attack'
import {CardCategoryT} from './cards'
import {AttackAction, PlayCardAction} from './game-state'
import {LocalCardInstance, LocalModalResult} from './server-requests'

export const slotToPlayCardAction: Record<CardCategoryT, PlayCardAction> = {
	hermit: 'PLAY_HERMIT_CARD',
	item: 'PLAY_ITEM_CARD',
	attach: 'PLAY_EFFECT_CARD',
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
	slot: SlotEntity
	card: LocalCardInstance
}

export type ChangeActiveHermitActionData = {
	type: 'CHANGE_ACTIVE_HERMIT'
	entity: SlotEntity
}

export type AttackActionData = {
	type: AttackAction
}

export type PickSlotActionData = {
	type: 'PICK_REQUEST'
	entity: SlotEntity
}

export type ModalResult = {
	type: 'MODAL_REQUEST'
	modalResult: LocalModalResult
}

export type OtherTurnActions = {
	type:
		| 'END_TURN'
		| 'APPLY_EFFECT'
		| 'REMOVE_EFFECT'
		| 'PICK_REQUEST'
		| 'WAIT_FOR_TURN'
		| 'WAIT_FOR_OPPONENT_ACTION'
}

export type AnyTurnActionData =
	| OtherTurnActions
	| PlayCardActionData
	| ChangeActiveHermitActionData
	| AttackActionData
	| PickSlotActionData
	| ModalResult
