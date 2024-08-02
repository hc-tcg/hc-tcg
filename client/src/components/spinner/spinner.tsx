import css from './spinner.module.scss'

type SpinnerProps = {
	color?: string
}

const Spinner = ({color}: SpinnerProps) => {
	const pixel = new Array(16).fill(null)

	const pixelArray = pixel.map((_, i) => {
		const pixelId = 'pixel' + (i + 1)
		return (
			<div
				key={i}
				className={css.pixel}
				id={css[pixelId]}
				style={{backgroundColor: color}}
			></div>
		)
	})

	return <div className={css.pixelSpinner}>{pixelArray}</div>
}

export default Spinner
