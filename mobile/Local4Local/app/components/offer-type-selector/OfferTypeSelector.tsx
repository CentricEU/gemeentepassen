import { ScrollView } from "react-native";
import OfferTypeButton from "../offer-type-button/OfferTypeButton";
import styles from "./OfferTypeSelectorStyle";
import offerChipsData from "../../utils/constants/offerChipsData";

export default function OfferTypeSelector({ customStyle, selectedType, setSelectedType }: any) {
	return (
		<ScrollView
			testID="scroll-view"
			horizontal={true}
			showsHorizontalScrollIndicator={false}
			style={[styles.selectorContainer, customStyle]}
			contentContainerStyle={styles.selectorContent}
		>
			{offerChipsData.map((entry, index) => (
				<OfferTypeButton
					key={index}
					type={entry}
					selected={entry.typeId === selectedType}
					onPressHandler={setSelectedType}
				/>
			))}
		</ScrollView>
	);
}
