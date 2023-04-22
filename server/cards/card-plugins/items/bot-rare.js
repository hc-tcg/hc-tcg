import ItemCard from './_item-card'

class BotRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_bot_rare',
			name: 'Bot',
			rarity: 'rare',
			hermitType: 'bot',
		})
	}

	register(game) {}
}

export default BotRareItemCard
