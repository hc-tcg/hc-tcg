type Props = {
	level: number
}

const SpeakerIcon = ({level}: Props) => {
	let level1 = 'transparent'
	let level2 = 'transparent'
	let level3 = 'transparent'

	if (level > 0) {
		level1 = 'white'
	}
	if (level >= 33) {
		level2 = 'white'
	}
	if (level >= 66) {
		level3 = 'white'
	}

	return (
		<svg
			width="12"
			height="11"
			viewBox="0 0 12 11"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M6 1H5V2H4V3H2V4H0V6H2V7H4V8H5V9H6V1Z" fill="white" />
			<path d="M2 6H0V7H2V8H4V9H5V10H6V9H5V8H4V7H2V6Z" fill="#BEBEBE" />

			<g>
				<path id="1" d="M7 4H8V7H7V4Z" fill={level1} />
				<g id="2">
					<path d="M8 2H9V3H8V2Z" fill={level2} />
					<path d="M9 8V3H10V8H9Z" fill={level2} />
					<path d="M9 8V9H8V8H9Z" fill={level2} />
				</g>
				<path
					id="3"
					d="M10 0H9V1H10V2H11V9H10V10H9V11H10V10H11V9H12V2H11V1H10V0Z"
					fill={level3}
				/>
			</g>
		</svg>
	)
}

export default SpeakerIcon
