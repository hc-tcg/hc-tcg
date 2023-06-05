import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
import {getCardPos} from '../../../../server/utils/cards'
import {GameModel} from '../../../../server/models/game-model'

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

class TurtleShellEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'turtle_shell',
			name: 'Turtle Shell',
			rarity: 'rare',
			description:
				'Attach to any of your afk hermits. When the hermit is made active, it prevents any damage for its first turn and then is discarded.',
		})

		this.instances = {}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		if (!pos.rowState?.hermitCard) return 'NO'

		// turtle shell addition - hermit must be inactive to attach
		if (!(currentPlayer.board.activeRow !== pos.rowIndex)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer, opponentPlayer} = game.ds

		const instanceKey = this.getKey(instance)
		currentPlayer.custom[instanceKey] = false

		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (currentPlayer.custom[instanceKey] === true) {
				attack.multiplyDamage(0).lockDamage()
			}
			return attack
		}

		opponentPlayer.hooks.afterAttack[instance] = () => {
			if (currentPlayer.custom[instanceKey] === true) {
				delete currentPlayer.custom[instanceKey]
				discardCard(game, {cardId: this.id, cardInstance: instance})
			}
		}

		opponentPlayer.hooks.turnStart[instance] = () => {
			if (currentPlayer.board.activeRow === null) return
			if (
				instance ===
				currentPlayer.board.rows[currentPlayer.board.activeRow].effectCard
					?.cardInstance
			) {
				currentPlayer.custom[instanceKey] = true
			}
		}
	}
}

export default TurtleShellEffectCard
