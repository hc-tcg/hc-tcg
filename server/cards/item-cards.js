/*
// https://hermitcraft.fandom.com/wiki/Hermitcraft_Trading_Card_Game
copy(Array.from(temp2.children).map((row, index, arr) => {
  const columns = Array.from(row.children).map(col => col.innerText)
  return columns
}))
*/

const scrappedList = [
	['Oak Stairs', 'Common', 'Builder Type'],
	['Oak Stairs x 2', 'Rare', 'Builder Type'],
	['Grass Block', 'Common', 'Balanced Type'],
	['Grass Block x 2', 'Rare', 'Balanced Type'],
	['Redstone', 'Common', 'Redstone Type'],
	['Redstone x 2', 'Rare', 'Redstone Type'],
	['Obsidian', 'Common', 'Prankster Type'],
	['Obsidian x 2', 'Rare', 'Prankster Type'],
	['Elytra', 'Common', 'Explorer Type'],
	['Elytra x 2', 'Rare', 'Explorer Type'],
	['Piston', 'Common', 'Farm Type'],
	['Piston x 2', 'Rare', 'Farm Type'],
	['Diamond Sword', 'Common', 'PvP Type'],
	['Diamond Sword x 2', 'Rare', 'PvP Type'],
	['Eye of Ender', 'Common', 'Speedrunner Type'],
	['Eye of Ender x 2', 'Rare', 'Speedrunner Type'],
	['Azalea Leaves', 'Common', 'Terraform Type'],
	['Azalea Leaves x 2', 'Rare', 'Terraform Type'],
	['Cobblestone', 'Common', 'Miner Type'],
	['Cobblestone x 2', 'Rare', 'Miner Type'],
]

const makeItemCard = (source) => ({
	id:
		'item_' +
		source[2].split(' ')[0].toLowerCase() +
		'_' +
		source[1].toLowerCase().replaceAll(' ', '_'),
	rarity: source[1].toLowerCase().replaceAll(' ', '_'),
	hermitType: source[2].split(' ')[0].toLowerCase(),
	type: 'item',
})

export default scrappedList.reduce((result, item) => {
	const card = makeItemCard(item)
	result[card.id] = card
	return result
}, {})
