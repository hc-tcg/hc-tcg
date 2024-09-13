import Credit from 'components/credit'
import MenuLayout from 'components/menu-layout'
import css from './main-menu.module.scss'
import DeveloperCredit from 'components/credit/developer-credit'

type Props = {
	setMenuSection: (section: string) => void
}
function Credits({setMenuSection}: Props) {
	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Credits"
			returnText="Settings"
			className={css.settingsMenu}
		>
			<h2>Game Designers</h2>
			<div className={css.creditsContainer}>
				<Credit
					name="VintageBeef - Game Creator"
					handle="@VintageBeefLP"
					social="twitter"
					link="https://twitter.com/VintageBeefLP"
					avatar="https://pbs.twimg.com/profile_images/1382001684151332867/iYD2Xj7c_400x400.jpg"
				/>
				<Credit
					name="Hoffen - Artist"
					handle="@_inkGhoul"
					social="twitter"
					link="https://twitter.com/_InkGhoul"
					avatar="https://pbs.twimg.com/profile_images/1779336099556675584/jXzagXkR_400x400.jpg"
				/>
			</div>
			<h2>Website Developers</h2>
			<div className={css.developerCreditsContainer}>
				<DeveloperCredit
					name="Minion Harou"
					handle="minionharou"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/171689337954500608/c17287ea15fbbbf66f8bfcbcdf6bd705.webp"
				/>
				<DeveloperCredit
					name="Benji"
					handle="東方愛麗絲"
					social="github"
					link="https://github.com/alicetouhou"
					avatar="https://avatars.githubusercontent.com/u/63879236?v=4"
				/>
				<DeveloperCredit
					name="Lunarmagpie"
					handle="Lunarmagpie"
					social="github"
					link="https://github.com/lunarmagpie"
					avatar="https://avatars.githubusercontent.com/u/65521138"
				/>
				<DeveloperCredit
					name="Screaper91"
					handle="Screaper91"
					social="github"
					link="https://github.com/screaper91"
					avatar="https://avatars.githubusercontent.com/u/155844020"
				/>
				<DeveloperCredit
					name="ChimeraDev"
					handle="chimeradev"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/109681545?v=4"
				/>
				<DeveloperCredit
					name="ImagineFyre"
					handle="imaginefyre"
					social="github"
					link="https://github.com/jmlyman424"
					avatar="https://avatars.githubusercontent.com/u/8975572"
				/>
				<DeveloperCredit
					name="Niko"
					handle="niko.uy"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/12455733?v=4"
				/>
				<DeveloperCredit
					name="Sense_101"
					handle="sense101"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/67970865?v=4"
				/>
				<DeveloperCredit
					name="Tyrannicodin"
					handle="tyrannicodin"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/547104418131083285/0e6fa62e2f647943f21ecbe2d21a9291.webp"
				/>
				<DeveloperCredit
					name="Rvtar"
					handle="Rvtar"
					social="github"
					link="https://github.com/Rvtar"
					avatar="https://avatars.githubusercontent.com/u/106639908"
				/>
				<DeveloperCredit
					name="blockgolbin31"
					handle="blockgolbin31"
					social="github"
					link="https://github.com/blockgolbin31"
					avatar="https://avatars.githubusercontent.com/u/57573828"
				/>
				<DeveloperCredit
					name="ProfNinja"
					handle="profninja"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/671639?v=4"
				/>
			</div>
		</MenuLayout>
	)
}

export default Credits
