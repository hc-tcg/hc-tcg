import {SingleUse, isHermit} from 'common/cards/types'
import Modal from 'components/modal'
import {
	getAvailableActions,
	getPlayerEntity,
	getPlayerStateByEntity,
} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import {getOpponentActiveRow, getPlayerActiveRow} from '../../game-selectors'
import Attack from './attack'

type Props = {
	closeModal: () => void
}

function AttackModal({closeModal}: Props) {
	// TODO - This whole file needs to be rafactored
	const dispatch = useMessageDispatch()
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const availableActions = useSelector(getAvailableActions)
	const playerEntity = useSelector(getPlayerEntity)
	const playerState = useSelector(getPlayerStateByEntity(playerEntity))
	const singleUseCard = playerState?.board.singleUseCardUsed
		? null
		: playerState.board.singleUse.card

	if (!activeRow || !playerState || !activeRow.hermit) return null
	if (!opponentRow || !opponentRow.hermit) return null
	if (availableActions.includes('WAIT_FOR_TURN')) return null

	const playerHermitInfo = activeRow.hermit.card
	if (!playerHermitInfo) return null

	if (!isHermit(playerHermitInfo.props)) return null

	const hermitFullName = playerHermitInfo.props.id.split('_')[0]
	const singleUseInfo = singleUseCard ? singleUseCard : null

	const handleAttack = (type: 'single-use' | 'primary' | 'secondary') => {
		dispatch({type: localMessages.GAME_ACTIONS_ATTACK, attackType: type})
		closeModal()
	}

	const effectAttack = () => handleAttack('single-use')
	const primaryAttack = () => handleAttack('primary')
	const secondaryAttack = () => handleAttack('secondary')

	let singleUseProps = singleUseInfo?.props as SingleUse | undefined
	let singleUseIcon = singleUseProps?.hasAttack
		? `/images/effects/${singleUseInfo?.props.id}.png`
		: undefined

	const attacks = []
	let canUseHermitAttacks =
		availableActions.includes('PRIMARY_ATTACK') ||
		availableActions.includes('SECONDARY_ATTACK')

	if (singleUseInfo && availableActions.includes('SINGLE_USE_ATTACK')) {
		let namePrefix = canUseHermitAttacks ? 'Only use ' : ''
		attacks.push(
			<Attack
				key="single-use"
				name={`${namePrefix}${singleUseInfo.props.name}`}
				icon={`/images/effects/${singleUseInfo?.props.id}.png`}
				attackInfo={{description: singleUseProps?.description || ''}}
				singleUseDamage={singleUseInfo.attackHint || undefined}
				onClick={effectAttack}
			/>,
		)
	}

	if (availableActions.includes('PRIMARY_ATTACK')) {
		attacks.push(
			<Attack
				key="primary"
				name={playerHermitInfo.props.primary.name}
				icon={`/images/hermits-nobg/${hermitFullName}.png`}
				attackInfo={playerHermitInfo.props.primary}
				singleUseIcon={singleUseIcon}
				singleUseDamage={singleUseInfo?.attackHint || undefined}
				onClick={primaryAttack}
			/>,
		)
	}

	if (availableActions.includes('SECONDARY_ATTACK')) {
		attacks.push(
			<Attack
				key="secondary"
				name={playerHermitInfo.props.secondary.name}
				icon={`/images/hermits-nobg/${hermitFullName}.png`}
				attackInfo={playerHermitInfo.props.secondary}
				singleUseIcon={singleUseIcon}
				singleUseDamage={singleUseInfo?.attackHint || undefined}
				onClick={secondaryAttack}
			/>,
		)
	}

	let title =
		canUseHermitAttacks && singleUseProps?.hasAttack
			? `Attack with ${playerHermitInfo.props.name} and use ${singleUseProps.name}`
			: 'Attack'

	return (
		<Modal setOpen title={title} onClose={closeModal}>
			<Modal.Description>
				{attacks.length ? (
					<>
						<Modal.Notice icon={'!'}>
							Attacking will end your turn!
						</Modal.Notice>
						{attacks}
					</>
				) : (
					<span>No attacks available.</span>
				)}
			</Modal.Description>
		</Modal>
	)
}

export default AttackModal
