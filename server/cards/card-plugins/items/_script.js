import CARDS from '../../../cards'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RARS = {
	common: 'Common',
	rare: 'Rare',
	ultra_rare: 'UltraRare',
}

function writeToFile(fileName, content) {
	fs.writeFile(fileName, content, function (err) {
		if (err) {
			return console.log(err)
		}
		console.log('The file was saved!')
	})
}

const template = (card) => {
	return `
import ItemCard from './_item-card'

class ${card.name}${RARS[card.rarity]}ItemCard extends ItemCard {
	constructor() {
		super({
			id: '${card.id}',
			name: '${card.name}',
			rarity: '${card.rarity}',
			hermitType: '${card.hermitType}',
		})
	}

	register(game) {
	}
}

export default ${card.name}${RARS[card.rarity]}ItemCard
`
}

const checkValues = (id, a, b) => {
	for (let key in a) {
		if (typeof a[key] === 'object') {
			return checkValues(id + ':' + key, a[key], b[key])
		}
		if (a[key] !== b[key]) {
			console.log(id, key, a[key])
		}
	}
}

Object.values(CARDS).forEach(async (card) => {
	if (card.type !== 'single_use') return
	// if (card.rarity !== 'common') return

	const filename = __dirname + '/' + card.hermitType + '-' + card.rarity + '.js'

	// const result = template(card)

	// writeToFile(filename, result)

	console.log(`new ${card.name.replaceAll(' ', '')}SingleUseCard(),`)

	// const {default: CardClass} = await import('./' + card.id.replaceAll('_', '-'))

	// const instance = new CardClass()
	// checkValues(card.id, card, instance)
})
