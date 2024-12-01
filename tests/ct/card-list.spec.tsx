import {expect, test} from '@playwright/experimental-ct-react'
import CardList from 'client/components/card-list/card-list'
import {CARDS} from 'common/cards'
import {CardEntity, StatusEffectEntity} from 'common/entities'
import {STATUS_EFFECTS} from 'common/status-effects'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
	WithoutFunctions,
} from 'common/types/server-requests'

test('Test Card List Normal', async ({mount}) => {
	let cards: Array<LocalCardInstance> = [
		{
			props: WithoutFunctions(CARDS['item_balanced_common']),
			entity: 'Card1' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
		},
		{
			props: WithoutFunctions(CARDS['ethoslab_rare']),
			entity: 'Card2' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
		},
		{
			props: WithoutFunctions(CARDS['item_balanced_rare']),
			entity: 'Card3' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
		},
	]

	const component = await mount(
		<CardList cards={cards} displayTokenCost={false} />,
	)

	await expect(component).toHaveScreenshot()
})

test('Test Card List with status effects', async ({mount}) => {
	let cards: Array<LocalCardInstance> = [
		{
			props: WithoutFunctions(CARDS['item_balanced_common']),
			entity: 'Card1' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
		},
		{
			props: WithoutFunctions(CARDS['item_balanced_rare']),
			entity: 'Card2' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
		},
	]

	let statusEffects: Array<LocalStatusEffectInstance> = [
		{
			props: WithoutFunctions(STATUS_EFFECTS['sleeping']),
			instance: "Doesn't Matter" as StatusEffectEntity,
			target: {type: 'card', card: 'Card1' as CardEntity},
			counter: 3,
			description: '',
		},
	]

	const component = await mount(
		<CardList
			cards={cards}
			displayTokenCost={false}
			statusEffects={statusEffects}
		/>,
	)

	await expect(component).toHaveScreenshot()
})
