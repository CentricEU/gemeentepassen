import { styles } from "./GenericInformationBlockStyle";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { GenericInformationBlockChild } from "../../utils/types/genericInformationBlockChild";
import { colors } from "../../common-style/Palette";
import WarningIcon from "../../assets/icons/exclamation-triangle_b.svg";

interface GenericInformationBlockProps {
	title: string;
	headerRight?: any;
	children: GenericInformationBlockChild[] | null;
}

export default function GenericInformationBlock({ title, headerRight, children }: GenericInformationBlockProps) {
	return (
		<View style={styles.genericInformationBlock}>
			<View style={styles.blockHeader}>
				<Text style={styles.blockTitle}>{title}</Text>
				{headerRight}
			</View>
			{children?.map((child: GenericInformationBlockChild, index: number) => (
				<View style={styles.blockSegment} key={index}>
					<Text style={styles.segmentLabel}>
						{child?.label}:&nbsp;
						{child?.textValue ? (
							<Text style={styles.segmentSpan}>
								{child.textValue}
							</Text>
						) : null}
					</Text>
					{child?.componentValue ? <child.componentValue /> : null}
					{child?.displayWarningSign ? <WarningIcon style={styles.warningSign} fill={colors.STATUS_DANGER_500} /> : null}
				</View>
			))}
		</View>
	);
}
