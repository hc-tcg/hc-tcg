import Card from "../../base/card"
import {item} from "../../base/defaults"
import {Item} from "../../base/types"

class RedstoneItem extends Card {
	props: Item = {
		...item,
		id: "item_redstone_common",
		numericId: 63,
		name: "Redstone Item",
		shortName: "Redstone",
		expansion: "default",
		rarity: "common",
		tokens: 0,
		type: "redstone",
		energy: ["redstone"],
	}
}

export default RedstoneItem
