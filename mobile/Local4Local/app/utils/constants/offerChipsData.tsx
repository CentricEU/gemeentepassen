import PercentBoldIcon from "../../assets/icons/percent_b.svg";
import PlusBoldIcon from "../../assets/icons/plus_eb.svg";
import EuroCoinIcon from "../../assets/icons/euro-coin_b.svg";
import StarIcon from "../../assets/icons/star_b.svg";

import {ReactElement} from "react";

export interface chipData {
	typeId: number,
	label: string,
	icon?: ReactElement
}

const offerChipsData: chipData[] = [
	{
		typeId: -1,
		label: 'offersPage.chipList.all',
	},
	{
		typeId: 1,
		label: 'offersPage.chipList.percentage',
		icon: <PercentBoldIcon width={16} height={16}/>,
	},
	{
		typeId: 2,
		label: 'offersPage.chipList.bogo',
		icon: <PlusBoldIcon width={16} height={16}/>,
	},
	{
		typeId: 3,
		label: 'offersPage.chipList.credit',
		icon: <EuroCoinIcon width={16} height={16}/>,
	},
	{
		typeId: 4,
		label: 'offersPage.chipList.freeEntry',
		icon: <StarIcon width={16} height={16}/>,
	}
];

export default offerChipsData;
