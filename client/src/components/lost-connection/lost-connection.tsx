import css from './lost-connection.module.css'

const LostConnection = () => {
	return (
		<div className={css.wrapper}>
			<div className={css.message}>
				Connection lost.
				<br />
				Trying to reconnect.
			</div>
		</div>
	)
}

export default LostConnection
