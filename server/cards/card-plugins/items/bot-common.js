import ItemCard from './_item-card'

class BotCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_bot_common',
			name: 'Bot',
			rarity: 'common',
			hermitType: 'bot',
		})
	}

	register(game) {}
}

export default BotCommonItemCard
