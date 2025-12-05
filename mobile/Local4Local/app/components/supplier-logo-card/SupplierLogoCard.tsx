import { Image, View } from "react-native";
import { styles } from "./SupplierLogoCardStyle";
import PlaceholderIcon from '../../assets/icons/image_b.svg';
import { colors } from "../../common-style/Palette";

interface SupplierLogoCardProps {
	logo: string
}

export default function SupplierLogoCard({ logo }: SupplierLogoCardProps) {
	return (
		<View style={styles.cardContainer}>
			{logo ? <Image testID="supplier-logo" source={{ uri: 'data:image/jpeg;base64,' + logo }} style={styles.supplierLogo} />
				: <PlaceholderIcon testID="placeholder-icon" width={24} height={24} fill={colors.GREY_SCALE} />}
		</View>
	);
}
