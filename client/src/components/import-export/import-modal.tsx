import {TypeT} from 'common/types/cards'
import {Deck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {getDeckFromHash} from 'common/utils/import-export'
import Button from 'components/button'
import Dropdown from 'components/dropdown'
import {Modal} from 'components/modal'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useRef, useState} from 'react'
import DropdownCSS from '../../app/deck/deck.module.scss'
import css from './import-export.module.scss'

type Props = {
	setOpen: boolean
	onClose: () => void
	importDeck: (deck: Deck, noActiveChange?: boolean) => void
	handleMassImport: () => void
}

function isDatabaseDeckCode(hash: string) {
	return hash.length === 7 && hash.match(/[1234567890abcdef]+/)
}

export const ImportModal = ({
	setOpen,
	onClose,
	importDeck,
	handleMassImport,
}: Props) => {
	const nameRef = useRef<HTMLInputElement | null>(null)
	const hashRef = useRef<HTMLInputElement | null>(null)
	const dispatch = useMessageDispatch()
	const [askForDeckName, setAskForDeckName] = useState(false)
	const [readyToSubmit, setReadyToSubmit] = useState(false)
	const [deckIcon, setDeckIcon] = useState<Deck['icon']>('any')

	async function importFromHash() {
		if (!hashRef.current) return

		const hash = hashRef.current.value

		if (isDatabaseDeckCode(hash)) {
			dispatch({
				type: localMessages.IMPORT_DECK,
				code: hash,
				newActiveDeck: hash,
			})
			onClose()
			return
		}

		// Legacy import
		let deck: Array<LocalCardInstance> = []

		try {
			deck = getDeckFromHash(hash)
		} catch {
			console.log('Invalid deck to import: ' + hash)
		}

		if (deck.length < 1) return null

		if (!deck) return null

		importDeck({
			name: nameRef?.current?.value || 'Imported Deck',
			icon: deckIcon as TypeT,
			iconType: 'item',
			cards: deck,
			code: generateDatabaseCode(),
			tags: [],
		})

		onClose()
	}

	function onInputChange() {
		if (!hashRef.current) {
			setAskForDeckName(false)
		} else if (!hashRef.current.value) {
			setAskForDeckName(false)
		}
		// User probably hasn't finishe entering thier code.
		else if (
			hashRef.current.value.length <= 7 &&
			!isDatabaseDeckCode(hashRef.current.value)
		) {
			setAskForDeckName(false)
		} else if (isDatabaseDeckCode(hashRef.current.value)) {
			setAskForDeckName(false)
		} else {
			setAskForDeckName(true)
		}

		if (hashRef.current?.value && hashRef.current.value.length >= 7) {
			setReadyToSubmit(true)
		} else {
			setReadyToSubmit(false)
		}
	}

	const selectFile = () => {
		// Select a file by clicking on file input
		document.getElementById('file-input')?.click()
	}

	const importFromFile = (file: File | undefined) => {
		if (!file) return
		const fileResult = file.text()
		if (!fileResult) return

		fileResult.then((newFileContent: string) => {
			let importedSomething = false
			const codes: Array<string> = []

			newFileContent.split('\n').forEach((line: string) => {
				const cleanLine = line.replace('\r', '')
				if (isDatabaseDeckCode(cleanLine)) {
					codes.push(cleanLine)
					dispatch({
						type: localMessages.IMPORT_DECK,
						code: cleanLine,
					})
					importedSomething = true
					return
				}

				// Legacy import
				const lineComponents: string[] = line.split(':')
				if (lineComponents.length !== 3) return
				const deck = getDeckFromHash(lineComponents[2].replace('\r', ''))
				if (deck.length === 0) return

				const filteredName = lineComponents[0]
					.match('^[a-zA-Z0-9 ]*$')
					?.toString()
				if (!filteredName) {
					return
				}

				importedSomething = true
				importDeck({
					name: filteredName,
					iconType: 'item',
					icon: DECK_ICONS.includes(lineComponents[1])
						? (lineComponents[1] as TypeT)
						: 'any',
					cards: deck,
					code: generateDatabaseCode(),
					tags: [],
				})
			})

			dispatch({
				type: localMessages.UPDATE_DECKS,
			})

			if (importedSomething) {
				console.log('Successfully imported decks from file: ' + file.name)
				handleMassImport()
			} else {
				console.log('Failed to import decks from file: ' + file.name)
			}
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

	return (
		<Modal title="Import Decks" setOpen={setOpen} onClose={onClose}>
			<Modal.Description>
				<div className={css.importControls}>
					<p className={css.instructions}>
						To import a deck, enter the deck hash, then click "Import".
					</p>
					{askForDeckName && (
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
					)}
					<input
						type="text"
						placeholder="Deck Code..."
						onChange={onInputChange}
						ref={hashRef}
						style={{flexGrow: 1}}
					/>
					<p className={css.instructions}>
						{
							'Alternatively, choose a file to mass import decks from. Hashes must each occupy one line, with no spaces before or after the hash.'
						}
					</p>
				</div>
			</Modal.Description>
			<Modal.Options>
				<Button onClick={importFromHash} disabled={!readyToSubmit}>
					Import
				</Button>
				<Button onClick={selectFile}>Import from file</Button>
				<input
					id="file-input"
					type="file"
					onChange={(e) =>
						importFromFile(e.target.files ? e.target.files[0] : undefined)
					}
					style={{display: 'none'}}
				/>
			</Modal.Options>
		</Modal>
	)
}
