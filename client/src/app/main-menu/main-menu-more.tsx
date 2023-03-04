import css from './main-menu.module.css'
import {useSelector, useDispatch} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getStats} from 'logic/fbdb/fbdb-selectors'
import {resetStats} from 'logic/fbdb/fbdb-actions'

type Props = {
	setMenuSection: (section: string) => void
}
function More({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const stats = useSelector(getStats)
	const settings = useSelector(getSettings)

	const handleSoundChange = () => {
		dispatch(setSetting('soundOn', settings.soundOn !== 'off' ? 'off' : 'on'))
	}
	const handleProfanityChange = () => {
		dispatch(
			setSetting(
				'profanityFilter',
				settings.profanityFilter !== 'off' ? 'off' : 'on'
			)
		)
	}
	const handleResetStats = () => {
		dispatch(resetStats())
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	return (
		<div className={`${css.menuBackground} ${css.moreBackground} temp`}>
			<div className={css.moreContainer}>
				<div className={css.moreButtonContainer}>
					<button className={css.menuButton} onClick={handleSoundChange}>
						Sounds: {getDescriptor(settings.soundOn)}
					</button>
					<button className={css.menuButton} onClick={handleProfanityChange}>
						Profanity filter: {getDescriptor(settings.profanityFilter)}
					</button>
					<div className={css.smallButtonContainer}>
						<button
							className={css.menuButton}
							onClick={() => setMenuSection('mainmenu')}
						>
							Back to menu
						</button>
						<button className={css.menuButton} onClick={handleResetStats}>
							Reset Stats
						</button>
					</div>
				</div>
				{/* stats */}
				<div className={css.stats}>
					<div className={css.stat}>
						<div className={css.statName}>Wins</div>
						<div className={css.statValue}>{stats.w}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Losses</div>
						<div className={css.statValue}>{stats.l}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Ties</div>
						<div className={css.statValue}>{stats.t}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Forfeit Wins</div>
						<div className={css.statValue}>{stats.fw}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Forfeit Losses</div>
						<div className={css.statValue}>{stats.fl}</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default More
