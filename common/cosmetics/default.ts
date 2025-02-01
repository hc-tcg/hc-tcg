import TransparentBackground from "./background/transparent";
import BlueBorder from "./borders/blue";
import CreeperCoin from "./coins/creeper";
import RedHearts from "./hearts/red";
import EmptyTitle from "./titles/empty";
import { Appearance } from "./types";

export const defaultAppearance: Appearance = {
	title: EmptyTitle,
	coin: CreeperCoin,
	heart: RedHearts,
	background: TransparentBackground,
	border: BlueBorder,
}
