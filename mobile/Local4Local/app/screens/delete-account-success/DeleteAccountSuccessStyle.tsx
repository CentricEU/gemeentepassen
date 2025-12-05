
import { StyleSheet } from "react-native";

const style = StyleSheet.create({
    container: {
      flex: 1
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 64
    },
    buttonContainer: {
        width: '100%',
        paddingTop: 24, 
        alignItems: 'center'
      },
      button: {
        width: '100%',
        marginBottom: 12
      },
    checkedIllustration: {
        marginBottom: 24,
        alignSelf: 'center'
    }
  });

  export default style;
