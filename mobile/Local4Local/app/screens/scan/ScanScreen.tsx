import { Button, View } from "react-native";
import { Test } from "../test/TestScreen";
import Stack from "../../navigations/StackNavigator";
import { headerOptions } from "../../components/header/GlobalHeader";
import style from "./ScanStyle";
import { useTranslation } from "react-i18next";

export function Scan({ navigation }: { navigation: any }) {
	const navigateToScanDetails = () => {
		navigation.navigate("Test");
	};

	return (
		<View style={style.container}>
			<Button
				title="Go to Scan Details"
				onPress={navigateToScanDetails}
			/>
		</View>
	);
}

export function ScanStack({}: { navigation: any }) {
	const { t } = useTranslation("common");

	return (
		<Stack.Navigator
			screenOptions={{
				...headerOptions,
			}}
		>
			<Stack.Screen
				name="Scan"
				component={Scan}
				options={{
					title: t("navigation.scan"),
				}}
			/>
			<Stack.Screen
				name="Test"
				component={Test}
				options={{ title: "Test Screen" }}
			/>
		</Stack.Navigator>
	);
}
