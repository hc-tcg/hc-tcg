import classnames from 'classnames'
import {CoinFlip} from 'common/types/game-state'
import css from './coin-flip.module.scss'

export type Props = {
	name: string
	tosses: Array<CoinFlip>
	amount: number
}

const CoinFlipComponent = ({name, tosses, amount}: Props) => {
	const pics = [
		'data:image/jpeg;base64,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',
		'/images/tcg1.png',
	]

	const longestFlipIndex = Math.floor(Math.random() * tosses.length)

	const coins = tosses.map((face, index) => {
		const coinPics = pics.slice()
		const flipOffset =
			index === longestFlipIndex
				? 0
				: Math.floor(Math.random() * (tosses.length + 1))
		const evenIterations = Math.floor((amount - flipOffset) / 2)
		const extraFlip = (amount - flipOffset) % 2 !== 0

		if ((face.result === 'tails') !== extraFlip) coinPics.reverse()

		let frontImage = 0
		let backImage = 0
		if (face.forced) {
			if (face.result === 'heads') {
				frontImage = 1
				backImage = 1
			}
			if (face.result === 'tails') {
				frontImage = 0
				backImage = 0
			}
		}

		return (
			<div
				className={css.coin}
				key={index}
				style={
					extraFlip
						? {
								animationIterationCount: `${evenIterations}, 1, 1`,
								animationDelay: `0s, ${evenIterations * 0.7}s, ${evenIterations * 0.7 + 0.35}s`,
							}
						: {
								animationIterationCount: `${evenIterations}, 0, 0`,
								animationDelay: '0s',
							}
				}
			>
				<div className={classnames(css.face, css.front)}>
					<img src={coinPics[frontImage]} />
				</div>
				<div className={classnames(css.face, css.back)}>
					<img src={coinPics[backImage]} />
				</div>
			</div>
		)
	})

	return (
		<div className={css.coinFlip}>
			<div className={css.nameDesktop}>{name}</div>
			<div className={css.nameMobile}>{name}:</div>
			<div className={css.coins}>{coins}</div>
		</div>
	)
}

export default CoinFlipComponent
