import ItemCard from './_item-card'

class MinecraftCommonItemCard extends ItemCard {
	constructor() {
		super({
			id: 'item_minecraft_common',
			name: 'Minecraft',
			rarity: 'common',
			characterType: 'minecraft',
		})
	}

	register(game) {}
}

export default MinecraftCommonItemCard
