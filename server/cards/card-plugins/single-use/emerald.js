import SingleUseCard from './_single-use-card'

// TODO - Make this work with bed (sleeping needs to reset counter)
class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			name: 'Emerald',
			rarity: 'rare',
			description:
				'Swap 1 effect card with opposing Hermit.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, playerActiveRow, opponentActiveRow} = derivedState
			if (singleUseInfo?.id === this.id) {
				// TODO - Handle bed
				const pEffect = playerActiveRow.effectCard
				const oEffect = opponentActiveRow.effectCard
				playerActiveRow.effectCard = oEffect
				opponentActiveRow.effectCard = pEffect
				return 'DONE'
			}
		})
	}
}

export default EmeraldSingleUseCard
