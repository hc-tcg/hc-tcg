import COINS from "./coins";
import TITLES from "./titles";
import { Cosmetic } from "./types";

export const ALL_COSMETICS = [...TITLES, ...COINS]

export const COSMETICS: Record<string | number, Cosmetic> =
    ALL_COSMETICS.reduce(
        (result: Record<string | number, Cosmetic>, card) => {
            result[card.id] = card
            return result
        },
        {},
    )
