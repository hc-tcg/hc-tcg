import {describe, expect, test} from '@jest/globals'
import * as ReactTestRenderer from 'react-test-renderer'
import {EndTurnModalInner} from 'client/app/game/modals/end-turn-modal'

describe('Test End Turn Modal', () => {
	test('No Actions', () => {
		expect(
			ReactTestRenderer.create(
				<EndTurnModalInner availableActions={[]} />,
			).toJSON(),
		).toMatchSnapshot()
	})
	test('All play card actions', () => {
		expect(
			ReactTestRenderer.create(
				<EndTurnModalInner
					availableActions={[
						'PLAY_HERMIT_CARD',
						'PLAY_ITEM_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'CHANGE_ACTIVE_HERMIT',
					]}
				/>,
			).toJSON(),
		).toMatchSnapshot()
	})
	test('All play card actions', () => {
		expect(
			ReactTestRenderer.create(
				<EndTurnModalInner
					availableActions={[
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'SINGLE_USE_ATTACK',
					]}
				/>,
			).toJSON(),
		).toMatchSnapshot()
	})
	test('All play card actions and attacks', () => {
		expect(
			ReactTestRenderer.create(
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
			).toJSON(),
		).toMatchSnapshot()
	})
	test('Waiting actions', () => {
		expect(
			ReactTestRenderer.create(
				<EndTurnModalInner
					availableActions={['WAIT_FOR_TURN', 'WAIT_FOR_OPPONENT_ACTION']}
				/>,
			).toJSON(),
		).toMatchSnapshot()
	})
})
