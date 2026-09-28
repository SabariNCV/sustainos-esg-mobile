import React, { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { View, TouchableOpacity, Image, TextInput, Text, StatusBar, Platform, FlatList, ImageBackground, KeyboardAvoidingView, Keyboard, BackHandler, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useSelector } from 'react-redux';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import FastImage from 'react-native-fast-image';
import SoundPlayer from 'react-native-sound-player';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { TypingAnimation } from 'react-native-typing-animation';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES } from '../../Constants/Images';
import { COLORS } from '../../Constants/Colors';
import { scaleHeight, scaleWidth } from '../../Constants/dynamicSize';
import CustomHeader from '../../Components/CustomHeader';
import Chats from './Chats';
import { styles } from './styles';
import { fetchingMessages, ImageSource, layout } from './ChatConst';

const RASA_NLU_URL = 'https://SustainOS.ai:9012/services/generate-response/';
const REQUEST_TIMEOUT_MS = 10000;
const SCROLL_DELAY_MS = 1000;
const GREETING = 'How may I help you today?';
const ERROR_TEXT = 'Oops! Something went wrong. Please try again!';
const ANIMATION = { IDLE: 0, SENDING: 2, RECEIVED: 3, DONE: 5, FAILED: 6 };

let messageCounter = 0;
const createMessage = (fields) => {
    messageCounter += 1;
    return { id: `msg-${messageCounter}`, ...fields };
};

const cleanText = (text) => text?.replaceAll(/[*_]/g, '');

const processTextForTTS = (text) => text.replaceAll(/\b[A-Z]{2,}\b/g, (match) => [...match].join(' '));

const keyExtractor = (item) => item.id;

const createFetchingMessage = () => {
    const randomIndex = Math.floor(Math.random() * fetchingMessages.length);
    return createMessage({ text: fetchingMessages[randomIndex], type: 'incoming' });
};

const buildChart = (chartData) => ({
    data: [
        {
            x: chartData.time_stamp.map((time) => new Date(time)),
            y: chartData['Scope 1'],
            mode: 'lines',
            name: 'Scope 1',
            line: { dash: 'solid', width: 1.5, color: '#C43E1C' },
        },
    ],
    layout,
});

const buildBotMessage = (data) => {
    const type = 'incoming';
    if (data.alerts) {
        return createMessage({ text: cleanText(data.message), events_data: data.alerts, type });
    }
    if (data.chart_data) {
        return createMessage({ text: cleanText(data.message), chart: buildChart(data.chart_data), type });
    }
    if (data.comparison_values) {
        return createMessage({ text: cleanText(data.message?.join('. ')), tables: data.comparison_values, type });
    }
    return createMessage({ text: cleanText(data.message), type });
};

const saveVideoToRoll = async (path) => {
    try {
        await CameraRoll.save(path, { type: 'video' });
    } catch (err) {
        console.error(err);
    }
};

const LoadingBubble = () => (
    <View style={localStyles.loadingWrapper}>
        <View style={styles.row}>
            <View style={styles.botView}>
                <Image source={IMAGES.bot} style={styles.genie} resizeMode="contain" />
            </View>
            <View style={localStyles.loadingContent}>
                <View style={[styles.bubblewrapperLeftStyle, localStyles.loadingBubble]}>
                    <TypingAnimation
                        dotColor={COLORS.WHITE}
                        dotMargin={3}
                        dotAmplitude={3}
                        dotSpeed={0.15}
                        dotRadius={2.5}
                        dotX={12}
                        dotY={6}
                        style={localStyles.typing}
                    />
                </View>
            </View>
        </View>
    </View>
);

const renderItem = ({ item, index }) => (
    <Chats item={item} index={index} animation="flipInY" searchText="" />
);

const ChatScreen = ({ navigation }) => {
    const textValue = useSelector((state) => state.mainSlice.chatMessage);
    const todayDate = useMemo(() => moment().format('DD MMM-YYYY'), []);
    const flatListRef = useRef(null);
    const cameraRef = useRef(null);
    const lastRecognizedTextRef = useRef('');
    const device = useCameraDevice('back');
    const isFocused = useIsFocused();
    const [animationIndex, setAnimationIndex] = useState(ANIMATION.IDLE);
    const [result, setResult] = useState('');
    const [chatArray, setChatArray] = useState(() => [createMessage({ type: 'incoming', text: GREETING })]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(false);
    const [showRecording, setShowRecording] = useState(false);
    const [videoUri, setVideoUri] = useState(null);

    const hasText = !isRecording && result.length > 0;

    const generateResponse = useCallback(async (incomingMessage) => {
        Speech.stop();
        Keyboard.dismiss();
        const userMessage = incomingMessage?.trim();
        if (!userMessage) return;

        setChatArray((prev) => [...prev, createMessage({ text: userMessage, type: 'outgoing' })]);
        setResult('');
        setAnimationIndex(ANIMATION.SENDING);
        setLoading(true);
        const timer = setTimeout(() => {
            setChatArray((prev) => [...prev, createFetchingMessage()]);
        }, REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(RASA_NLU_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage }),
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            const botMessage = buildBotMessage(data);
            Speech.speak(processTextForTTS(botMessage.text ?? ''), {
                onError: (err) => console.error('TTS Error:', err),
            });
            setChatArray((prev) => [...prev, botMessage]);
            setAnimationIndex(data?.custom?.chart ? ANIMATION.RECEIVED : ANIMATION.DONE);
        } catch (err) {
            console.error('Error fetching response from Rasa NLU:', err);
            setAnimationIndex(ANIMATION.FAILED);
            setChatArray((prev) => [...prev, createMessage({ text: ERROR_TEXT, type: 'incoming' })]);
        } finally {
            clearTimeout(timer);
            setLoading(false);
        }
    }, []);

    useSpeechRecognitionEvent('start', () => {
        setIsRecording(true);
    });

    useSpeechRecognitionEvent('end', () => {
        setIsRecording(false);
        const recognizedText = lastRecognizedTextRef.current;
        lastRecognizedTextRef.current = '';
        if (recognizedText.trim() !== '') {
            generateResponse(recognizedText);
        }
    });

    useSpeechRecognitionEvent('result', (event) => {
        if (event.results?.length > 0) {
            lastRecognizedTextRef.current = event.results[0]?.transcript ?? '';
        }
    });

    useSpeechRecognitionEvent('error', (event) => {
        console.error('Speech recognition error:', event.error);
    });

    useEffect(() => {
        if (!isFocused) {
            Speech.stop();
        }
    }, [isFocused]);

    useEffect(() => {
        SoundPlayer.setVolume(1);
    }, []);

    useEffect(() => {
        if (textValue !== null) {
            generateResponse(textValue);
        }
    }, [textValue, generateResponse]);

    useEffect(() => {
        if (!videoUri) return;
        setChatArray((prev) => [...prev, createMessage({ text: '', type: 'video', video: videoUri })]);
    }, [videoUri]);

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            if (chatArray.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
            }
        }, SCROLL_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [chatArray]);

    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
                BackHandler.exitApp();
                return true;
            });
            return () => subscription.remove();
        }, []),
    );

    const startRecording = async () => {
        Keyboard.dismiss();
        try {
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                console.error('Speech recognition permission not granted');
                return;
            }
            setIsRecording(true);
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                continuous: false,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const stopRecording = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
        } catch (err) {
            console.error(err);
        }
    };

    const startVideoRecording = () => {
        if (!cameraRef.current) return;
        try {
            setRecording(true);
            cameraRef.current.startRecording({
                onRecordingFinished: async (video) => {
                    setVideoUri(video.path);
                    setRecording(false);
                    await saveVideoToRoll(video.path);
                },
                onRecordingError: (err) => {
                    console.error(err);
                    setRecording(false);
                },
            });
        } catch (err) {
            console.error(err);
            setRecording(false);
        }
    };

    const stopVideoRecording = async () => {
        try {
            await cameraRef.current?.stopRecording();
        } catch (err) {
            console.error(err);
        }
        setShowRecording(false);
    };

    const handleGoBack = () => {
        Speech.stop();
        navigation.goBack();
    };

    const handleSend = () => generateResponse(result);

    return (
        <SafeAreaView style={localStyles.safeArea} edges={['top']}>
            <StatusBar backgroundColor={COLORS.HEADER} translucent={false} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={localStyles.keyboardView}>
                <View style={localStyles.keyboardView}>
                    <ImageBackground source={IMAGES.chatbg} style={localStyles.background}>
                        <CustomHeader title="Hello" navigation={navigation} icon="leftarrow" goback={handleGoBack} />
                        <View style={localStyles.listWrapper}>
                            <View style={localStyles.dateRow}>
                                <View style={localStyles.dateInner}>
                                    <View style={styles.box}>
                                        <Text style={styles.timeStyle}>{todayDate}</Text>
                                    </View>
                                </View>
                            </View>
                            <FlatList
                                ref={flatListRef}
                                data={chatArray}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderItem}
                                keyExtractor={keyExtractor}
                                ListFooterComponent={loading ? <LoadingBubble /> : null}
                            />
                        </View>
                        {showRecording && device && (
                            <View style={localStyles.cameraWrapper}>
                                <Camera ref={cameraRef} style={styles.camera} device={device} isActive video audio />
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={recording ? stopVideoRecording : startVideoRecording}
                                        style={[styles.recordButton, recording && styles.stopButton]}
                                    >
                                        <Text style={styles.buttonText}>{recording ? 'Stop' : 'Record'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <View style={styles.bottomContainer}>
                            <View style={localStyles.inputRow}>
                                <FastImage
                                    style={[styles.animationIcon, localStyles.animationIcon]}
                                    resizeMode="contain"
                                    source={ImageSource[animationIndex]}
                                />
                                {isRecording ? (
                                    <View style={styles.centerMicView}>
                                        <FastImage source={IMAGES.animatedMic} style={styles.yellowMic} resizeMode="contain" />
                                    </View>
                                ) : (
                                    <View style={[styles.textInputView, { borderColor: hasText ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]}>
                                        <TextInput
                                            multiline
                                            placeholder="Write your query"
                                            style={styles.queryPlaceHolder}
                                            placeholderTextColor={COLORS.BLACK}
                                            value={result}
                                            onChangeText={setResult}
                                            scrollEnabled={false}
                                        />
                                    </View>
                                )}
                                <View style={styles.iconView}>
                                    <View style={styles.galleryButton}>
                                        <TouchableOpacity
                                            style={[styles.micView, { borderColor: isRecording ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]}
                                            onLongPress={startRecording}
                                            onPressOut={stopRecording}
                                        >
                                            <Image
                                                style={[styles.sendIcon, localStyles.micIcon]}
                                                resizeMode="contain"
                                                source={isRecording ? IMAGES.enablemic : IMAGES.mic}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.micView, { borderColor: hasText ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]}
                                            onPress={handleSend}
                                        >
                                            <Image style={styles.sendIcon} resizeMode="contain" source={IMAGES.send} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

ChatScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

const localStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.NEW_HEADER },
    keyboardView: { flex: 1, backgroundColor: '#E5E5E5' },
    background: { width: '100%', height: '100%' },
    listWrapper: { marginBottom: scaleHeight(250) },
    dateRow: { flexDirection: 'row', justifyContent: 'center' },
    dateInner: { flex: 1, justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', marginLeft: scaleWidth(25) },
    cameraWrapper: { flex: 1 },
    inputRow: { flex: 1, flexDirection: 'row' },
    animationIcon: { height: scaleHeight(100) },
    micIcon: { tintColor: COLORS.BLUE },
    loadingWrapper: { marginHorizontal: scaleWidth(20), marginVertical: scaleHeight(10) },
    loadingContent: { maxWidth: '87%', minWidth: '40%' },
    loadingBubble: { width: scaleWidth(60) },
    typing: { height: scaleHeight(40), top: scaleHeight(8), width: scaleWidth(60), left: scaleWidth(10) },
});

export default ChatScreen;