import Card from "../../base/card"
import {item} from "../../base/defaults"
import {Item} from "../../base/types"

class FarmItem extends Card {
	props: Item = {
		...item,
		id: "item_farm_common",
		numericId: 55,
		name: "Farm Item",
		shortName: "Farm",
		expansion: "default",
		rarity: "common",
		tokens: 0,
		type: "farm",
		energy: ["farm"],
	}
}

export default FarmItem
