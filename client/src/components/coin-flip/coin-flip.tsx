import classnames from 'classnames'
import {COINS} from 'common/coins'
import {CoinFlip} from 'common/types/game-state'
import css from './coin-flip.module.scss'

export type Props = {
	name: string
	headImage: keyof typeof COINS
	tosses: Array<CoinFlip>
	amount: number
}

const CoinFlipComponent = ({name, headImage, tosses, amount}: Props) => {
	const longestFlipIndex = Math.floor(Math.random() * tosses.length)

	const coins = tosses.map((face, index) => {
		const coinPics = [
			<img src={`/images/coins/${COINS[headImage].file}`} />,
			<img src={'/images/coins/tails.png'} />,
		]

		const flipOffset =
			index === longestFlipIndex
				? 0
				: Math.floor(Math.random() * (tosses.length + 1))
		const evenIterations = Math.floor((amount - flipOffset) / 2)
		const extraFlip = (amount - flipOffset) % 2 !== 0

		if ((face.result === 'tails') !== extraFlip) {
			coinPics.reverse()
		}

		const faceStyle = {
			borderColor: `${COINS[headImage].borderColor}`,
			boxShadow: `0 0 4px ${COINS[headImage].borderColor}`,
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
				<div className={classnames(css.face, css.front)} style={faceStyle}>
					{coinPics[0]}
				</div>
				<div className={classnames(css.face, css.back)} style={faceStyle}>
					{coinPics[1]}
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
