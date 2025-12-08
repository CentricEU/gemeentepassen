import { render } from "@testing-library/react-native";
import WalletButton from "./WalletButton";
import style from "./WalletButtonStyle";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

jest.mock("../../assets/icons/android-wallet.svg", () => "AndroidWalletIcon");
jest.mock("../../assets/icons/apple-wallet.svg", () => "AppleWalletIcon");

describe("WalletButton Component", () => {
	// test.each([
	// 	{ isPlatformIos: true, buttonText: "generic.buttons.addApple" },
	// 	{ isPlatformIos: false, buttonText: "generic.buttons.addAndroid" },
	// ])(
	// 	"should render correct Wallet button when isPlatformIos is %s",
	// 	({ isPlatformIos, buttonText }) => {
	// 		const { getByText } = render(
	// 			<WalletButton isIosPlatform={isPlatformIos} />
	// 		);
	// 		expect(getByText(buttonText)).toBeTruthy();
	// 	}
	// );

	// test.each([
	// 	{ isPlatformIos: true, buttonText: "generic.buttons.addApple", shouldRender: true },
	// 	{ isPlatformIos: false, buttonText: "generic.buttons.addAndroid", shouldRender: false },
	// ])(
	// 	"should handle Wallet button correctly when isPlatformIos is $isPlatformIos",
	// 	({ isPlatformIos, buttonText, shouldRender }) => {
	// 		const { queryByText } = render(
	// 			<WalletButton isIosPlatform={isPlatformIos} />
	// 		);

	// 		if (shouldRender) {
	// 			expect(queryByText(buttonText)).toBeTruthy();
	// 		} else {
	// 			expect(queryByText(buttonText)).toBeNull();
	// 		}
	// 	}
	// );

	// it("should apply styles correctly", () => {
	// 	const { getByText } = render(<WalletButton isIosPlatform={true} />);
	// 	const button = getByText("generic.buttons.addApple");

	// 	expect(button.props["style"]).toContainEqual(
	// 		expect.objectContaining(style.buttonText)
	// 	);
	// });
});
