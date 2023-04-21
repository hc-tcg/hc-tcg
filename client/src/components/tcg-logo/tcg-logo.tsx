import css from './tcg-logo.module.scss'

function TcgLogo() {
	return (
		/* Logo Container */
		<div className={css.logo}>
			<img draggable={false} width={'100%'} src="/images/tcg-logo.png"></img>
			<p className={css.splashText}>{__LOGO_SUBTEXT__}</p>
		</div>
	)
}

export default TcgLogo
