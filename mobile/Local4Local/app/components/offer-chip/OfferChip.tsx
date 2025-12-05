import {Chip} from "react-native-paper";
import {Text, View} from "react-native";
import common from "../../common-style/CommonStyle";
import styles from "./OfferChipStyle";
import {getOfferTypeData} from "../../utils/models/OfferType";

interface OfferChipProps {
	typeId: number;
}

export default function OfferChip({typeId}: OfferChipProps) {

	const offerData = getOfferTypeData(typeId);

	return (
		<View style={styles.offerChipContainer}>
			<Chip
				mode={'outlined'}
				style={[
					common.clearDefaults,
					styles.offerChip,
					{
						borderColor: offerData.primaryColor,
						backgroundColor: offerData.secondaryColor
					}
				]}
				textStyle={[common.clearDefaults, styles.offerChipLabel]}
			>
				<Text>{offerData.label}</Text>
			</Chip>
		</View>
	);
}
