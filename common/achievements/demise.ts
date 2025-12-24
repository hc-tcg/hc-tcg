import { RowComponent } from "../components";
import query from "../components/query";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const Demise: Achievement = {
	...achievement,
	numericId: 63,
	id: "demise",
	progressionMethod: "sum",
	levels: [
		{
			name: "Demise",
			description: "Knock out 300 hermits.",
			steps: 300,
		},
	],
	onGameStart(game, player, component, observer) {
		game.components
			.filter(
				RowComponent,
				query.row.player(game.otherPlayerEntity(player.entity)),
			)
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, (card) => {
					if (!card.isHermit()) return;
					component.updateGoalProgress({ goal: 0 });
				});
			});
	},
};

export default Demise;
