import ArmorStand from "../cards/attach/armor-stand";
import { CardComponent } from "../components";
import query from "../components/query";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const UseLikeAHermit: Achievement = {
	...achievement,
	numericId: 48,
	id: "use_like_a_hermit",
	progressionMethod: "sum",
	levels: [
		{
			name: "Use Like a Hermit...?",
			description: "Win a game while Armour Stand is your active Hermit.",
			steps: 1,
		},
	],
	onGameEnd(game, player, component, outcome) {
		if (outcome.type !== "player-won" || outcome.winner !== player.entity)
			return;
		if (
			game.components.find(
				CardComponent,
				query.card.player(player.entity),
				query.card.is(ArmorStand),
				query.card.active,
			)
		) {
			component.updateGoalProgress({ goal: 0 });
		}
	},
};

export default UseLikeAHermit;
