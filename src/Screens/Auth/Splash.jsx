import React, { useEffect, useRef, useState, memo } from 'react';
import { View, StatusBar } from 'react-native';
import { useDispatch } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import { splashStyles as styles } from './styles';
import { IMAGES } from '../../Constants/Images';
import { getProjectList } from '../../Redux/ReduxSlice/actions/authActions';

let splashSequenceStarted = false;
const SPLASH_MIN_DURATION = 3000;
const GIF_DURATION = 3840;

const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
    ]);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SplashGif = memo(() => {
    const [frozen, setFrozen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setFrozen(true), GIF_DURATION);
        return () => clearTimeout(t);
    }, []);

    return (
        <View style={styles.splashinsideContainer}>
            <View style={styles.AlignCenter}>
                <FastImage
                    source={frozen ? IMAGES.SustainOS : IMAGES.splash}
                    style={styles.firstAnimation}
                />
            </View>
        </View>
    );
});

const Splash = ({ navigation }) => {
    const dispatch = useDispatch();
    const isMounted = useRef(true);
    const hasNavigated = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        if (!splashSequenceStarted) {
            splashSequenceStarted = true;
            handleNavigation();
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    const resolveDestination = async () => {
        try {
            const token = await withTimeout(AsyncStorage.getItem("jwttoken"), 500);
            const skip = await withTimeout(AsyncStorage.getItem("skipped"), 500);
            const onboard = await withTimeout(AsyncStorage.getItem("isOnboard"), 500);

            if (token) {
                // if (skip === 'true' || onboard === 'true') {
                    return await resolveNextScreen();
                // } else {
                //     return { screen: 'MainScreen' };
                // }
            } else {
                return { screen: 'Login' };
            }
        } catch (error) {
            console.error("Error in handleNavigation:", error);
            return { screen: 'Login' };
        }
    };

    const resolveNextScreen = async () => {
        try {
            const result = await withTimeout(dispatch(getProjectList()).unwrap(), 5000);

            if (result) {
                return { screen: 'MainScreen' };
            }
            return { screen: 'Login' };
        } catch (error) {
            console.error("Error in goToNextScreen:", error);
            return { screen: 'Login' };
        }
    };

    const handleNavigation = async () => {
        let destination = { screen: 'Login' };
        let resolved = false;

        resolveDestination()
            .then((dest) => { destination = dest; resolved = true; })
            .catch(() => { destination = { screen: 'Login' }; resolved = true; });

        await wait(SPLASH_MIN_DURATION);

        if (!isMounted.current || hasNavigated.current) return;

        if (!resolved) {
            await Promise.race([
                new Promise((res) => {
                    const check = setInterval(() => {
                        if (resolved) {
                            clearInterval(check);
                            res();
                        }
                    }, 50);
                }),
                wait(1000),
            ]);
        }

        if (!isMounted.current || hasNavigated.current) return;
        hasNavigated.current = true;
        navigation.replace(destination.screen);
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent={true} />
            <SplashGif />
        </View>
    );
};

export default Splash;