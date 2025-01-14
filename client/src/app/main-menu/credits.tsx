import Credit from 'components/credit'
import DeveloperCredit from 'components/credit/developer-credit'
import MenuLayout from 'components/menu-layout'
import css from './main-menu.module.scss'

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
					name="Zunda"
					handle="ずんだアロー"
					social="github"
					link="https://github.com/zunda-arrow"
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
					name="Sense_101"
					handle="sense101"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/67970865?v=4"
				/>
				<DeveloperCredit
					name="ImagineFyre"
					handle="jmlyman424"
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
					name="ijzm"
					handle="ijzm"
					social="github"
					link="https://github.com/ijzm"
					avatar="https://avatars.githubusercontent.com/u/4440678"
				/>
				<DeveloperCredit
					name="Maescool"
					handle="Maescool"
					social="github"
					link="https://github.com/Maescool"
					avatar="https://avatars.githubusercontent.com/u/197110"
				/>
				<DeveloperCredit
					name="ProfNinja"
					handle="profninja"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/671639?v=4"
				/>
				<DeveloperCredit
					name="ArsenalTillIDie"
					handle="ArsenalTillIDie"
					social="github"
					link="https://github.com/ArsenalTillIDie"
					avatar="https://avatars.githubusercontent.com/u/59069144"
				/>
				<DeveloperCredit
					name="Razboy20"
					handle="Razboy20"
					social="github"
					link="https://github.com/Razboy20"
					avatar="https://avatars.githubusercontent.com/u/29903962"
				/>
				<DeveloperCredit
					name="JoelleJS"
					handle="JoelleJS"
					social="gitlab"
					link="https://gitlab.com/JoelleJS"
					avatar="https://gitlab.com/uploads/-/system/user/avatar/5164556/avatar.png"
				/>
				<DeveloperCredit
					name="Czompi"
					handle="Czompi"
					social="github"
					link="https://github.com/Czompi"
					avatar="https://avatars.githubusercontent.com/u/26040786"
				/>
				<DeveloperCredit
					name="eyduh"
					handle="eyduh"
					social="github"
					link="https://github.com/eyduh"
					avatar="https://avatars.githubusercontent.com/u/29815625"
				/>
			</div>
		</MenuLayout>
	)
}

export default Credits
