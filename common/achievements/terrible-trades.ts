import { CardComponent } from "../components";
import query from "../components/query";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const TerribleTrades: Achievement = {
	...achievement,
	numericId: 49,
	id: "terrible-trades",
	progressionMethod: "sum",
	levels: [
		{
			name: "Terrible Trades",
			description:
				"Win 5 games using a deck that does not include cards worth 3 tokens or more.",
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		let deckHasBannedCards = game.components.exists(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) =>
				typeof card.props.tokens === "number" && card.props.tokens >= 3,
		);

		// handle 'etho-ur' token cost
		deckHasBannedCards ||=
			game.components.exists(
				CardComponent,
				query.card.player(player.entity),
				(_game, card) => card.props.tokens === "etho-ur",
			) &&
			game.components.exists(
				CardComponent,
				query.card.player(player.entity),
				(_game, card) =>
					card.isItem() &&
					card.props.type !== "pvp" &&
					card.props.type !== "any",
			);

		if (deckHasBannedCards) return;

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type === "player-won" && outcome.winner === player.entity) {
				component.updateGoalProgress({ goal: 0 });
			}
		});
	},
};

export default TerribleTrades;
