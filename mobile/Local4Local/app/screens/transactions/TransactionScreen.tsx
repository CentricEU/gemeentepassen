import {Text, ScrollView} from "react-native";
import Stack from "../../navigations/StackNavigator";
import {headerOptions} from "../../components/header/GlobalHeader";
import style from "./TransactionsStyle";
import {useTranslation} from "react-i18next";

export function Transactions({}: { navigation: any }) {
	return (
		<ScrollView style={style.container}>
			<Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam et sollicitudin tortor. Mauris
				dapibus, ante vel scelerisque viverra, arcu diam tempor erat, eget convallis velit felis at enim. Sed
				facilisis laoreet lacus sit amet convallis. Pellentesque iaculis congue turpis. Pellentesque habitant
				morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc imperdiet vel nisi nec
				ullamcorper. Ut elit lectus, lobortis non molestie eget, tincidunt eu lorem. Proin ac rhoncus nibh. Ut
				quis lobortis lorem, at dictum neque. Morbi tempor cursus arcu sit amet mollis. Sed commodo eros vitae
				lacus vestibulum vehicula. Phasellus sed gravida lectus. In hac habitasse platea dictumst. Phasellus
				facilisis maximus lectus, ac vehicula enim mattis ut. Donec cursus risus in rutrum pretium. Donec porta
				sem sapien, a pharetra eros efficitur non.

				Nunc non ex ac mi varius convallis nec eu urna. Proin dignissim nunc tristique, scelerisque felis eget,
				tristique felis. Aliquam molestie nulla in egestas eleifend. Nullam sed nisl purus. Integer dapibus
				placerat lorem, non tristique velit ornare nec. Cras mi odio, tincidunt id ante non, euismod scelerisque
				neque. Pellentesque eu lectus mollis, efficitur arcu et, rhoncus ex. Nulla facilisi. In ante nibh,
				porttitor vel malesuada et, pulvinar vel quam. Morbi pretium nunc justo, sollicitudin ultricies mauris
				imperdiet nec. Fusce ut dignissim felis, eu dapibus sapien. Interdum et malesuada fames ac ante ipsum
				primis in faucibus. Phasellus neque metus, pharetra sed risus quis, faucibus egestas neque. Quisque
				auctor non felis non elementum. Mauris dictum convallis massa, in egestas orci maximus eu.

				Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Interdum et
				malesuada fames ac ante ipsum primis in faucibus. Quisque bibendum auctor sem eu tincidunt. Mauris
				faucibus scelerisque sodales. In enim odio, lobortis sed placerat et, mollis eu tellus. Duis consequat
				elementum quam, at rhoncus lacus dictum et. Vivamus blandit nisi nisi, in maximus turpis laoreet quis.
				Curabitur a lobortis sapien.
				v
				Integer bibendum nisi leo, vel tempor mauris molestie id. Integer et nisi eu urna maximus viverra eget
				ut urna. Nunc finibus ligula id lorem dictum fermentum. Class aptent taciti sociosqu ad litora torquent
				per conubia nostra, per inceptos himenaeos. Donec odio justo, dapibus finibus varius vitae, volutpat
				vitae nulla. Nam luctus eros risus, sit amet dictum tellus dictum in. Duis pulvinar lacus in sem
				elementum, eget porttitor urna congue. Cras tempor sodales nisl ultricies elementum. Nullam in purus vel
				urna posuere suscipit.

				Nam ac elementum risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur
				ridiculus mus. Donec varius felis sed lacus luctus sodales. Integer lobortis leo sed odio sodales
				euismod. Sed bibendum elit porta tortor auctor tempor. Sed condimentum nec turpis id gravida. Nulla
				hendrerit felis quis risus blandit, id convallis est fringilla. Nunc euismod odio vel congue consequat.
				Nullam semper, nisl id ultricies placerat, ante urna imperdiet ante, sed tincidunt urna odio ut metus.
				Nam sit amet ultricies metus. Maecenas ut aliquam nisl. Orci varius natoque penatibus et magnis dis
				parturient montes, nascetur ridiculus mus. Donec pellentesque accumsan diam vel luctus. In massa felis,
				feugiat sed malesuada sed, eleifend sed elit. Orci varius natoque penatibus et magnis dis parturient
				montes, nascetur ridiculus mus. In quis auctor lectus, sed blandit quam.</Text>
		</ScrollView>
	);
}

export function TransactionsStack({}: { navigation: any }) {
	const { t } = useTranslation('common');

	return (
		<Stack.Navigator screenOptions={{
			...headerOptions
		}}>
			<Stack.Screen
				name="Transactions"
				component={Transactions}
				options={{
					title: t('navigation.transactions')
				}}
			/>
		</Stack.Navigator>
	);
}
