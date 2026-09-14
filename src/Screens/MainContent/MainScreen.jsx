import React, { useState, useCallback } from 'react';
import { View, BackHandler, Dimensions, Platform, StatusBar, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import CustomHeader from '../../Components/CustomHeader';
import { scaleHeight } from '../../Constants/dynamicSize';
import { IMAGES } from '../../Constants/Images';
import { COLORS } from '../../Constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPlotly from '../../Components/CustomPlotly';

const { width } = Dimensions.get('window');
const buttonWidth = 50;
const buttonHeight = 50;
const chartWidth = width - 32;
const chartHeight = 260;

const DragAndDropCard = ({ onPress }) => {
    return (
        <View style={[styles.floatingButton, { position: 'absolute', width: buttonWidth, height: buttonHeight }]}>
            <FastImage source={IMAGES.bot} style={styles.bot} resizeMode="contain" onTouchEnd={onPress} />
        </View>
    );
};

const dashboardCharts = [
    { id: 'dash1', title: 'Energy Consumption', data: [{ x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: [20, 35, 28, 42, 30], type: 'bar', marker: { color: '#4C9AFF' } }] },
    { id: 'dash2', title: 'Water Usage', data: [{ x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: [12, 18, 15, 22, 19], type: 'scatter', mode: 'lines+markers', line: { color: '#00B8D9' } }] },
    { id: 'dash3', title: 'Emission Split', data: [{ values: [35, 25, 20, 20], labels: ['Scope 1', 'Scope 2', 'Scope 3', 'Other'], type: 'pie' }] },
    { id: 'dash4', title: 'Waste Generated', data: [{ x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [8, 6, 9, 5], type: 'bar', marker: { color: '#FF8B00' } }] },
    { id: 'dash5', title: 'Renewable Share', data: [{ x: ['2021', '2022', '2023', '2024'], y: [15, 22, 30, 41], type: 'scatter', mode: 'lines', line: { color: '#36B37E' } }] },
    { id: 'dash6', title: 'Safety Incidents', data: [{ x: ['Jan', 'Feb', 'Mar', 'Apr'], y: [3, 1, 2, 0], type: 'bar', marker: { color: '#FF5630' } }] },
];

const summaryCharts = [
    { id: 'sum1', title: 'Total Emissions', data: [{ x: ['2021', '2022', '2023', '2024'], y: [1200, 1100, 950, 800], type: 'bar', marker: { color: '#6554C0' } }] },
    { id: 'sum2', title: 'Cost Savings', data: [{ x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: [5000, 7000, 6500, 8000, 9200], type: 'scatter', mode: 'lines+markers', line: { color: '#00875A' } }] },
    { id: 'sum3', title: 'Resource Allocation', data: [{ values: [40, 30, 30], labels: ['Manufacturing', 'Logistics', 'Admin'], type: 'pie' }] },
    { id: 'sum4', title: 'Compliance Score', data: [{ x: ['Site A', 'Site B', 'Site C', 'Site D'], y: [85, 92, 78, 88], type: 'bar', marker: { color: '#0052CC' } }] },
    { id: 'sum5', title: 'Audit Trends', data: [{ x: ['2021', '2022', '2023', '2024'], y: [12, 9, 7, 4], type: 'scatter', mode: 'lines', line: { color: '#DE350B' } }] },
    { id: 'sum6', title: 'Training Completion', data: [{ x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [60, 75, 82, 95], type: 'bar', marker: { color: '#00A3BF' } }] },
];

const chartConfig = {
    Dashboard: dashboardCharts,
    Summary: summaryCharts,
};

const layoutFor = title => ({
    title,
    width: chartWidth,
    height: chartHeight,
    margin: { l: 40, r: 20, t: 40, b: 40 },
    paper_bgcolor: COLORS.WHITE,
    plot_bgcolor: COLORS.WHITE,
});

const MainScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const pageName = useSelector(state => state.authSlice.pageName);
    const [loader, setLoader] = useState(false);

    const handleNavigation = useCallback(() => {
        setLoader(true);
        setTimeout(() => {
            setLoader(false);
            navigation.navigate('ChatScreen');
        }, 750);
    }, [navigation]);

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

    const charts = chartConfig[pageName] || dashboardCharts;

    return (
        <View style={styles.chart_container}>
            <StatusBar backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={{ backgroundColor: COLORS.NEW_HEADER, height: Platform.OS === 'ios' ? 40 : scaleHeight(40) }} edges={['top']} />
            <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
                <CustomHeader title={pageName || 'Main'} navigation={navigation} icon="menu" />
                
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                    {charts.map(chart => (
                        
                        <React.Fragment key={chart.id}>
                            <CustomPlotly
                                data={chart.data}
                                layout={layoutFor(chart.title)}
                            />
                        </React.Fragment>
                    ))}
                </ScrollView>
            </View>
            <DragAndDropCard onPress={handleNavigation} />
        </View>
    );
};

export default MainScreen;