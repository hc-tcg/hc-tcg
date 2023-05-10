/* eslint-disable react/no-unknown-property */
import {useRef} from 'react'
import * as THREE from 'three'
import css from './background.module.scss'
import {PerspectiveCamera} from '@react-three/drei'
import {Canvas, useFrame} from '@react-three/fiber'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import {CSSTransition} from 'react-transition-group'
import classNames from 'classnames'

type CameraProps = {
	rotationEnabled?: boolean
	rotationSpeed?: number
	startingRotation?: number
	fov?: number
}

const Camera = ({
	rotationEnabled,
	rotationSpeed,
	startingRotation,
	fov,
}: CameraProps) => {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)

	useFrame(() => {
		if (!cameraRef.current) return
		if (rotationEnabled === undefined) rotationEnabled = true
		rotationEnabled &&
			(cameraRef.current.rotation.y -= (rotationSpeed || 0.5) / -10000)
	})

	return (
		<PerspectiveCamera
			makeDefault
			ref={cameraRef}
			fov={fov || 75}
			position={[0, 0, 0]}
			rotation={[Math.PI, (startingRotation || 0) * (6.3 / 360), Math.PI]}
		/>
	)
}

type SkyboxProps = {
	location: string
}

const Skybox = ({location}: SkyboxProps) => {
	const loader = new THREE.CubeTextureLoader()
	loader.setPath(`/images/panorama/${location}/`)
	const texture = loader.load([
		`panorama_1.png`, //Right
		`panorama_3.png`, //Left
		`panorama_5.png`, //Top
		`panorama_4.png`, //Bottom
		`panorama_0.png`, //Front
		`panorama_2.png`, //Back
	])

	texture.flipY = true

	return (
		<mesh>
			<sphereGeometry />
			<meshBasicMaterial envMap={texture} side={THREE.BackSide} />
		</mesh>
	)
}

type OldProps = {
	location?: 'hermit-hill' | 'town-hall'
	camera?: CameraProps
}

type Props = {
	noImage?: boolean
	noFade?: boolean
}

const Background = ({noImage, noFade}: Props) => {
	const settings = useSelector(getSettings)

	return (
		<div className={css.background}>
			<CSSTransition
				in={!noImage}
				timeout={500}
				unmountOnExit={true}
				classNames={{
					enter: css.enter,
					enterActive: css.enterActive,
					exit: css.exit,
					exitActive: css.exitActive,
				}}
			>
				<div className={classNames(css.innerBackground, css.image)}></div>
			</CSSTransition>
			<CSSTransition
				in={noImage}
				timeout={500}
				unmountOnExit={true}
				classNames={{
					enter: css.enter,
					enterActive: css.enterActive,
					exit: css.exit,
					exitActive: css.exitActive,
				}}
			>
				<div className={classNames(css.innerBackground, css.noImage)}></div>
			</CSSTransition>
		</div>
	)

	//return (
	//	<Canvas linear flat className={css.canvas}>
	//		<Skybox location={location} />
	//		<Camera {...camera} />
	//	</Canvas>
	//)
}

export default Background
