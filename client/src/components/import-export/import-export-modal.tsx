import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {useState, useRef} from 'react'
import Button from 'components/button'
import {PlayerDeckT} from 'common/types/deck'
import {universe} from './import-export-const'
import {CopyIcon} from 'components/svgs'
import Dropdown from 'components/dropdown'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import DropdownCSS from '../../app/deck/deck.module.scss'
import css from './import-export.module.scss'

type Props = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	importDeck: (deck: PlayerDeckT) => void
	loadedDeck: PlayerDeckT
}

const ImportExportModal = ({
	setOpen,
	onClose,
	importDeck,
	loadedDeck,
}: Props) => {
	console.log(loadedDeck.name)
	console.log(loadedDeck.cards)
	const nameRef = useRef<HTMLInputElement | null>(null)
	const hashRef = useRef<HTMLInputElement | null>(null)
	const [deckIcon, setDeckIcon] = useState<PlayerDeckT['icon']>('any')

	// EXPORT DECK FUNCTION
	// TODO: Remove deprecated "btoa" function.
	const handleExportDeck = () => {
		const indicies = []
		for (let i = 0; i < loadedDeck.cards.length; i++) {
			indicies.push(universe.indexOf(String(loadedDeck.cards[i].cardId)))
		}
		console.log('hey')
		console.log(indicies)
		const b64cards = btoa(String.fromCharCode.apply(null, indicies))
		return b64cards
	}

	//IMPORT DECK FUNCTION
	// TODO: Remove deprecated "atob" function.
	const handleImportDeck = () => {
		if (!hashRef.current) return
		const deck = []
		const b64 = atob(hashRef.current.value)
			.split('')
			.map((char) => char.charCodeAt(0))
		for (let i = 0; i < b64.length; i++) {
			deck.push({
				cardId: universe[b64[i]],
				cardInstance: Math.random().toString(),
			})
		}
		if (!deck) return

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
						Import/Export Deck
						<AlertDialog.Cancel asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description
						asChild
						className={ModalCSS.AlertDialogDescription}
					>
						<div>
							{/* EXPORT SECTION */}
							<div>
								<h2>Export Deck:</h2>
								<p className={css.instructions}>
									Export the {loadedDeck.name} deck to share with your friends!
								</p>
								<div className={css.controls}>
									<input type="text" readOnly value={handleExportDeck()} />
									<button
										className={css.copy}
										onClick={() => {
											navigator.clipboard.writeText(handleExportDeck())
										}}
									>
										{CopyIcon()}
									</button>
								</div>
							</div>
							<div className={css.divider} />
							{/* IMPORT SECTION */}
							<div>
								<h2>Import Deck:</h2>
								<p
									className={css.instructions}
								>{`To import a deck, select a deck icon, give your deck a name, enter the Deck Hash, then click Import.`}</p>
								<div className={css.controls}>
									<Dropdown
										button={
											<button className={DropdownCSS.IconButton}>
												<img src={`/images/types/type-${deckIcon}.png`} />
											</button>
										}
										label="Deck Icon"
										options={iconDropdownOptions}
										action={(option: any) => setDeckIcon(option)}
									/>
									<input
										type="text"
										placeholder="Deck Name"
										ref={nameRef}
										style={{flexGrow: 1}}
									/>
									<input
										type="text"
										placeholder="Deck Hash..."
										ref={hashRef}
										style={{flexGrow: 1}}
									/>
								</div>
							</div>
						</div>
					</AlertDialog.Description>
					<div className={ModalCSS.buttonContainer}>
						<AlertDialog.Action onClick={handleImportDeck} asChild>
							<Button.Ref>Import</Button.Ref>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}

export default ImportExportModal
