import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

/*
Questions:
- What to do when grian/emerald movees tutlrte shell to active hermit?
	- Should it active immediately or require the hermit to go afk and active again?
	- What about the hermit that got his shell stolen? Is he protected anyway or can he be damaged now?
*/

/*
Situations:
- Opponent has turtle_shell on him at start of turn
	- Players attacks (prevents damage -> tutrtle shell discarded)
	- Opponent is made afk (turtle shell discarded form now afk hermit)
	- Player just ends turn (turtle shell discarded)
- Opponent receives turtle shell through emerald
	- Same as above ^
- Opponent receives turtle shell through attack special move
	- Shouldn't be possible right now there is no special moves that put effect on opponent
*/

/*
Testing:
- Must work with hypno (effect not applied when attacking AFK)
- Must work with XB/URTFC/golden axe - tutrtle shell is ignored
- Must work with Zed's sheep stare (Zed's opponent should still receive damage either way)
*/

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class TurtleShellEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'turtle_shell',
			name: 'Turtle Shell',
			rarity: 'rare',
			description:
				'Attached to any of your afk hermits. When the hermit is made active, it prevents any damage for its first turn and then is discarded.',
		})

		this.attachReq = {target: 'player', type: ['effect'], active: false}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.turnStart.tap(this.id, () => {
			const {opponentPlayer, opponentHermitCard, opponentEffectCard} = game.ds
			if (!opponentHermitCard) return
			if (opponentEffectCard?.cardId !== this.id) return
			opponentPlayer.custom[this.id] = opponentHermitCard.cardInstance
		})

		game.hooks.attack.tap(this.id, (target) => {
			const {opponentPlayer} = game.ds
			if (!target.isActive) return target
			if (target.row.effectCard?.cardId !== this.id) return target

			// In case opponent received a turtle_shell through emerald
			opponentPlayer.custom[this.id] = target.row.hermitCard.cardInstance

			target.invulnarable = true
			return target
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {opponentPlayer} = game.ds
			const protectedHermit = opponentPlayer.custom[this.id]
			if (!protectedHermit) return
			const row = opponentPlayer.board.rows.find(
				(row) => row.hermitCard?.cardInstance === protectedHermit
			)
			if (!row || row.effectCard?.cardId !== this.id) return
			discardCard(game, row.effectCard)
			delete opponentPlayer.custom[this.id]
			return
		})
	}
}

export default TurtleShellEffectCard
