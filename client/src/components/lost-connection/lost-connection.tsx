import Spinner from 'components/spinner'
import css from './lost-connection.module.scss'

const LostConnection = () => {
	return (
		<div className={css.wrapper}>
			<div className={css.message}>
				<Spinner color={'hsl(30, 56%, 58%)'} />
				<h1>Connection lost</h1>
				<p>Attempting to reconnect...</p>
			</div>
		</div>
	)
}

export default LostConnection
