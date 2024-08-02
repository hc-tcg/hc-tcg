import {CardComponent} from "../../../components"
import {query, row, slot} from "../../../components/query"
import {GameModel} from "../../../models/game-model"
import Card from "../../base/card"
import {attach} from "../../base/defaults"
import {Attach} from "../../base/types"

class Slimeball extends Card {
	props: Attach = {
		...attach,
		id: "slimeball",
		numericId: 204,
		name: "Slimeball",
		rarity: "ultra_rare",
		tokens: 0,
		expansion: "advent_of_tcg",
		description:
			"Attach to any Hermit, including your opponent's. That Hermit and its attached items will not be removed from the slot they are attached to, unless that Hermit is knocked out. Attached cards cannot be removed until slimeball is discarded.",
		attachCondition: query.every(
			slot.opponent,
			slot.attach,
			slot.empty,
			slot.row(row.hasHermit),
			slot.actionAvailable("PLAY_EFFECT_CARD"),
			query.not(slot.frozen),
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: Observer,
	) {
		const {player} = component

		player.hooks.freezeSlots.add(component, () => {
			return slot.every(
				slot.player,
				slot.rowIndex(pos.rowIndex),
				slot.not(slot.attach),
				slot.not(slot.empty),
			)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		pos.player.hooks.freezeSlots.remove(component)
		pos.player.hooks.onDetach.remove(component)
	}
}

export default Slimeball
