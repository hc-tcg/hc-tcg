import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
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
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		if (!pos.row?.hermitCard) return 'NO'

		// turtle shell addition - hermit must be inactive to attach
		if (!(currentPlayer.board.activeRow !== pos.rowIndex)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const instanceKey = this.getInstanceKey(instance)
		pos.player.custom[instanceKey] = false

		pos.opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (
				pos.player.custom[instanceKey] === true &&
				attack.target.row.effectCard?.cardInstance === instance
			) {
				attack.multiplyDamage(0).lockDamage()
			}
			return attack
		}

		pos.opponentPlayer.hooks.afterAttack[instance] = () => {
			if (pos.player.custom[instanceKey] === true) {
				discardCard(game, {cardId: this.id, cardInstance: instance})
			}
		}

		pos.opponentPlayer.hooks.beforeAttack[instance] = () => {
			if (pos.player.board.activeRow === null) return
			if (
				instance ===
				pos.player.board.rows[pos.player.board.activeRow].effectCard
					?.cardInstance
			) {
				pos.player.custom[instanceKey] = true
			}
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.player.custom[this.getInstanceKey(instance)]
		delete pos.opponentPlayer.hooks.onAttack[instance]
		delete pos.opponentPlayer.hooks.afterAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TurtleShellEffectCard
