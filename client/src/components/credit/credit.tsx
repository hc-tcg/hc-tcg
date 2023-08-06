import css from './credit.module.scss'
import classnames from 'classnames'
import {Fragment} from 'react'

interface Props {
	name: string
	social: string
	handle: string
	link?: string
	avatar: string
}

const Credits = (inputProps: Props) => {
	const props = {...inputProps}
	const hasLink = props.link !== undefined
	const content = (
		<Fragment>
			<img src={props.avatar} className={css.avatar} />
			<div>
				<div>{props.name}</div>
				<div className={css.handle}>
					<img
						src={`images/icons/${props.social}.svg`}
						className={classnames(css.handle, css.handleImage)}
					/>
					{props.handle}
				</div>
			</div>
		</Fragment>
	)

	return hasLink ? (
		<a className={css.credit} href={props.link} target="_blank" rel="noreferrer">
			{content}
		</a>
	) : (
		<div className={css.credit}> {content} </div>
	)
}

export default Credits
