import css from './main-menu.module.css'
import {useSelector, useDispatch} from 'react-redux'
import {getStats} from 'logic/fbdb/fbdb-selectors'
import {resetStats} from 'logic/fbdb/fbdb-actions'

type Props = {
	setMenuSection: (section: string) => void
}
function More({setMenuSection}: Props) {
	const stats = useSelector(getStats)
	const dispatch = useDispatch()
	const handleResetStats = () => {
		dispatch(resetStats())
	}
	return (
		<div className={css.buttonContainer}>
			<div className={css.smallButtonContainer}>
				<button
					className={css.smallMenuButton}
					onClick={() => setMenuSection('mainmenu')}
				>
					Back to menu
				</button>
				<button className={css.smallMenuButton} onClick={handleResetStats}>
					Reset Stats?
				</button>
			</div>
			<div className={css.stats}>
				<div className={css.stat}>
					<div className={css.statName}>Wins</div>
					<div className={css.statValue}>{stats.w}</div>
				</div>
				<div className={css.stat}>
					<div className={css.statName}>Losses</div>
					<div className={css.statValue}>{stats.l}</div>
				</div>
			</div>
		</div>
	)
}

export default More
