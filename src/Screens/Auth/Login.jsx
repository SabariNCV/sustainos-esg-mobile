import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, StatusBar, Text, TouchableOpacity, BackHandler, Animated, Easing, KeyboardAvoidingView, Image, Platform } from 'react-native';
import * as Yup from 'yup';
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from 'lucide-react-native';
import { Formik } from 'formik';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';
import { loginStyles as styles } from './styles';
import { COLORS } from '../../Constants/Colors';
import { scaleWidth } from '../../Constants/dynamicSize';
import { IMAGES } from '../../Constants/Images';
import CustomLoader from '../../Components/CustomLoader';
import { userDetails } from '../../Redux/ReduxSlice/authSlice';
import PropTypes from 'prop-types';

const container_height = (60);

const LoginButton = ({ onPress, text = 'Login', disabled = false }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={{
            height: container_height,
            borderRadius: container_height / 2,
            backgroundColor: disabled ? COLORS.GREY : COLORS.BUTTONGREEN,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            opacity: disabled ? 0.6 : 1,
        }}
    >
        <Text
            style={{
                color: COLORS.WHITE,
                fontSize: 16,
                fontWeight: '600',
                fontFamily: styles.loginText.fontFamily,
            }}
        >
            {text}
        </Text>
    </TouchableOpacity>
);

LoginButton.propTypes = {
    onPress: PropTypes.func,
    text: PropTypes.string,
    disabled: PropTypes.bool,
};
const FormField = ({ label, value, onChangeText, placeholder, IconComponent, secureTextEntry, toggleSecure, error, inputTestID, toggleA11yLabel }) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.subTitle, { color: COLORS.WHITE }]}>{label}</Text>
        <View style={[styles.textInput, { borderColor: error ? COLORS.RED : COLORS.BORDERCOLOR, backgroundColor: COLORS.WHITE }]}>
            <TextInput
                testID={inputTestID}
                style={[styles.input, { color: COLORS.BLACK }]}
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

const Login = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [secure, setSecure] = useState(true);
    const [loader, setLoader] = useState(false);
    const [inAppUpdates] = useState(() => new SpInAppUpdates(false));

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

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

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
            animate(animRefs.translateY, 0, 1000)
        ]).start();

        return () => Object.values(animRefs).forEach(anim => anim.stop?.());
    }, []);

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
    }, []);

    useEffect(() => {
        checkForAppUpdate();
    }, []);

    const checkForAppUpdate = () => {
        inAppUpdates.checkNeedsUpdate().then((result) => {
            if (result.shouldUpdate) {
                const updateOptions = Platform.OS === 'android'
                    ? { updateType: IAUUpdateKind.IMMEDIATE }
                    : {};
                inAppUpdates.startUpdate(updateOptions);
            }
        }).catch(() => { });
    };

    const triggerShake = () => {
        animRefs.shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(animRefs.shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 3, duration: 60, useNativeDriver: true }),
            Animated.timing(animRefs.shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = (values) => {
        setLoader(true);
        dispatch(userDetails({ key: "username", value: values.username }));
        return new Promise((resolve) => {
            setTimeout(() => {
                setLoader(false);
                Toast.show('Logged in successfully', Toast.SHORT);
                animateAndNavigate("MainScreen");
                resolve();
            }, 800);
        });
    };

    const animateAndNavigate = (screen) => {
        navigation.reset({ index: 0, routes: [{ name: screen }] });
    };

    return (
        <View style={styles.backgroundImage}>
            <Animated.Image source={IMAGES.bgImage} blurRadius={1} resizeMode='repeat' style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%', height: '100%', }} />
            <StatusBar backgroundColor="transparent" translucent={true} />
            <View style={styles.insideContainer}>
                <Animated.View style={[styles.bgContainer, { transform: [{ translateX: animRefs.shakeAnim }] }]}>
                    <Animated.View style={[styles.centerAlign]}>
                        <Image source={IMAGES.whiteLogo} style={[styles.logoImage]} resizeMode="contain" />
                    </Animated.View>
                    {/* FIX: added `behavior` so KeyboardAvoidingView actually
                        pushes the form up when the keyboard opens on iOS. */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                    >
                        <Animated.View style={[{ opacity: animRefs?.fadeAnim }, styles.containView]}>
                            <Text style={[styles.title, { color: COLORS.WHITE }]}>{"Let's Login to Your Account First!"}</Text>
                            <Formik initialValues={{ username: '', password: '' }}
                                validationSchema={Yup.object({
                                    username: Yup.string().min(4, 'Username 4 Characters').required('Enter the Username'),
                                    password: Yup.string().min(4, 'Minimum 4 Characters').required('Enter the Password'),
                                })}
                                onSubmit={(values, { setSubmitting }) => {
                                    handleLogin(values).finally(() => setSubmitting(false));
                                }}
                            >
                                {({ handleChange, handleBlur, handleSubmit, values, errors, validateForm }) => {
                                    const isFormFilled = values.username.trim().length > 0 && values.password.trim().length > 0;

                                    const onLoginPress = async () => {
                                        const formErrors = await validateForm();
                                        if (Object.keys(formErrors).length > 0) {
                                            triggerShake();
                                            return;
                                        }
                                        handleSubmit();
                                    };

                                    return (
                                        <Animated.View style={{ transform: [{ translateY: animRefs?.formAnim }] }}>
                                            <FormField
                                                label="Username"
                                                value={values.username}
                                                onChangeText={handleChange('username')}
                                                placeholder="Enter your username"
                                                secureTextEntry={false}
                                                toggleSecure={() => { }}
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
                                                toggleSecure={() => setSecure(!secure)}
                                                error={errors.password}
                                                inputTestID="login-password-input"
                                                toggleA11yLabel="toggle-password-visibility"
                                                IconComponent={secure ? EyeOff : Eye}
                                            />

                                            <View style={styles.verifyContainer}>
                                                <LoginButton
                                                    text="Login"
                                                    onPress={onLoginPress}
                                                    disabled={!isFormFilled || loader}
                                                />
                                            </View>
                                        </Animated.View>
                                    )
                                }}
                            </Formik>
                        </Animated.View>
                        <View style={{ marginVertical: '10%' }}>
                            {loader && <CustomLoader loader={IMAGES.LoaderAnimation} />}
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </View>
    )
}

export default Login;