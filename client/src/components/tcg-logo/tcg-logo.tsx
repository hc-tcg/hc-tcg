import css from './tcg-logo.module.css'

function TcgLogo() {
	return (
		/* Logo Container */
		<div className={css.logo}>
			<img draggable={false} width={'100%'} src="/images/tcg-logo.png"></img>
			<div className={css.notOfficial}>
				<p>Not Official!</p>
			</div>
		</div>
	)
}

export default TcgLogo
