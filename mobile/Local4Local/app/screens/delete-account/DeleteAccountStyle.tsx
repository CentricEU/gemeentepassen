import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";

const style = StyleSheet.create({
  scrollableContainer: {
    padding: 20,
    backgroundColor: colors.SURFACE_50
  },
  sorryMessage: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20
  },
  description: {
    fontSize: 14,
    marginBottom: 20
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10
  },
  checkboxContainer: {
    marginBottom: 20
  },
  checkboxItem: {
    flexDirection: "row"
  },
  checkboxLabel: {
    fontSize: 14
  },
  dangerImage: {
    alignSelf: "center"
  },
  buttonsContainer:{
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.SURFACE_50_OPACITY_50
  }

});

export default style;
