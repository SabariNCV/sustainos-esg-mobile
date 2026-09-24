import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, StatusBar, Text, TouchableOpacity, BackHandler, Animated, Easing, KeyboardAvoidingView, Image, PanResponder, Platform } from 'react-native';
import * as Yup from 'yup';
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { Formik } from 'formik';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';
import PropTypes from 'prop-types';
import { loginStyles as styles } from './styles';
import { COLORS } from '../../Constants/Colors';
import { scaleWidth } from '../../Constants/dynamicSize';
import { IMAGES } from '../../Constants/Images';
import CustomLoader from '../../Components/CustomLoader';
import { loginUser, getProjectList } from '../../Redux/ReduxSlice/actions/authActions';

const FormField = ({ label, value, onChangeText, placeholder, IconComponent, secureTextEntry, toggleSecure, error, inputTestID, toggleA11yLabel }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.subTitle}>{label}</Text>
        <View style={[styles.textInput, { borderColor: error ? COLORS.RED : COLORS.BORDERCOLOR }]}>
            <TextInput
                testID={inputTestID}
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.GREY}
                autoCapitalize="none"
                secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity onPress={toggleSecure} accessibilityLabel={toggleA11yLabel}>
                <View style={styles.eyeHeight}>
                    {IconComponent && <IconComponent size={18} color={COLORS.BLACK} />}
                </View>
            </TouchableOpacity>
        </View>
    </View>
);

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    IconComponent: PropTypes.elementType,
    secureTextEntry: PropTypes.bool,
    toggleSecure: PropTypes.func,
    error: PropTypes.string,
    inputTestID: PropTypes.string,
    toggleA11yLabel: PropTypes.string,
};

FormField.defaultProps = {
    placeholder: '',
    IconComponent: null,
    secureTextEntry: false,
    toggleSecure: () => { },
    error: '',
    inputTestID: undefined,
    toggleA11yLabel: undefined,
};

const SwipeButton = ({ onSwipeSuccess, text, disabled }) => {
    const trackWidthRef = useRef(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const currentX = useRef(0);
    const hasFired = useRef(false);
    const disabledRef = useRef(disabled);

    useEffect(() => {
        disabledRef.current = disabled;
    }, [disabled]);

    const onLayout = (e) => {
        trackWidthRef.current = e.nativeEvent.layout.width;

    };

    const getMaxSwipe = () => Math.max(trackWidthRef.current - 52 - 8, 1);

    useEffect(() => {
        if (disabled) {
            hasFired.current = false;
            currentX.current = 0;
            Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [disabled, translateX]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabledRef.current,
            onStartShouldSetPanResponderCapture: () => !disabledRef.current,
            onMoveShouldSetPanResponder: (_, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 2,
            onMoveShouldSetPanResponderCapture: (_, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 2,
            onPanResponderTerminationRequest: () => false,
            onPanResponderMove: (_, gesture) => {
                if (disabledRef.current) return;
                const maxSwipe = getMaxSwipe();
                const next = Math.max(0, Math.min(currentX.current + gesture.dx, maxSwipe));
                translateX.setValue(next);
            },
            onPanResponderRelease: (_, gesture) => {
                if (disabledRef.current) return;
                const maxSwipe = getMaxSwipe();
                const next = Math.max(0, Math.min(currentX.current + gesture.dx, maxSwipe));

                if (next >= maxSwipe * 0.85 && !hasFired.current) {
                    hasFired.current = true;
                    currentX.current = maxSwipe;
                    Animated.spring(translateX, {
                        toValue: maxSwipe,
                        useNativeDriver: true,
                    }).start(() => onSwipeSuccess());
                } else {
                    currentX.current = 0;
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    return (
       <View onLayout={onLayout} style={[styles.swipeTrack, disabled ? styles.swipeTrackDisabled : styles.swipeTrackEnabled]} >
            <Text style={styles.swipeButtonLabel}>{text}</Text>
            <Animated.View {...panResponder.panHandlers} style={[styles.swipeKnob, { transform: [{ translateX }] }]} >
                <ArrowRight size={20} color={disabled ? COLORS.GREY : COLORS.BUTTONGREEN} />
            </Animated.View>
        </View>
    );
};

SwipeButton.propTypes = {
    onSwipeSuccess: PropTypes.func.isRequired,
    text: PropTypes.string,
    disabled: PropTypes.bool,
};

SwipeButton.defaultProps = {
    text: 'Login',
    disabled: false,
};

const Login = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [secure, setSecure] = useState(true);
    const [loader, setLoader] = useState(false);
    const inAppUpdatesRef = useRef(new SpInAppUpdates(false));

    const animRefs = useRef({
        fadeAnim: new Animated.Value(0),
        formAnim: new Animated.Value(0),
        buttonAnim: new Animated.Value(0),
        translateY: new Animated.Value(-100),
        bgTranslateX: new Animated.Value(0),
        shakeAnim: new Animated.Value(0),
    }).current;

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, []),
    );

    useEffect(() => {
        const animate = (ref, toValue, duration, delay = 0) =>
            Animated.timing(ref, { toValue, duration, delay, useNativeDriver: true });

        Animated.stagger(100, [
            animate(animRefs.fadeAnim, 1, 1000),
            animate(animRefs.formAnim, 1, 800, 300),
            animate(animRefs.buttonAnim, 1, 500, 600),
            animate(animRefs.translateY, 0, 1000),
        ]).start();

        return () => Object.values(animRefs).forEach((anim) => anim.stop?.());
    }, [animRefs]);

    useEffect(() => {
        animRefs.bgTranslateX.setValue(0);
        const loopAnim = Animated.loop(
            Animated.timing(animRefs.bgTranslateX, {
                toValue: -scaleWidth(120),
                duration: 40000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        loopAnim.start();
        return () => loopAnim.stop();
    }, [animRefs]);

    const checkForAppUpdate = useCallback(() => {
        inAppUpdatesRef.current.checkNeedsUpdate().then((result) => {
            if (result.shouldUpdate) {
                const updateOptions = Platform.OS === 'android'
                    ? { updateType: IAUUpdateKind.IMMEDIATE }
                    : {};
                inAppUpdatesRef.current.startUpdate(updateOptions);
            }
        }).catch(() => { });
    }, []);

    useEffect(() => {
        checkForAppUpdate();
    }, []);

    const triggerShake = useCallback(() => {
        animRefs.shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(animRefs.shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 3, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    }, [animRefs]);

    const animateAndNavigate = useCallback((screen) => {
        navigation.reset({ index: 0, routes: [{ name: screen }] });
    }, []);

    const handleDashboard = useCallback(async () => {
        await dispatch(getProjectList()).unwrap();
        Toast.show('Logged in successfully', Toast.SHORT);
        setLoader(false);
        const [onboard, skip] = await Promise.all([
            AsyncStorage.getItem('isOnboard'),
            AsyncStorage.getItem('skipped'),
        ]);
        const nextScreen = (skip === 'true' || onboard === 'true') ? 'MainScreen' : 'OnboardingScreen';
        animateAndNavigate(nextScreen);
    }, []);

    const handleLogin = useCallback(async (values) => {
        setLoader(true);
        try {
            await dispatch(loginUser(values)).unwrap();
            await handleDashboard();
        } catch (error) {
            setLoader(false);
            triggerShake();
            const message = typeof error === 'string' ? error : error?.detail;
            Toast.show(message === 'Unauthorized' ? 'Please check the credentials' : 'Login failed, please try again', Toast.SHORT);
        }
    }, []);

    return (
        <View style={styles.backgroundImage}>
            <Animated.Image source={IMAGES.bgImage} blurRadius={1} resizeMode="repeat" style={styles.bgImageAbsolute} />
            <StatusBar backgroundColor="transparent" translucent />
            <View style={styles.insideContainer}>
                <Animated.View style={[styles.bgContainer, { transform: [{ translateX: animRefs.shakeAnim }] }]}>
                    <Animated.View style={styles.centerAlign}>
                        <Image source={IMAGES.whiteLogo} style={styles.logoImage} resizeMode="contain" />
                    </Animated.View>
                    <KeyboardAvoidingView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        <Animated.View style={[{ opacity: animRefs.fadeAnim }, styles.containView]}>
                            <Text style={styles.title}>{"Let's Login to Your Account First!"}</Text>
                            <Formik
                                initialValues={{ username: '', password: '' }}
                                validationSchema={Yup.object({
                                    username: Yup.string().min(10, 'Minimum 10 characters').required('Enter the Email address'),
                                    password: Yup.string().min(8, 'Minimum 8 characters').required('Enter the Password'),
                                })}
                                onSubmit={(values, { setSubmitting }) => {
                                    handleLogin(values).finally(() => setSubmitting(false));
                                }}
                            >
                                {({ handleChange, handleSubmit, values, errors, validateForm }) => {
                                    const isFormFilled = values.username.trim().length > 0 && values.password.trim().length > 0;

                                    const onSwipeAttempt = async () => {
                                        const formErrors = await validateForm();
                                        if (Object.keys(formErrors).length > 0) {
                                            triggerShake();
                                            return;
                                        }
                                        handleSubmit();
                                    };

                                    return (
                                        <Animated.View style={{ transform: [{ translateY: animRefs.formAnim }] }}>
                                            <FormField
                                                label="Username"
                                                value={values.username}
                                                onChangeText={handleChange('username')}
                                                placeholder="Enter your username"
                                                error={errors.username}
                                                inputTestID="login-username-input"
                                                toggleA11yLabel="toggle-username-icon"
                                            />
                                            <FormField
                                                label="Password"
                                                value={values.password}
                                                onChangeText={handleChange('password')}
                                                placeholder="Enter your Password"
                                                secureTextEntry={secure}
                                                toggleSecure={() => setSecure((prev) => !prev)}
                                                error={errors.password}
                                                inputTestID="login-password-input"
                                                toggleA11yLabel="toggle-password-visibility"
                                                IconComponent={secure ? EyeOff : Eye}
                                            />
                                            <View style={styles.verifyContainer}>
                                                <SwipeButton text="Swipe to Login" onSwipeSuccess={onSwipeAttempt} disabled={!isFormFilled || loader} />
                                            </View>
                                        </Animated.View>
                                    );
                                }}
                            </Formik>
                        </Animated.View>
                        <View style={styles.loaderWrapper}>
                            {loader && <CustomLoader loader={IMAGES.LoaderAnimation} />}
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </View>
    );
};

export default Login;