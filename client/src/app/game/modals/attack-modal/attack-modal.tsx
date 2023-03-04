import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT, HermitCardT} from 'types/cards'
import CARDS from 'server/cards'
import {getPlayerActiveRow, getOpponentActiveRow} from '../../game-selectors'
import css from './attack-modal.module.css'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getPlayerStateById,
} from 'logic/game/game-selectors'
import {startAttack} from 'logic/game/game-actions'
import Attack from './attack'
import HermitSelector from './hermit-selector'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	// TODO - This whole file needs to be rafactored
	const dispatch = useDispatch()
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const availableActions = useSelector(getAvailableActions)
	const playerId = useSelector(getPlayerId)
	const playerState = useSelector(getPlayerStateById(playerId))
	const singleUseCard = playerState?.board.singleUseCard

	if (!activeRow || !playerState || !activeRow.hermitCard) return null
	if (!opponentRow || !opponentRow.hermitCard) return null

	const playerHermitInfo = TYPED_CARDS[
		activeRow.hermitCard.cardId
	] as HermitCardT

	const hermitFullName = playerHermitInfo.id.split('_')[0]
	const singleUseInfo = singleUseCard ? TYPED_CARDS[singleUseCard.cardId] : null

	const handleAttack = (type: 'zero' | 'primary' | 'secondary') => {
		dispatch(startAttack(type))
		closeModal()
	}

	const handleExtraAttack = (hermitExtra: any) => {
		const extra = {
			[playerHermitInfo.id]: hermitExtra,
		}
		dispatch(startAttack('secondary', extra))
		closeModal()
	}

	const effectAttack = () => handleAttack('zero')
	const primaryAttack = () => handleAttack('primary')
	const secondaryAttack = () => handleAttack('secondary')

	const attacks = []
	if (singleUseInfo && availableActions.includes('ZERO_ATTACK')) {
		attacks.push(
			<Attack
				key="zero"
				name={singleUseInfo.name}
				icon={`/images/effects/${singleUseInfo?.id}.png`}
				attackInfo={null}
				onClick={effectAttack}
			/>
		)
	}

	if (availableActions.includes('PRIMARY_ATTACK')) {
		attacks.push(
			<Attack
				key="primary"
				name={playerHermitInfo.primary.name}
				icon={`/images/hermits-nobg/${hermitFullName}.png`}
				attackInfo={playerHermitInfo.primary}
				onClick={primaryAttack}
			/>
		)
	}

	const extraAttacks = availableActions.filter((a) => a.includes(':'))

	if (!extraAttacks.length && availableActions.includes('SECONDARY_ATTACK')) {
		attacks.push(
			<Attack
				key="secondary"
				name={playerHermitInfo.secondary.name}
				icon={`/images/hermits-nobg/${hermitFullName}.png`}
				attackInfo={playerHermitInfo.secondary}
				onClick={secondaryAttack}
			/>
		)
	}

	if (extraAttacks.length) {
		attacks.push(
			<HermitSelector
				key="hermit-selector"
				extraAttacks={extraAttacks}
				handleExtraAttack={handleExtraAttack}
			/>
		)
	}

	return (
		<Modal title="Attack" closeModal={closeModal}>
			<div className={css.attackModal}>
				{attacks.length ? (
					<>
						<div className={css.turnEndNotification}>
							<span className={css.infoIcon}>!</span>
							Attack is the last action of your turn.
						</div>
						<div className={css.turnEndNotification}>
							<span className={css.infoIcon}>i</span>
							Damage bonuses from special moves are NOT included in the preview.
						</div>
						{attacks}
					</>
				) : (
					<span className={css.noAttacks}>No attacks available.</span>
				)}
			</div>
		</Modal>
	)
}

export default AttackModal
