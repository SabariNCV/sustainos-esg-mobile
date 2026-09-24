import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Table, Row, Rows } from 'react-native-table-component';
import CustomPlotly from '../../Components/CustomPlotly';
import { scaleHeight, scaleWidth } from '../../Constants/dynamicSize';
import { styles } from './styles';
import { IMAGES } from '../../Constants/Images';
import { COLORS } from '../../Constants/Colors';
import * as Animatable from 'react-native-animatable';

const Chats = ({ item, index, animation, searchText }) => {

    const highlightText = useCallback((text) => {
        if (!searchText) return <Text>{text}</Text>;

        const regex = new RegExp(`(${searchText})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            const isHighlighted = part.toLowerCase() === searchText.toLowerCase();
            return (
                <Text key={`${index}-${part}`} style={isHighlighted ? styles.highlight : null}>
                    {part}
                </Text>
            );
        });
    }, [searchText]);

    const tableHead = ['Company', 'Comparison Value'];
    const tableData = item?.tables && Object.entries(item?.tables).map(([company, value]) => [
        company,
        value.toLocaleString()
    ]);

    return (
        <Animatable.View animation={animation}>
            <View style={{ marginHorizontal: scaleWidth(20), marginVertical: scaleHeight(10) }}>
                {item.type === 'outgoing' && (
                    <View style={{ maxWidth: '82%', flex: 1, alignSelf: 'flex-end' }}>
                        <View style={styles.bubblewrapperRightStyle}>
                            <Text style={styles.bubbleRightTextStyle}>{highlightText(item.text)}</Text>
                        </View>
                    </View>
                )}

                {item.type === 'incoming' && (
                    <View style={styles.row} key={index}>
                        <View style={styles.botView}>
                            <Image source={IMAGES.bot} style={styles.genie} resizeMode="contain" />
                        </View>
                        <View style={{ maxWidth: '87%', minWidth: '40%' }}>
                            <View style={[styles.bubblewrapperLeftStyle, { backgroundColor: item.chart ? COLORS.NEW_BLUE : item?.events_data || item?.tables ? 'transparent' : COLORS.CHAT_GREEN }]}>
                                {item.chart ?
                                    <View style={{ height: scaleHeight(270), width: scaleWidth(300) }}>
                                        <Text style={styles.bubbleLeftTextStyle}>{highlightText(item.text)}</Text>
                                        <CustomPlotly
                                            data={item.chart?.data}
                                            layout={item.chart?.layout}
                                            config={{
                                                displayModeBar: false,
                                                scrollZoom: false,
                                                doubleClick: true,
                                                showTips: true,
                                            }}
                                        />
                                    </View>
                                    :
                                    <>
                                        {item?.tables ?
                                            <View style={{ width: scaleWidth(300), borderRadius: scaleWidth(5) }}>
                                                <View style={[styles.bubblewrapperLeftStyle]}>
                                                    <Text style={styles.bubbleLeftTextStyle}>{highlightText(item.text)}</Text>
                                                </View>
                                                <Table style={{ borderRadius: scaleWidth(10), marginVertical: scaleHeight(10) }} borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
                                                    <Row data={tableHead} style={{ backgroundColor: '#5B1245' }} textStyle={{ color: '#fff', padding: 10 }} />
                                                    <Rows
                                                        data={tableData}
                                                        style={{ backgroundColor: '#eaeff3' }}
                                                        textStyle={{ padding: 10 }}
                                                        flexArr={[1, 1]}
                                                    />
                                                </Table>
                                            </View>
                                            :
                                            <>
                                                {item?.events_data ?
                                                    <View style={{ width: scaleWidth(330) }}>
                                                        <View style={[styles.bubblewrapperLeftStyle]}>
                                                            <Text style={styles.bubbleLeftTextStyle}>{highlightText(item.text)}</Text>
                                                        </View>
                                                        {item?.events_data?.map((event, index) => (
                                                            <View key={index + 1}>
                                                                <TouchableOpacity style={styles.eventCard}>
                                                                    <View style={styles.titleView}>
                                                                        <Text style={styles.eventTitle}>{event?.description}</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleHeight(5) }}>
                                                                            <Icon name={"calendar-clock-outline"} type='material-community' size={18} color={COLORS.NEW_BLUE} style={{ marginLeft: scaleWidth(5) }} />
                                                                            <Text style={styles.cell}>
                                                                                {moment(event?.event_start).format('DD-MM-YYYY h:mm A')}
                                                                            </Text>
                                                                        </View>
                                                                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                                                            <Text style={{ marginHorizontal: scaleWidth(10), fontWeight: 'bold', fontSize: 22 }}>-</Text>
                                                                            <Text style={styles.cell}>
                                                                                {moment(event?.event_end).format('DD-MM-YY h:mm A')}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', marginVertical: scaleHeight(5) }}>
                                                                        <Text style={[styles.cell, { fontWeight: 'bold' }]}>Status: <Text style={{ fontWeight: '500' }}>{event.event_end}</Text></Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', marginVertical: scaleHeight(5) }}>
                                                                        <Text style={[styles.cell, { fontWeight: 'bold' }]}>Recommendation:</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', marginVertical: scaleHeight(5), marginBottom: scaleHeight(10) }}>
                                                                        {event?.recommendation.map((recommendation, index) => (
                                                                            <Text key={index} style={[styles.cell]}>•  {recommendation}</Text>
                                                                        ))}
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </View>
                                                    :
                                                    <Text style={styles.bubbleLeftTextStyle}>{highlightText(item.text)}</Text>
                                                }</>
                                        }
                                    </>}
                            </View>
                        </View>
                    </View>
                )}

                {item.type === 'weather' && (
                    <ImageBackground source={IMAGES.Sunny} style={styles.imgBackground}>
                        <View style={styles.degreeView}>
                            <Text style={styles.degreeText}>{item.weatherData?.current?.temp_c}°c</Text>
                            <Text style={styles.timeText}>{moment().format('HH:mm')}</Text>
                        </View>
                    </ImageBackground>
                )}

            </View>
        </Animatable.View>
    );
};
export default Chats;