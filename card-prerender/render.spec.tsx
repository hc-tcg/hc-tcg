import {test} from '@playwright/experimental-ct-react'
import EffectCard from 'client/components/card/effect-card-svg'
import HermitCard from 'client/components/card/hermit-card-svg'
import ItemCard from 'client/components/card/item-card-svg'
import {CARDS_LIST} from 'common/cards'

const SECTION_SIZE = Math.floor(CARDS_LIST.length / 4)
const MAX = Math.max(CARDS_LIST.length / SECTION_SIZE)

for (let i = 1; i <= MAX; i++) {
	const number = i
	test(`Render Cards To PNG (${i}/${MAX}) `, async ({page, mount}) => {
		let section = CARDS_LIST.slice(
			(number - 1) * SECTION_SIZE,
			Math.min(number * SECTION_SIZE, CARDS_LIST.length),
		)

		let components = []

		let divStyle = {width: '400px', height: '400px'}

		for (const card of [...section]) {
			if (card.category === 'hermit') {
				components.push([
					<div id={`${card.id}`} style={divStyle}>
						<HermitCard card={card as any} displayTokenCost={false} />,
					</div>,
				])
				components.push([
					<div id={`${card.id}-with-tokens`} style={divStyle}>
						<HermitCard card={card as any} displayTokenCost={true} />,
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
						<ItemCard card={card as any} displayTokenCost={true} />,
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
						<EffectCard card={card as any} displayTokenCost={true} />,
					</div>,
				])
			}
		}

		console.log('Mounting cards...')
		await mount(<div>{components}</div>)

		const total = section.length * 2
		let completed = 0

		for (const card of section) {
			await page
				.locator(`id=${card.id}`)
				.screenshot({path: `card-prerender/render/${card.id}.png`})
			completed += 1
			console.log(
				`(${number}) [${completed}/${total}] Screenshotted \`${card.id}\``,
			)
			await page.locator(`id=${card.id}-with-tokens`).screenshot({
				path: `card-prerender/render/${card.id}_with_tokens.png`,
			})
			completed += 1
			console.log(
				`(${number}) [${completed}/${total}] Screenshotted \`${card.id}\` with tokens`,
			)
		}
	})
}
