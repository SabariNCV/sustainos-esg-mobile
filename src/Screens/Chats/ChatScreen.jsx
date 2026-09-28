import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { View, TouchableOpacity, Image, TextInput, Text, StatusBar, Platform, FlatList, ImageBackground, KeyboardAvoidingView, Keyboard, BackHandler } from 'react-native';
import moment from 'moment';
import { useSelector } from 'react-redux';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import * as Animatable from 'react-native-animatable';
import FastImage from 'react-native-fast-image';
import SoundPlayer from 'react-native-sound-player';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { TypingAnimation } from 'react-native-typing-animation';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { IMAGES } from "../../Constants/Images";
import { COLORS } from "../../Constants/Colors";
import { scaleHeight, scaleWidth } from '../../Constants/dynamicSize';
import CustomHeader from '../../Components/CustomHeader';
import Chats from './Chats';
import { styles } from './styles';
import { fetchingMessages, ImageSource, layout } from './ChatConst';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ navigation, route }) => {
    const textValue = useSelector(state => state.mainSlice.chatMessage);
    const todayDate = moment().format('DD MMM-YYYY');
    const flatListRef = useRef(null);
    const [showText, setShowText] = useState(false)
    const [index, setIndex] = useState(0);
    const [searchshow, setsearchshow] = useState(false)
    const [showSearch, setshowSearch] = useState(false)
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [chatArray, setChatArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVideoVisible, setIsModalVideoVisible] = useState(false);
    const cameraRef = useRef(null);
    const device = useCameraDevice('back');
    const [recording, setRecording] = useState(false);
    const [showrecording, setShowRecording] = useState(false);
    const [matches, setMatches] = React.useState([]);
    const [startSearch, setStartSearch] = React.useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = React.useState(null);
    const [videoUri, setVideoUri] = useState(null);
    const [searchText, setSearchText] = useState('');
    const lastRecognizedTextRef = useRef("");
    const isFocused = useIsFocused();

    useSpeechRecognitionEvent("start", () => {
        setIsRecording(true);
    });

    useSpeechRecognitionEvent("end", () => {
        setIsRecording(false);
        if (lastRecognizedTextRef.current.trim() !== "") {
            setResult(lastRecognizedTextRef.current);
            generateResponse(lastRecognizedTextRef.current);
            lastRecognizedTextRef.current = "";
        }
    });

    useSpeechRecognitionEvent("result", (event) => {
        if (event.results && event.results.length > 0) {
            lastRecognizedTextRef.current = event.results[0]?.transcript ?? "";
        }
    });

    useSpeechRecognitionEvent("error", (event) => {
        setError(event.error);
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
        setChatArray([{ type: 'incoming', text: 'How may I help you today?' }]);
    }, [navigation]);

    useEffect(() => {
        if (textValue !== null) {
            setResult(textValue);
            generateResponse(textValue)
        }
    }, [textValue])

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            if (flatListRef.current && chatArray && chatArray.length > 0) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [chatArray]);

    const RASA_NLU_URL = "https://SustainOS.ai:9012/services/generate-response/";

    const generateResponse = async (incomingMessage, imageurl) => {
        Speech.stop();
        Keyboard.dismiss()
        if (incomingMessage === "") {
            return
        }
        setMatches([])
        setsearchshow(false)
        const userMessage = incomingMessage.trim();
        setChatArray(prevChatArray => [...prevChatArray, { text: userMessage, type: "outgoing" }]);
        setResult('');
        setIndex(2)
        try {
            const timer = setTimeout(() => {
                handleTimeout();
            }, 10000);
            setLoading(true)
            const response = await fetch(RASA_NLU_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: incomingMessage
                })
            });
            setIndex(3)
            const data = await response.json();
            clearTimeout(timer);
            const timestamps = data?.chart_data ? data?.chart_data?.time_stamp.map(time => new Date(time)) : [];
            const scopeValues = data?.chart_data ? data?.chart_data["Scope 1"] : [];
            const trace = {
                x: timestamps,
                y: scopeValues,
                mode: "lines",
                name: "Scope 1",
                line: {
                    dash: 'solid',
                    width: 1.5,
                    color: '#C43E1C',
                },
            };
            const CustomChart = {
                data: [trace],
                layout: layout
            };
            setIndex(4)
            const newMessages = [
                (data.alerts) ? { text: data.message?.replace(/[*_]/g, ''), events_data: data.alerts, type: 'incoming' } :
                    (data.chart_data) ? { text: data.message?.replace(/[*_]/g, ''), chart: CustomChart, type: 'incoming' } :
                        (data.comparison_values) ? { text: data.message?.join(". ")?.replace(/[*_]/g, ''), tables: data.comparison_values, type: 'incoming' } :
                            { text: data.message?.replace(/[*_]/g, ''), type: 'incoming' }
            ].filter(Boolean);

            const processedText = processTextForTTS(newMessages[0].text);
            Speech.speak(processedText, {
                onStart: () => console.log('TTS Started'),
                onDone: () => console.log('TTS Finished'),
                onError: (err) => console.error('TTS Error:', err),
            });
            await setChatArray(prevChatArray => [...prevChatArray, ...newMessages]);
            setLoading(false)
            data?.custom?.chart ? setIndex(3) : setIndex(5)
            return data;
        } catch (error) {
            setIndex(6)
            console.error("Error fetching response from Rasa NLU:", error);
            setChatArray(prevChatArray => [...prevChatArray, { text: "Oops! Something went wrong. Please try again!", type: 'incoming' }]);
            return [{ text: "Oops! Something went wrong. Please try again!" }];
        }
    };

    const handleTimeout = () => {
        const randomIndex = Math.floor(Math.random() * fetchingMessages.length);
        const message = fetchingMessages[randomIndex];
        setChatArray(prevChatArray => [...prevChatArray, { text: message, type: 'incoming' }]);
    };

    function processTextForTTS(text) {
        text = text.replace(/\b[A-Z]{2,}\b/g, (match) => {
            return match.split('').join(' ');
        });
        return text;
    }

    const renderItem = React.useCallback(({ item, index }) => (
        <Chats item={item} key={index} index={index} animation="flipInY" searchText={searchText} />
    ), [showText]);

    const renderLoading = () => {
        return (
            <Animatable.View>
                <View style={{ marginHorizontal: scaleWidth(20), marginVertical: scaleHeight(10) }}>
                    <View style={styles.row} key={index}>
                        <View style={styles.botView}>
                            <Image source={IMAGES.bot} style={styles.genie} resizeMode='contain' />
                        </View>
                        <View style={{ maxWidth: '87%', minWidth: '40%' }}>
                            <View style={[styles.bubblewrapperLeftStyle, { width: scaleWidth(60) }]}>
                                <TypingAnimation
                                    dotColor={COLORS.WHITE}
                                    dotMargin={3}
                                    dotAmplitude={3}
                                    dotSpeed={0.15}
                                    dotRadius={2.5}
                                    dotX={12}
                                    dotY={6}
                                    style={{
                                        height: scaleHeight(40),
                                        top: scaleHeight(8),
                                        width: scaleWidth(60),
                                        left: scaleWidth(10)
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Animatable.View>
        )
    }

    const startRecording = async () => {
        setshowSearch(false)
        Keyboard.dismiss()
        try {
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                setError("Speech recognition permission not granted");
                return;
            }
            setIsRecording(true)
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                continuous: false,
            });
        } catch (err) {
            setError(err)
        }
    }

    const stopRecording = async () => {
        try {
            ExpoSpeechRecognitionModule.stop()
        } catch (err) {
            setError(err)
        }
    }

    const handleSave = (result) => {
        setResult(result.value[0]);
        generateResponse(result.value[0]);
    }

    useEffect(() => {
        if (isRecording === false) {
            generateResponse(result)
        }
    }, [isRecording])

    useEffect(() => {
        setChatArray(prevChatArray => [
            ...prevChatArray,
            { text: '', type: 'video', video: videoUri }
        ]);
    }, [videoUri]);

    const startVideoRecording = async () => {
        if (cameraRef.current) {
            try {
                setRecording(true);
                cameraRef.current.startRecording({
                    onRecordingFinished: async (video) => {
                        setVideoUri(video.path);
                        setRecording(false);
                        try {
                            await CameraRoll.save(video.path, { type: 'video' });
                        } catch (err) {
                            console.error(err);
                        }
                    },
                    onRecordingError: (error) => {
                        console.error(error);
                        setRecording(false);
                    },
                });
            } catch (error) {
                console.error(error);
                setRecording(false);
            }
        }
    };

    const stopVideoRecording = async () => {
        if (cameraRef.current) {
            try {
                await cameraRef.current.stopRecording();
            } catch (error) {
                console.error(error);
            }
        }
        setShowRecording(false)
    };

    const addImageMessage = (imageUri) => {
        setChatArray(prevChatArray => [
            ...prevChatArray,
            { text: '', type: 'outgoing', image: imageUri }
        ]);
    };

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

    const handleCloseALl = () => {
        setshowSearch(false);
        setIsModalVisible(false);
        setIsModalVideoVisible(false);
        setsearchshow(false);
        setMatches([])
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.NEW_HEADER }} edges={["top"]}>
            <StatusBar backgroundColor={COLORS.HEADER} translucent={false} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#E5E5E5' }}>
                <View style={{ flex: 1, backgroundColor: '#E5E5E5' }}>
                    <ImageBackground source={IMAGES.chatbg} style={{ width: '100%', height: '100%' }}>
                        <CustomHeader title={'Hello'} navigation={navigation} icon={'leftarrow'} goback={
                            () => { Speech.stop(), navigation.goBack() }
                        } />
                        <View style={{ marginBottom: scaleHeight(250) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', marginLeft: scaleWidth(25) }}>
                                    <View style={styles.box}>
                                        <Text style={styles.timeStyle}>{todayDate}</Text>
                                    </View>
                                </View>
                            </View>
                            <FlatList
                                ref={flatListRef}
                                data={chatArray}
                                extraData={searchshow}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                ListFooterComponent={loading ? renderLoading() : null}
                            />
                        </View>
                        {showrecording && device &&
                            <View style={{ flex: 1 }}>
                                <Camera
                                    ref={cameraRef}
                                    style={styles.camera}
                                    device={device}
                                    isActive={true}
                                    video={true}
                                    audio={true}
                                />
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={recording ? stopVideoRecording : startVideoRecording}
                                        style={[styles.recordButton, recording && styles.stopButton]}
                                    >
                                        <Text style={styles.buttonText}>{recording ? 'Stop' : 'Record'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        <View style={styles.bottomContainer}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <FastImage style={[styles.animationIcon, { height: ImageSource[index] === IMAGES.animation7 ? scaleHeight(100) : scaleHeight(100) }]} resizeMode='contain' source={ImageSource[index]} />
                                {isRecording ?
                                    <View style={styles.centerMicView}>
                                        <FastImage source={IMAGES.animatedMic} style={styles.yellowMic} resizeMode='contain' />
                                    </View>
                                    :
                                    <View style={[styles.textInputView, { borderColor: (!isRecording && result?.length > 0) ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]}>
                                        <TextInput
                                            multiline={true}
                                            placeholder="Write your query"
                                            style={styles.queryPlaceHolder}
                                            placeholderTextColor={COLORS.BLACK}
                                            value={result}
                                            onFocus={() => handleCloseALl()}
                                            onChangeText={text => { setResult(text), setshowSearch(false) }}
                                            scrollEnabled={false}
                                        />
                                    </View>}
                                <View style={styles.iconView}>
                                    <View style={styles.galleryButton}>
                                        <TouchableOpacity style={[styles.micView, { borderColor: isRecording ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]} onLongPress={startRecording} onPressOut={stopRecording}>
                                            <Image style={[styles.sendIcon, { tintColor: COLORS.BLUE }]} resizeMode='contain' source={isRecording ? IMAGES.enablemic : IMAGES.mic} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.micView, { borderColor: (!isRecording && result?.length > 0) ? COLORS.BORDER_CHATCOLOR : COLORS.WHITE }]} onPress={() => { generateResponse(result) }}>
                                            <Image style={[styles.sendIcon]} resizeMode='contain' source={IMAGES.send} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground >
                </View >
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;