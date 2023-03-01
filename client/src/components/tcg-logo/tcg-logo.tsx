import css from './tcg-logo.module.css'
// @ts-ignore
import {CONFIG} from '../../../../config'

function TcgLogo() {
	return (
		/* Logo Container */
		<div className={css.logo}>
			<img draggable={false} width={'100%'} src="/images/tcg-logo.png"></img>
			<div className={css.logoSubText}>
				<p>{CONFIG.logoSubText}</p>
			</div>
		</div>
	)
}

export default TcgLogo
