import css from './checkbox.module.scss'

type Props = {
	onCheck: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void
	defaultChecked: boolean
}

const Checkbox = ({onCheck, defaultChecked}: Props) => {
	return (
		<label className={css.container}>
			<input
				type={'checkbox'}
				onClick={(e) => onCheck(e)}
				defaultChecked={defaultChecked}
				className={css.originalCheckbox}
			></input>
			<span className={css.checkbox}></span>
		</label>
	)
}

export default Checkbox
