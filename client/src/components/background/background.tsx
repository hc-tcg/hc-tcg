/* eslint-disable react/no-unknown-property */
import css from './background.module.scss'
import {CSSTransition} from 'react-transition-group'
import classNames from 'classnames'
import {useRef} from 'react'

//type CameraProps = {
//	rotationEnabled?: boolean
//	rotationSpeed?: number
//	startingRotation?: number
//	fov?: number
//}
//
//const Camera = ({
//	rotationEnabled,
//	rotationSpeed,
//	startingRotation,
//	fov,
//}: CameraProps) => {
//	const cameraRef = useRef<THREE.PerspectiveCamera>(null)
//
//	useFrame(() => {
//		if (!cameraRef.current) return
//		if (rotationEnabled === undefined) rotationEnabled = true
//		rotationEnabled &&
//			(cameraRef.current.rotation.y -= (rotationSpeed || 0.5) / -10000)
//	})
//
//	return (
//		<PerspectiveCamera
//			makeDefault
//			ref={cameraRef}
//			fov={fov || 75}
//			position={[0, 0, 0]}
//			rotation={[Math.PI, (startingRotation || 0) * (6.3 / 360), Math.PI]}
//		/>
//	)
//}
//
//type SkyboxProps = {
//	location: string
//}
//
//const Skybox = ({location}: SkyboxProps) => {
//	const loader = new THREE.CubeTextureLoader()
//	loader.setPath(`/images/panorama/${location}/`)
//	const texture = loader.load([
//		`panorama_1.png`, //Right
//		`panorama_3.png`, //Left
//		`panorama_5.png`, //Top
//		`panorama_4.png`, //Bottom
//		`panorama_0.png`, //Front
//		`panorama_2.png`, //Back
//	])
//
//	texture.flipY = true
//
//	return (
//		<mesh>
//			<sphereGeometry />
//			<meshBasicMaterial envMap={texture} side={THREE.BackSide} />
//		</mesh>
//	)
//}
//
//type OldProps = {
//	location?: 'hermit-hill' | 'town-hall'
//	camera?: CameraProps
//}

type Props = {
	noImage?: boolean
}

const Background = ({noImage}: Props) => {
	const nodeRef1 = useRef(null)
	const nodeRef2 = useRef(null)
	return (
		<div className={css.background}>
			<CSSTransition
				nodeRef={nodeRef1}
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
				<div className={classNames(css.innerBackground, css.image)} ref={nodeRef1}></div>
			</CSSTransition>
			<CSSTransition
				nodeRef={nodeRef2}
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
				<div className={classNames(css.innerBackground, css.noImage)} ref={nodeRef2}></div>
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
