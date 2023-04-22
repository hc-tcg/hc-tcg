import ItemCard from './_item-card'

class MinecraftRareItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_minecraft_rare',
			name: 'Minecraft',
			rarity: 'rare',
			characterType: 'minecraft',
		})
	}

	register(game) {}
}

export default MinecraftRareItemCard
