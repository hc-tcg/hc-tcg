import NoDerpcoins from "../../achievements/no-derpcoins";
import { Coin } from "../types";

const EvilXCoin: Coin = {
    type: 'coin',
    id: 'evilx',
    name: 'Evil X',
    borderColor: '#666666',
    requires: NoDerpcoins.id,
}

export default EvilXCoin
