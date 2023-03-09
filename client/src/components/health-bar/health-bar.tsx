import css from './health-bar.module.scss'

export type Props = {
	lives: number
	dir?: 'ltr' | 'rtl'
}

const MAX_LIVES = 3

const HealthBar = ({lives, dir = 'ltr'}: Props) => {
	const hearts = new Array(MAX_LIVES).fill(null).map((_, index) => {
		const empty = lives > index
		return (
			<img
				key={index}
				className={css.heart}
				src={empty ? 'images/heart.png' : 'images/empty-heart.png'}
				width="32"
				height="32"
			/>
		)
	})
	if (dir === 'rtl') hearts.reverse()
	return <div className={css.healthBar}>{hearts}</div>
}

export default HealthBar
