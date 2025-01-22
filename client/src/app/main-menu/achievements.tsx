import MenuLayout from 'components/menu-layout'
import css from './main-menu.module.scss'
import AchievementComponent from 'components/achievement'
import {ACHIEVEMENTS_LIST} from 'common/achievements'
import { Buffer } from 'buffer'

type Props = {
	setMenuSection: (section: string) => void
}
function Achievements({setMenuSection}: Props) {
	const data = Buffer.alloc(2)
	data[1] = 180

	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Achievements"
			returnText="More"
			className={css.settingsMenu}
		>
			<h2>Achievements</h2>
			<div className={css.achievementsContainer}>
				{ACHIEVEMENTS_LIST.map((achievement) => <AchievementComponent achievement={achievement} progressData={data} completionTime={1737557578*1000}/>)}
			</div>
		</MenuLayout>
	)
}

export default Achievements
