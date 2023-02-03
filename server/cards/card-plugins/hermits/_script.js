import CARDS from '../../../cards'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
import HermitCard from './_hermit-card'

class ${card.fullName}CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: '${card.id}',
			name: '${card.name}',
			rarity: '${card.rarity}',
			hermitType: '${card.hermitType}',
			health: ${card.health},
			primary: {
				name: "${card.primary.name}",
				cost: ${JSON.stringify(card.primary.cost)},
				damage: ${card.primary.damage},
				power: "${card.primary.power?.description || 'null'}",
			},
			secondary: {
				name: "${card.secondary.name}",
				cost: ${JSON.stringify(card.secondary.cost)},
				damage: ${card.secondary.damage},
				power: "${card.secondary.power?.description || 'null'}",
			},
		})
	}

	register(game) {
	}
}

export default ${card.fullName}CommonHermitCard
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
	if (card.type !== 'hermit') return
	if (card.rarity !== 'common') return

	const filename = __dirname + '/' + card.id.replaceAll('_', '-') + '.js'

	// console.log(template(card))
	console.log(`new ${card.fullName}CommonHermitCard().register(game)`)

	// const {default: CardClass} = await import('./' + card.id.replaceAll('_', '-'))

	// const instance = new CardClass()
	// checkValues(card.id, card, instance)
})
