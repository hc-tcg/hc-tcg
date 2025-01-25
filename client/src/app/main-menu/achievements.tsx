import {Buffer} from 'buffer'
import {ACHIEVEMENTS_LIST} from 'common/achievements'
import AchievementComponent from 'components/achievement'
import MenuLayout from 'components/menu-layout'
import css from './main-menu.module.scss'
import { useSelector } from 'react-redux'
import { getAchievements } from 'logic/game/database/database-selectors'

type Props = {
	setMenuSection: (section: string) => void
}
function Achievements({setMenuSection}: Props) {
	const data = useSelector(getAchievements)

	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Achievements"
			returnText="More"
			className={css.settingsMenu}
		>
			<h2>Achievements</h2>
			<div className={css.achievementsContainer}>
				{ACHIEVEMENTS_LIST.map((achievement) => (
					<AchievementComponent
						key={achievement.numericId}
						achievement={achievement}
						progressData={data[achievement.numericId]}
					/>
				))}
			</div>
		</MenuLayout>
	)
}

export default Achievements
