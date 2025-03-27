import {expect, test} from '@playwright/experimental-ct-react'
import CardList from 'client/components/card-list/card-list'
import {CARDS} from 'common/cards'
import {CardEntity, StatusEffectEntity} from 'common/entities'
import {STATUS_EFFECTS} from 'common/status-effects'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
} from 'common/types/server-requests'

test('Test Card List Normal', async ({mount}) => {
	let cards: Array<LocalCardInstance> = [
		{
			id: CARDS['item_balanced_common'].numericId,
			entity: 'Card1' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		},
		{
			id: CARDS['ethoslab_rare'].numericId,
			entity: 'Card2' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		},
		{
			id: CARDS['item_balanced_rare'].numericId,
			entity: 'Card3' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		},
	]

	const component = await mount(
		<CardList cards={cards} displayTokenCost={false} />,
	)

	await expect(component).toHaveScreenshot({maxDiffPixelRatio: 0.03})
})

test('Test Card List with status effects', async ({mount}) => {
	let cards: Array<LocalCardInstance> = [
		{
			id: CARDS['item_balanced_common'].numericId,
			entity: 'Card1' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		},
		{
			id: CARDS['item_balanced_rare'].numericId,
			entity: 'Card2' as CardEntity,
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		},
	]

	let statusEffects: Array<LocalStatusEffectInstance> = [
		{
			id: STATUS_EFFECTS['sleeping'].id,
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

	await expect(component).toHaveScreenshot({maxDiffPixelRatio: 0.03})
})
