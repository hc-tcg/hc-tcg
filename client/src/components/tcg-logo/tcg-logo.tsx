import css from './tcg-logo.module.css'

function TcgLogo() {
	return (
		/* Logo Container */
		<div className={`${css.logo} temp`}>
			<img draggable={false} width={'100%'} src="/images/tcg-logo.png"></img>
			<div className={css.logoSubText}>
				<p>{__LOGO_SUBTEXT__}</p>
			</div>
		</div>
	)
}

export default TcgLogo
