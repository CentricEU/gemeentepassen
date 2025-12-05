import styles from "./GenericAccordionStyle";
import { Icon } from 'react-native-paper';
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../common-style/Palette";
import { useState } from 'react';

export default function GenericAccordion({ children, title }: any) {

	const [expanded, setExpanded] = useState(false);

	const body = <View style={styles.accordBody}>{children}</View>;

	const toggleItem = () => setExpanded(!expanded);

	return (
		<View style={styles.accordContainer}>
			<TouchableOpacity style={styles.accordHeader} onPress={toggleItem}>
				<Text style={styles.accordTitle}>{title}</Text>
				<Icon source={expanded ? 'chevron-up' : 'chevron-down'}
					size={20} color={colors.GREY_SCALE} />
			</TouchableOpacity>
			{expanded && body}
		</View>
	);

}

