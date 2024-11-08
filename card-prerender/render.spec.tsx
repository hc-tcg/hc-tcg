import {test} from '@playwright/experimental-ct-react'
import EffectCard from 'client/components/card/effect-card-svg'
import HermitCard from 'client/components/card/hermit-card-svg'
import ItemCard from 'client/components/card/item-card-svg'
import {CARDS_LIST, hermitCardClasses} from 'common/cards'

test('Render Cards To PNG', async ({page, mount}) => {
	let components = []

	let divStyle = {width: '400px', height: '400px'}

	for (const card of [...CARDS_LIST]) {
		if (card.category === 'hermit') {
			components.push([
				<div id={`${card.id}`} style={divStyle}>
					<HermitCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
			components.push([
				<div id={`${card.id}-with-tokens`} style={divStyle}>
					<HermitCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
		} else if (card.category === 'item') {
			components.push([
				<div id={`${card.id}`} style={divStyle}>
					<ItemCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
			components.push([
				<div id={`${card.id}-with-tokens`} style={divStyle}>
					<ItemCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
		} else {
			components.push([
				<div id={`${card.id}`} style={divStyle}>
					<EffectCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
			components.push([
				<div id={`${card.id}-with-tokens`} style={divStyle}>
					<EffectCard card={card as any} displayTokenCost={false} />,
				</div>,
			])
		}
	}

	await mount(<div>{components}</div>)

	await Promise.all(
		CARDS_LIST.flatMap((card) => [
			(async () => {
				await page
					.locator(`id=${card.id}`)
					.screenshot({path: `card-prerender/render/${card.id}.png`})
				console.log(`screenshotted \`${card.id}\``)
			})(),
			(async () => {
				await page.locator(`id=${card.id}-with-tokens`).screenshot({
					path: `card-prerender/render/${card.id}-with-tokens.png`,
				})
				console.log(`screenshotted \`${card.id}\` with tokens`)
			})(),
		]),
	)
})
