import {Text, View} from "react-native";
import {Chip} from "react-native-paper";
import common from "../../common-style/CommonStyle";
import {styles} from "./BenefiChipStyle";

export default function BenefitChip({label}: any) {
	return (
		<View style={styles.grantChipContainer}>
			<Chip
				mode={'outlined'}
				style={[
					common.clearDefaults,
					styles.grantChip,
				]}
				textStyle={[common.clearDefaults, styles.grantChipLabel]}
			>
				<Text>{label}</Text>
			</Chip>
		</View>
	);
}
