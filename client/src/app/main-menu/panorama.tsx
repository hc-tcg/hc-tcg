/* eslint-disable react/no-unknown-property */
import {useRef} from 'react'
import * as THREE from 'three'
import css from './panorama.module.scss'
import {PerspectiveCamera} from '@react-three/drei'
import {Canvas, useFrame} from '@react-three/fiber'

type Props = {
	panorama: 'hermit-hill' | 'town-hall'
	camera?: CameraProps
}

type CameraProps = {
	rotationEnabled?: boolean
	rotationSpeed?: number
	startingRotation?: number
	fov?: number
}

const Panorama = ({panorama, camera}: Props) => {
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

	const Skybox = () => {
		const loader = new THREE.CubeTextureLoader()
		loader.setPath(`/images/panorama/${panorama}/`)
		const texture = loader.load([
			`panorama_1.png`, //Right
			`panorama_3.png`, //Left
			`panorama_4.png`, //Top
			`panorama_5.png`, //Bottom
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

	return (
		<Canvas linear flat className={css.canvas}>
			<Skybox />
			<Camera {...camera} />
		</Canvas>
	)
}

export default Panorama
