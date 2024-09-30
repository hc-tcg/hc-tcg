import {describe, expect, test} from '@jest/globals'

import {EndTurnModalInner} from 'client/app/game/modals/end-turn-modal'

describe('Test End Turn Modal', () => {
	test('No Actions', () => {
		expect(<EndTurnModalInner availableActions={[]} />).toMatchSnapshot()
	})
	test('All play card actions', () => {
		expect(
			<EndTurnModalInner
				availableActions={[
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD',
					'CHANGE_ACTIVE_HERMIT',
				]}
			/>,
		).toMatchSnapshot()
	})
	test('All play card actions', () => {
		expect(
			<EndTurnModalInner
				availableActions={[
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'SINGLE_USE_ATTACK',
				]}
			/>,
		).toMatchSnapshot()
	})
	test('All play card actions and attacks', () => {
		expect(
			<EndTurnModalInner
				availableActions={[
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD',
					'CHANGE_ACTIVE_HERMIT',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'SINGLE_USE_ATTACK',
				]}
			/>,
		).toMatchSnapshot()
	})
	test('Waiting actions', () => {
		expect(
			<EndTurnModalInner
				availableActions={['WAIT_FOR_TURN', 'WAIT_FOR_OPPONENT_ACTION']}
			/>,
		).toMatchSnapshot()
	})
})
