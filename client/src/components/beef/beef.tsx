import css from './beef.module.css'

const Beef = () => {
	return (
		<a
			className={css.beef}
			href="https://www.youtube.com/@VintageBeef"
			target="_blank"
			rel="noreferrer"
		>
			<img src="/images/beef.jpg" className={css.avatar} />
			Based on VintageBeef's
			<br />
			Hermitcraft game
		</a>
	)
}

export default Beef
