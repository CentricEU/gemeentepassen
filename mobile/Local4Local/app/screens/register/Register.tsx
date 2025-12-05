import { ImageBackground, View } from "react-native";
import styles from "./RegisterStyle";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { RouteProp } from '@react-navigation/native';
import RegisterForm from "../../components/register-form/RegisterForm";

type GetStartedScreenProps = {
	navigation: StackNavigationProp<RootStackParamList, 'Register'>;
	route: RouteProp<RootStackParamList, 'Register'>;
};

export function Register({ navigation, route }: GetStartedScreenProps) {

	return (
		<ImageBackground
			source={require('../../assets/background-element.png')}
			style={{ flex: 1 }}
			resizeMode="stretch">
			<View style={styles.mainContainer} testID="mainContainer">
				<RegisterForm navigation={navigation} route={route} />
			</View>
		</ImageBackground>
	);
}
