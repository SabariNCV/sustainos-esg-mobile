import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, Animated, StatusBar, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { onboardingStyles as styles, DOT_SIZE } from './styles';
import { IMAGES } from '../../Constants/Images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        image: IMAGES.onboard1,
        title: 'Track Every Project',
        description: 'Stay on top of all your projects in one place with real-time updates and insights.',
    },
    {
        id: '2',
        image: IMAGES.onboard2,
        title: 'Collaborate Seamlessly',
        description: 'Bring your team together and get work done faster with built-in collaboration tools.',
    },
    {
        id: '3',
        image: IMAGES.onboard3,
        title: 'Achieve Your Goals',
        description: 'Set milestones, track progress and celebrate every win along the way.',
    },
];

const OnboardingSlide = ({ item, containerWidth }) => (
    <View style={[styles.slide, { width: containerWidth }]}>
        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
    </View>
);

OnboardingSlide.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        image: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    containerWidth: PropTypes.number.isRequired,
};

const OnboardingDots = ({ scrollX, containerWidth, count }) => (
    <View style={styles.dotsContainer}>
        {Array.from({ length: count }).map((_, index) => {
            const inputRange = [
                (index - 1) * containerWidth,
                index * containerWidth,
                (index + 1) * containerWidth,
            ];
            const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [DOT_SIZE, DOT_SIZE * 2.5, DOT_SIZE],
                extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
            });
            return (
                <Animated.View
                    key={`dot-${index.toString()}`}
                    style={[styles.dot, { width: dotWidth, opacity }]}
                />
            );
        })}
    </View>
);

OnboardingDots.propTypes = {
    scrollX: PropTypes.instanceOf(Animated.Value).isRequired,
    containerWidth: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
};

const OnboardingScreen = () => {
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerWidth = Math.min(SCREEN_WIDTH - 40, 450) - 32;

    const completeOnboarding = useCallback(async () => {
        try {
            await AsyncStorage.setItem('isOnboard', 'true');
        } catch (error) {
            await AsyncStorage.setItem('isOnboard', 'true');
        } finally {
            navigation.reset({ index: 0, routes: [{ name: 'MainScreen' }] });
        }
    }, []);

    const goToNext = useCallback(() => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            return;
        }
        completeOnboarding();
    }, [currentIndex]);

    const onMomentumScrollEnd = useCallback((e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
        setCurrentIndex(index);
    }, [containerWidth]);

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    useEffect(() => {
        const checkOnboardStatus = async () => {
            const onboard = await AsyncStorage.getItem('isOnboard')
            if (onboard === 'true') {
                navigation.reset({ index: 0, routes: [{ name: 'MainScreen' }] });
            }
        };
        checkOnboardStatus();
    }, []);

    const isLastSlide = currentIndex === SLIDES.length - 1;

    return (
        <View style={styles.backgroundImage}>
            <Animated.Image source={IMAGES.bgImage} blurRadius={1} resizeMode="repeat" style={styles.bgImageAbsolute} />
            <StatusBar backgroundColor="transparent" translucent />
            <View style={styles.insideContainer}>
                <View style={styles.bgContainer}>
                    <View style={styles.skipRow}>
                        {!isLastSlide && (
                            <TouchableOpacity onPress={completeOnboarding} accessibilityLabel="skip-onboarding">
                                <Text style={styles.skipText}>{"Skip"}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <FlatList
                        ref={flatListRef}
                        data={SLIDES}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <OnboardingSlide item={item} containerWidth={containerWidth} />
                        )}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        onScroll={onScroll}
                        onMomentumScrollEnd={onMomentumScrollEnd}
                        scrollEventThrottle={16}
                        snapToInterval={containerWidth}
                        decelerationRate="fast"
                        getItemLayout={(_, index) => ({
                            length: containerWidth,
                            offset: containerWidth * index,
                            index,
                        })}
                    />
                    <OnboardingDots scrollX={scrollX} containerWidth={containerWidth} count={SLIDES.length} />
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.nextButton} onPress={goToNext} accessibilityLabel={isLastSlide ? 'get-started' : 'next-slide'} >
                            <Text style={styles.nextButtonText}>
                                {isLastSlide ? 'Get Started' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default OnboardingScreen;