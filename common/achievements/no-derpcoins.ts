import ExBossAI from "../../server/src/routines/virtual/exboss-ai";
import { AIComponent } from "../components/ai-component";
import { getDeckCost } from "../utils/ranks";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const DefeatEvilX: Achievement = {
    ...achievement,
    numericId: 7,
    id: 'no_derpcoins',
    name: 'No derpcoins required',
    description: 'Defeat Evil X using a ',
    steps: 1,
    onGameEnd(game, playerEntity, component, outcome) {
        const ai = game.components.find(AIComponent, (_game, ai) => ai.ai.id === ExBossAI.id)
        const player = game.components.get(playerEntity)
        if (!player || !ai) return
        const cost = getDeckCost(player.getDeck().map((card) => card.props))
        if (cost > 0) return
        if (outcome.type !== 'player-won') return
        if (outcome.winner !== playerEntity) return
        component.incrementGoalProgress(0)
    },
}

export default DefeatEvilX