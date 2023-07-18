import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {useState, useRef} from 'react'
import Button from 'components/button'
import {PlayerDeckT} from 'common/types/deck'
import Dropdown from 'components/dropdown'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import DropdownCSS from '../../app/deck/deck.module.scss'
import css from './import-export.module.scss'
import {getDeckFromHash} from './import-export-utils'
import {CardT} from '../../../../common/types/game-state'

type Props = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	importDeck: (deck: PlayerDeckT) => void
}

export const ImportModal = ({setOpen, onClose, importDeck}: Props) => {
	const nameRef = useRef<HTMLInputElement | null>(null)
	const hashRef = useRef<HTMLInputElement | null>(null)
	const [deckIcon, setDeckIcon] = useState<PlayerDeckT['icon']>('any')

	//IMPORT DECK FUNCTION
	const handleImportDeck = () => {
		if (!hashRef.current) return
		let deck: Array<CardT> = []

		try {
			deck = getDeckFromHash(hashRef.current.value)
		} catch {
			console.log('Invalid deck to import: ' + hashRef.current.value)
		}

		if (deck.length < 1) return null

		if (!deck) return null

		importDeck({
			name: nameRef?.current?.value || 'Imported Deck',
			icon: deckIcon,
			cards: deck,
		})
	}

	const DECK_ICONS = [
		'any',
		'balanced',
		'builder',
		'explorer',
		'farm',
		'miner',
		'prankster',
		'pvp',
		'redstone',
		'speedrunner',
		'terraform',
	]

	const iconDropdownOptions = DECK_ICONS.map((option) => ({
		name: option,
		key: option,
		icon: `/images/types/type-${option}.png`,
	}))

	//JSX
	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => onClose(e)}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Import Deck
						<AlertDialog.Cancel asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description asChild className={ModalCSS.AlertDialogDescription}>
						<div>
							{/* IMPORT SECTION */}
							<div>
								<div className={css.importControls}>
									<div className={css.name}>
										<Dropdown
											button={
												<button className={DropdownCSS.iconButton}>
													<img src={`/images/types/type-${deckIcon}.png`} />
												</button>
											}
											label="Deck Icon"
											options={iconDropdownOptions}
											action={(option: any) => setDeckIcon(option)}
										/>
										<input
											type="text"
											maxLength={32}
											placeholder="Deck Name"
											ref={nameRef}
											style={{flexGrow: 1}}
										/>
									</div>
									<input
										type="text"
										placeholder="Deck Hash..."
										ref={hashRef}
										style={{flexGrow: 1}}
									/>
									<p
										className={css.instructions}
									>{`To import a deck, select a deck icon, give your deck a name, enter the Deck Hash, then click Import.`}</p>
								</div>
							</div>
						</div>
					</AlertDialog.Description>
					<div className={ModalCSS.buttonContainer}>
						<Button onClick={handleImportDeck}>Import</Button>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
