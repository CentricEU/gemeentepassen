import PlusBoldIcon from '../../assets/icons/plus_eb.svg';
import AdmissionIcon from '../../assets/icons/admission.svg';
import MembershipIcon from '../../assets/icons/membership.svg';
import ProductIcon from '../../assets/icons/product.svg';

import { ReactElement } from 'react';

export interface chipData {
	typeId: number;
	label: string;
	icon?: ReactElement;
}

const offerChipsData: chipData[] = [
	{
		typeId: -1,
		label: 'offersPage.chipList.all'
	},
	{
		typeId: 1,
		label: 'offersPage.chipList.storeCredit',
		icon: <ProductIcon width={16} height={16} />
	},
	{
		typeId: 2,
		label: 'offersPage.chipList.bogo',
		icon: <PlusBoldIcon width={16} height={16} />
	},
	{
		typeId: 3,
		label: 'offersPage.chipList.membershipFee',
		icon: <MembershipIcon width={16} height={16} />
	},
	{
		typeId: 4,
		label: 'offersPage.chipList.freeEntry',
		icon: <AdmissionIcon width={16} height={16} />
	},
	{
		typeId: 5,
		label: 'offersPage.chipList.freeProduct',
		icon: <ProductIcon width={16} height={16} />
	}
];

export default offerChipsData;
