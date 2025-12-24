import assert from "assert";
import TurtleShell from "../cards/attach/turtle-shell";
import Ladder from "../cards/single-use/ladder";
import {
	CardComponent,
	PlayerComponent,
	StatusEffectComponent,
} from "../components";
import query from "../components/query";
import { CardEntity } from "../entities";
import LooseShellEffect from "../status-effects/loose-shell";
import { afterApply, onTurnEnd } from "../types/priorities";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const TurtleMaster: Achievement = {
	...achievement,
	numericId: 69,
	id: "turtle-master",
	progressionMethod: "sum",
	levels: [
		{
			name: "Turtle Master",
			description:
				"Activate a turtle shell that formerly had the loose shell status effect.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const looseShells: Set<CardEntity> = new Set();

		game.components.filter(PlayerComponent).forEach((player) => {
			// Detects when Turtle Shell is attached to an already active hermit
			observer.subscribe(player.hooks.onAttach, (card) => {
				if (card.props.id !== TurtleShell.id) return;
				if (card.player.entity !== player.entity) return;

				observer.subscribe(card.hooks.onChangeSlot, () => {
					observer.unsubscribe(card.hooks.onChangeSlot);
					if (
						game.components.exists(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.not(query.effect.targetEntity(null)),
							(_game, value) => value.creatorEntity === card.entity,
						)
					)
						looseShells.add(card.entity);
				});
			});

			// Detects when active Hermit changes rows from Ladder to row with Turtle Shell
			observer.subscribeWithPriority(
				player.hooks.afterApply,
				afterApply.CHECK_BOARD_STATE,
				() => {
					const su = game.components.find(
						CardComponent,
						query.card.slot(query.slot.singleUse),
					);

					assert(
						su,
						"There should be a single use card in the single use slot if a sigle use card is applied",
					);

					if (su.props.id !== Ladder.id) return;

					observer.subscribe(
						player.hooks.onActiveRowChange,
						(_oldHermit, newHermit) => {
							observer.unsubscribe(player.hooks.onActiveRowChange);

							const looseShell = newHermit.getStatusEffect(LooseShellEffect);
							if (!looseShell) return;

							looseShells.add(looseShell.creatorEntity);
						},
					);
				},
			);

			// If the Turtle Shell is removed from the board, it no longer counts
			observer.subscribe(player.hooks.onDetach, (card) => {
				if (card.props.id !== TurtleShell.id) return;

				observer.subscribe(card.hooks.onChangeSlot, (newSlot) => {
					if (newSlot.onBoard()) return;

					looseShells.delete(card.entity);
					observer.unsubscribe(card.hooks.onChangeSlot);
				});
			});
		});

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BOARD_STATE,
			() => {
				const activeTurtleShell = game.components.find(
					CardComponent,
					query.card.player(player.entity),
					query.card.active,
					query.card.is(TurtleShell),
				);
				if (
					!activeTurtleShell ||
					player.getActiveHermit()?.getStatusEffect(LooseShellEffect)
				)
					return;

				if (looseShells.has(activeTurtleShell.entity)) {
					component.updateGoalProgress({ goal: 0 });
					looseShells.delete(activeTurtleShell.entity);
				}
			},
		);
	},
};

export default TurtleMaster;
