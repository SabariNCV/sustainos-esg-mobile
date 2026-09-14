import { View, StyleSheet } from "react-native";
import React from "react";
import { scaleHeight} from '../Constants/dynamicSize';
import LottieView from 'lottie-react-native';

const CustomLoader = (props) => {
    return (
        <View style={styles.container}>
            <LottieView
                source={props?.loader}
                style={{height: scaleHeight(100)}}
                autoPlay
                loop
            />
        </View>
    )
}
export default CustomLoader
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent:'center'
    }
})