import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    Linking,
    Dimensions,
    Switch,
    Animated,
    Alert,
    ScrollView,
    Platform
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../../../Constants/Colors';
import { normalizeFont, scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { IMAGES } from '../../../Constants/Images';
import { SVG_IMAGES } from '../../../Constants/svgimages';
import { FONTS } from '../../../Constants/Fonts';
import CustomHeader from '../../../Components/CustomHeader';
import CustomDropDown from '../../../Components/CustomDropDown';
import { Divider, Icon } from 'react-native-elements'
import { SvgXml } from 'react-native-svg';
import { WORDS } from '../../../Constants/terms';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
    chartDataFromserver,
    analyticalPageView
} from '../../../Redux/ReduxSlice/mainSlice';
import Navigator from '../../../Components/Navigator';
const { height } = Dimensions.get('screen');
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { styles } from './styles';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import ScatterChart from '../ScatterChart/ScatterChart';
import AreaChart from '../AreaChart/AreaChart';
import MixedChart from '../MixedChart/MixedChart';
import HeatMapChart from '../HeatMapChart/HeatMapChart';
import DonutChart from '../DonutChart/DonutChart';
import GaugeChart from '../GaugeChart/GaugeChart';
import RadarChart from '../RadarChart/RadarChart';
import WaterFallChart from '../WaterFallChart/WaterFallChart';
import FunnelChart from '../FunnelChart/FunnelChart';
import ShankeyChart from '../ShankeyChart/ShankeyChart';
import BoxChart from '../BoxChart/BoxChart';
import XYchart from '../XYChart/XYchart';
import RangeAreaChart from '../RangeAreaChart/RangeAreaChart';
import ViolinChart from '../ViolinChart/ViolinChart';
import NightingaleChart from '../NightingaleChart/NightingaleChart';
import RadialBarChart from '../RadialBarChart/RadialBarChart';
import CustomDateTimePicker from '../../../Components/CustomDateTimePicker';

const Analytics = (props) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const projectId = useSelector((state) => state.authSlice.userDetails?.projectName?.id);
    const viewButtonTogling = useSelector((state) => state.mainSlice.analyticalPageView);
    const [bookmark, setbookmark] = useState([]);
    const [isMultiAxis, setIsMultiAxis] = useState(false);
    const [typeOfChart, setTypeOfChart] = useState("area");
    const [description, setDescription] = useState('');
    const [chartName, setChartName] = useState("");
    const [aggregate, setAggregate] = useState("Mean");
    const category = [
        { key: 1, bookmark_name: 'External' },
        { key: 2, bookmark_name: 'Aggregated' },
        { key: 3, bookmark_name: 'Computed' },
    ];
    const chart = [
        { key: 1, chart_name: 'Area Chart' },
        { key: 2, chart_name: 'Line Chart' },
        { key: 3, chart_name: 'Bar Chart' },
        { key: 4, chart_name: 'Scatter Chart' },
    ];
    const filtertime = [
        { id: 1, name: 'Yesterday' },
        { id: 2, name: 'Last 24 Hours' },
        { id: 3, name: 'Today' },
        { id: 4, name: 'Month to Date' },
        { id: 5, name: 'Year to Date' },
        { id: 6, name: 'Week to Date' },
        { id: 7, name: 'Custom Duration' },
    ];
    const timeFilter = [
        { id: 1, name: '1 minute' },
        { id: 2, name: '5 minutes' },
        { id: 3, name: '10 minutes' },
        { id: 4, name: '15 minutes' },
        { id: 5, name: '30 minutes' },
        { id: 6, name: '1 hour' },
        { id: 7, name: '4 hours' },
        { id: 8, name: '8 hours' },
    ];

    const svgimage = [
        { id: 1, image: SVG_IMAGES.line, name: "LineChart" },
        { id: 2, image: SVG_IMAGES.area, name: "AreaChart" },
        { id: 3, image: SVG_IMAGES.bar1, name: "H" },
        { id: 4, image: SVG_IMAGES.bar2, name: "SV" },
        { id: 5, image: SVG_IMAGES.bar3, name: "V" },
        { id: 6, image: SVG_IMAGES.bar, name: "SH" },
        { id: 7, image: SVG_IMAGES.heatmap, name: "HeatMapChart" },
        { id: 8, image: SVG_IMAGES.donut, name: "DonutChart" },
        { id: 9, image: SVG_IMAGES.scatter, name: "ScatterChart" },
        { id: 10, image: SVG_IMAGES.boxplot, name: "BoxChart" }
    ];

    const svgimage2 = [
        { id: 1, image: SVG_IMAGES.xy, name: "XYchart" },
        { id: 2, image: SVG_IMAGES.mixedchart, name: "MixedChart" }
    ];

    const array = [
        { name: 'Ad-hoc', key: 1 },
        { name: 'Bookmarked', key: 2 }
    ];

    const settings = [
        { name: 'Chart', key: 1 },
        { name: 'Parameter', key: 2 },
        { name: 'Time Frequency', key: 3 }
    ];

    const containerHeight = useSelector(state => state.mainSlice.maxHeight);
    const customChartDataIs = useSelector((state) => state.mainSlice.customChartData);
    const lineChartData = useSelector(state => state.mainSlice.chartDataFromserver);
    const [chartValueData, setChartValueData] = useState(customChartDataIs);
    const [timeType, setTimeType] = useState("");
    const [showTable, setShowTable] = useState(false);
    const [value, setValue] = useState("");
    const [valuecategory, setValueCategory] = useState("");
    const [sharemodal, setshareModal] = useState(false);
    const [Bookmarkmodal, setBookmarkmodal] = useState(false);
    const [chartmodal, setChartmodal] = useState(false);
    const [valuetab, setValuetab] = useState(1);
    const [settingValuetab, setSettingValuetab] = useState(1);
    const [directshareModal, setDirectShareModal] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [user, setUser] = useState('');
    const [usernames, setUsernames] = useState([]);
    const [selectedChart, setSelectedChart] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUserids, setSelectedUserids] = useState([]);
    const slideAnim = useState(new Animated.Value(0))[0];
    const [selectedtime, setSelectedtime] = useState('Yesterday');
    const [Custom, setCustom] = useState(false);
    const [isFromDate, setIsFromDate] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [fromDate, setfromDate] = useState('');
    const [customFromDate, setCustomFromDate] = useState('2024-01-01 00:00:00');
    const [selectedLevelInfo, setSelectedLevelInfo] = useState(null);
    const [toDate, settoDate] = useState('');
    const [Comparative, setComparative] = useState(false);
    const [multiAxis, setMultiAxis] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [selectedTags, setSelectedTags] = useState("1");
    const [globalParameters, setGlobalParameters] = useState([]);
    const [catagoryType, setCatagoryType] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectName, setSelectName] = useState(null);
    const [parameterId, setParameterId] = useState("");
    const [addParam, setAddParam] = useState([]);
    const [selectedGlobalCode, setSelectedGlobalCode] = useState(null);
    const [paramUnit, setParmUnit] = useState("");
    const [timingBtnName, setTimingBtnName] = useState("yesterday");
    const [timeArray, setTimeArray] = useState([1]);
    const [selectedEle, setSelectedEle] = useState("");
    const [parametrList, setparameterList] = useState([]);
    const [selectedBookMark, setSelectedBookMark] = useState({});
    const [chartJsonData, setChartJsonData] = useState([]);
    const [timingsCard, setTimingsCard] = useState({ day: "yesterday", time: "Mean", });
    const [xType, setXType] = useState("");
    const [yType, setYType] = useState("");
    const [selectedfrom, setSelectedFrom] = useState();
    const chartComponents = {
        LineChart,
        BarChart,
        ScatterChart,
        AreaChart,
        MixedChart,
        HeatMapChart,
        DonutChart,
        GaugeChart,
        RadarChart,
        WaterFallChart,
        FunnelChart,
        ShankeyChart,
        BoxChart,
        XYchart,
        RangeAreaChart,
        ViolinChart,
        NightingaleChart,
        RadialBarChart,
    };
    const [checkBoXClicked, setCheckBoxClicked] = useState(false);
    const [bookMarkName, setBookMarkName] = useState("");
    const [bookMarkDescription, setBookMarkDescription] = useState("");

    const getBtnNameFunc = (e) => {
        setTimingBtnName(e);
        setTimeArray([1]);
    };

    const formatToDate = (date) => {
        const year = date?.getFullYear();
        const month = (`0${date?.getMonth() + 1}`).slice(-2);
        const day = (`0${date?.getDate()}`).slice(-2);
        const hours = (`0${date?.getHours()}`).slice(-2);
        const minutes = (`0${date?.getMinutes()}`).slice(-2);
        const seconds = (`0${date?.getSeconds()}`).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const [analyticType, setAnalyticType] = useState(true);
    const [convertedTime, setConvertedTime] = useState([]);
    const [customToDate, setCustomToDate] = useState(() => {
        const now = new Date();
        return formatToDate(now);
    });

    useEffect(() => {
        function getTimeRangeDates(timeRange, ele) {
            const now = new Date();
            let start_time, end_time;
            if (timeRange === "today") {
                start_time = new Date(now);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(now);
                setTimeType("hour");
            } else if (timeRange === "last24h") {
                const roundedHour = new Date(now);
                roundedHour.setMinutes(0, 0, 0);
                start_time = new Date(roundedHour - 24 * 60 * 60 * 1000);
                end_time = new Date(roundedHour);
                setTimeType("hour");
            } else if (timeRange === "yesterday") {
                start_time = new Date(now);
                start_time.setDate(now.getDate() - 1);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(now);
                end_time.setDate(now.getDate() - 1);
                end_time.setHours(23, 59, 59, 999);
                setTimeType("hour");
            } else if (timeRange === "WTD") {
                const sundayBeforeNow = new Date(now);
                sundayBeforeNow.setDate(now.getDate() - now.getDay());
                sundayBeforeNow.setHours(0, 0, 0, 0);
                start_time = new Date(sundayBeforeNow);
                end_time = new Date(now);
                setTimeType("day-of-week");
            } else if (timeRange === "MTD") {
                start_time = new Date(now);
                start_time.setDate(1);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(now);
                setTimeType("month");
            } else if (timeRange === "YTD") {
                start_time = new Date(now);
                start_time.setMonth(0);
                start_time.setDate(1);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(now);
                setTimeType("month");
            } else if (timeRange === "Past Month") {
                start_time = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end_time = new Date(now.getFullYear(), now.getMonth(), 0);
                end_time.setHours(23, 59, 59, 999);
            } else if (timeRange === "Days") {
                const date = new Date(ele);
                start_time = new Date(date);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(date);
                end_time.setHours(23, 59, 59, 999);
            } else if (timeRange === "Hours") {
                const date = new Date(ele);
                start_time = new Date(date);
                start_time.setHours(date.getHours());
                end_time = new Date(start_time);
                end_time.setHours(start_time.getHours() + 1);
            } else if (timeRange === "Month") {
                const givenDateTime = new Date(ele.fromDate);
                const givenDateTime2 = new Date(ele.toDate);
                start_time = new Date(givenDateTime);
                end_time = new Date(givenDateTime2);
            } else if (timeRange === "1minute") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setMinutes(start_time.getMinutes() - 1);
                end_time = new Date(roundedHour);
            } else if (timeRange === "5minutes") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setMinutes(start_time.getMinutes() - 5);
                end_time = new Date(roundedHour);
            } else if (timeRange === "10minutes") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setMinutes(start_time.getMinutes() - 10);
                end_time = new Date(roundedHour);
            } else if (timeRange === "15minutes") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setMinutes(start_time.getMinutes() - 15);
                end_time = new Date(roundedHour);
            } else if (timeRange === "30minutes") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setMinutes(start_time.getMinutes() - 30);
                end_time = new Date(roundedHour);
            } else if (timeRange === "1hour") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setHours(start_time.getHours() - 1);
                end_time = new Date(roundedHour);
            } else if (timeRange === "4hours") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setHours(start_time.getHours() - 4);
                end_time = new Date(roundedHour);
            } else if (timeRange === "8hours") {
                const roundedHour = new Date(now);
                start_time = new Date(now);
                start_time.setHours(start_time.getHours() - 8);
                end_time = new Date(roundedHour);
            } else {
                start_time = new Date(now);
                start_time.setHours(0, 0, 0, 0);
                end_time = new Date(now);
                setTimeType("hour");
            }
            // Format dates to the desired string format
            const formatDate = (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
            return [formatDate(start_time), formatDate(end_time)];
        }
        const converted_dates = timeArray.map((ele) =>
            getTimeRangeDates(timingBtnName, ele)
        );
        setConvertedTime(converted_dates);
    }, [timingBtnName, timeArray]);

    const handleAddClick = () => {
        if (selectedGlobalCode) {
            const newParameterEntry = {
                tags: selectedTags,
                global: selectedGlobalCode,
                description: selectedDescription,
                name: selectName,
                parameterId: parameterId,
                chartType: typeOfChart,
                catagoryType: catagoryType,
                filterConditions: [],
                fiterConditionsNewFormat: [],
                paramUnit: paramUnit,
            };
            setAddParam([...addParam, newParameterEntry]);
            setShowTable(false);
            setSelectedLevelInfo(false);
        } else {
            alert("Please select the code")
        }
    };

    // <------ Handle modal animation on shareModal state change ------>
    useEffect(() => {
        const targetValue = directshareModal ? 0 : 400;
        Animated.timing(slideAnim, {
            toValue: targetValue,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [directshareModal, chartmodal]);

    // <------ fetch data when the user changes, or reset usernames when user is empty ------>
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setUsernames([]);
        }
    }, [user]);

    useEffect(() => {
        dispatch(chartDataFromserver({}));
    }, []);

    const onBackPress = () => {
        Alert.alert('Hold on!', 'Are you sure you want to delete the Bookmark?', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'YES', onPress: () => handleDeleteBookMark() },
        ]);
        return true;
    };

    const handlevalue = (id) => {
        setChartValueData([])
        setBookmarkmodal(false);
        setChartmodal(false);
        setValuetab(id)
        setShowTable(false)
    };

    const handleDateConfirm = (date) => {
        setSelectedDateTime(date);
        setDatePickerVisibility(false);
        showTimePicker();
    };

    const showTimePicker = () => {
        setTimePickerVisibility(true);
    };

    const handleItem = (name) => {
        // setSelectedChart(name)
        setTypeOfChart(name)
    };

    const fetchData = async () => {
        const token = await AsyncStorage.getItem('jwttoken');
        try {
            const response = await axios.get(
                `https://SustainOS.ai:10000/global_master_app/api/user_list/?user_name=${user}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setUsernames(response.data);
        } catch (error) {
            console.error('Error fetching datauser:', error);
        }
    };

    // <------ After selecting user and filling the description send function ------>
    const handleSendClick = async () => {
        try {
            const postData = {
                notification_type_id: 1,
                description: description,
                json_data: chartJsonData,
                receiver_user_id: selectedUserids,
            };
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.post(
                `${BASE_URL}dataservice_app/api/notification_details/?project_id=${projectId}`,
                postData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            Toast.show('Notification sent successfully', Toast.SHORT);
            setDescription('');
            setUser([]);
            setUsernames([]);
            setSelectedUsers([]);
            setDirectShareModal(false);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleDeleteBookMark = async () => {
        try {
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.delete(`${BASE_URL}ncarp_lens_app/api/bookmark_details/?id=${selectedBookMark.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("deleted-Response:", response.data);
            fetchDataAndRender()
        } catch (error) {
            console.error("Error:", error);
        }

    };

    // <------ User selection from the userlist for sharing ------>
    const handleUserSelect = (selectedUser, id) => {
        if (!selectedUsers.includes(selectedUser)) {
            setSelectedUsers([...selectedUsers, selectedUser]);
        }
        if (!selectedUserids.includes(id)) {
            setSelectedUserids([...selectedUserids, id]);
        }
        setUser(''); // <------ Clear input after selection ------>
        setUsernames([]); // <------ Clear dropdown after selection ------>
    };

    const handlevaluetab = (id) => {
        setSettingValuetab(id)
    }

    const handleEmailCompose = () => {
        const to = 'recipient@example.com';
        const subject = 'Subject';
        const body = 'Message body';
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        Linking.openURL(mailtoUrl)
            .then(() => console.log('Email app opened'))
            .catch((err) => console.error('Failed to open email app:', err));
    };
    const temp_page_name = (name) => name.replace(">", "").trim();
    const bookMarkSaveFunc = async (e) => {
        const token = await AsyncStorage.getItem('jwttoken');
        const dataToUpload = {
            name: bookMarkName,
            description: bookMarkDescription,
            page_name: temp_page_name("Ad-Hoc"),
            json_data: {
                aggregateTime: timingBtnName,
                aggregateRange: aggregate,
                timingsCard: timingsCard,
                checkBoXClicked: checkBoXClicked,
                barType: barType,
                timeType: timeType,
                chartJsonData: chartJsonData,
                comparative: Comparative,
                analyticType: analyticType,
            },
        };
        setbookmark([
            ...bookmark,
            {
                bookmark_name: bookMarkName,
                bookmark_description: bookMarkDescription,
            },
        ]);
        const apiUrl = `${BASE_URL}ncarp_lens_app/api/bookmark_details/?project_id=${projectId}`;
        try {
            await axios.post(apiUrl, dataToUpload, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Error:", error);
        }
        setBookmarkmodal(!Bookmarkmodal)
    };

    const fetchDataAndRender = async () => {

        try {
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.get(`${BASE_URL}ncarp_lens_app/api/bookmark_details/?project_id=${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = response.data;
            const filteredBookmarks = data.filter((bookmark) => bookmark.page_name === 'Analytics');
            setbookmark(filteredBookmarks);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchDataAndRender();
    }, []);


    const renderBookmark = (item) => {
        return (
            <View style={{ backgroundColor: item.bookmark_name === value ? COLORS.BLUE_BG : COLORS.WHITE }}>
                <Divider style={styles.divider} />
                <Text style={[styles.dropdowntextstyle, { color: item.bookmark_name === value ? COLORS.BLACK : COLORS.ASH }]}>{item.bookmark_name}</Text>
            </View>
        )
    }

    const renderParameter = (item) => {
        return (
            <View style={{ backgroundColor: item.bookmark_name === selectedTags ? COLORS.BLUE_BG : COLORS.WHITE }}>
                <Divider style={styles.divider} />
                <Text style={[styles.dropdowntextstyle, { color: item.bookmark_name === selectedTags ? COLORS.BLACK : COLORS.ASH }]}>{item.bookmark_name}</Text>
            </View>
        )
    }

    const toggleMultiAxis = () => {
        setIsMultiAxis((prev) => !prev);
    };

    // Function to handle click event on a global code row
    const handleGlobalCodeClick = (item) => {
        setSelectedLevelInfo(item?.json_data);
        setSelectedGlobalCode(item?.global_code);
        setSelectedDescription(item?.global_parameter_description);
        setSelectName(item?.global_parameter_name);
        setParameterId(item?.id);
        setSelectedCell(item?.category_type?.value);
        setCatagoryType(item?.category_type_name);
        setParmUnit(item?.uom);
    };

    const handleSearchClick = async () => {
        const token = await AsyncStorage.getItem('jwttoken');
        if (name.length >= 1) {
            setLoading(true);
            setShowTable(true);
            axios
                .get(
                    `${BASE_URL}dataservice_app/api/parameter_details/?category_type_id=${selectedTags}&parameter_name=${name}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((response) => {
                    setLoading(false);
                    setGlobalParameters(response.data?.length > 0 ? response.data : []);
                })
                .catch((error) => {
                    console.error("API Error:", error);
                });
        }
    };

    const handleDeleteRow = (index) => {
        const updatedEntries = [...addParam];
        const filteredData = updatedEntries.filter(
            (ele) => ele.parameterId !== index
        );
        setAddParam(filteredData);
    };


    const CustomCell1 = ({ value, description, parameterId }) => {
        console.log("#####", parameterId)
        return (
            <View style={[styles.cellView, {
                backgroundColor: COLORS.BLUE_BG,
                width: scaleWidth(370),
                height: scaleHeight(50)
            }]}>
                <Text style={[styles.table3Text, { color: COLORS.BLACK }]}>
                    {value || '-'}
                </Text>
                <View style={{ borderLeftWidth: 1, borderLeftColor: COLORS.WHITE }}>
                    <Text style={[styles.table3Text, { color: COLORS.BLACK }]}>
                        {description || '-'}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteRow(parameterId)} style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginLeft: scaleWidth(45) }}>
                    <Image style={styles.share} source={IMAGES.trash} />
                </TouchableOpacity>
            </View>

        )
    }


    const CustomCell = ({ item, value, description, index, isFocused }) => (
        <TouchableOpacity
            onPress={() =>
                handleGlobalCodeClick(item)
            }>
            <View style={[styles.cellView, {
                backgroundColor: selectedGlobalCode === item.global_code ? COLORS.NEW_BLUE : index % 2 === 0 ? COLORS.WHITEBG : COLORS.BLUE_BG,
                width: scaleWidth(370)
            }]}>
                <Text style={[styles.tableText, { color: selectedGlobalCode === item.global_code ? COLORS.WHITE : COLORS.BLACK }]}>
                    {value || '-'}
                </Text>
                <View style={{ borderLeftWidth: 1, borderLeftColor: COLORS.WHITE }}>
                    <Text style={[styles.tableText, { color: selectedGlobalCode === item.global_code ? COLORS.WHITE : COLORS.BLACK }]}>
                        {description || '-'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleChartName = (item) => {
        setChartName(item.name)
    }

    const handlechartselectNext = () => {
        if (chartName !== '') {
            setSettingValuetab(2)
        } else {
            alert('Please Select Chart')
        }
    }

    const handlechartselectPrevious = () => {
        setSettingValuetab(1)
    }

    const handleparameterselectNext = () => {
        if (chartName === "MixedChart" && selectedChart === "") {
            alert('Please select chart type')
            return
        } else if (addParam === null) {
            alert('Please add the code')
        } else if (addParam !== null) {
            setSettingValuetab(3)
        } else {

        }
    }

    const handletimeprevious = () => {

    }

    const handletimeNext = () => {
        viewChartFunc()
        setChartmodal(!chartmodal)
    }

    useEffect(() => {
        getParameterFunc(addParam);
    }, [addParam]);

    const getParameterFunc = parm => {
        setparameterList(parm)
    }

    const handleBookChange = (event) => {

        const element = event;
        setSelectedBookMark(element);
        const chartsData = element?.json_data?.chartJsonData;
        chartNameFunc(element?.json_data?.chartJsonData);
        setChartJsonData(element?.json_data?.chartJsonData);
        setparameterList(chartsData[0].parametrList);
        setComparative(element?.json_data?.comparative);
        setTimingBtnName(chartsData[0].aggregateTime);
        setfromDate(chartsData[0].customFromDate);
        settoDate(chartsData[0].customToDate);
        setTimeArray(chartsData[0].comapritiveTime ? chartsData[0].comapritiveTime : [1]);
        setXType(chartsData[0].xType);
        setYType(chartsData[0].yType);
        setMultiAxis(chartsData[0].multiAxis);
        if (chartsData[0].chartName === "BarChart") {
            setChartName(chartsData[0].barType);
        } else {
            setChartName(chartsData[0].chartName);
        }
        setAggregate(element?.json_data?.aggregateRange);
    };

    const chartNameFunc = (chartType) => {
        setChartValueData(chartType);
    }
    const [barType, setBarType] = useState("");
    const viewChartFunc = () => {
        if (parametrList?.length > 1) {
            setSelectedEle("All");
        } else {
            setSelectedEle(parametrList[0]?.name);
        }
        const filterConditions = parametrList?.flatMap((obj) => obj?.fiterConditionsNewFormat);
        const dataToPlot = {
            chartName: chartName,
            parameters: parametrList,
            aggregateTime: timingBtnName,
            aggregateRange: aggregate,
            conditions: filterConditions,
            timingsCard: timingsCard,
            parametrList: parametrList,
            xType: xType,
            yType: yType,
            barType: "",
            timeType: timeType,
            analyticType: analyticType,
            multiAxis: multiAxis,
        };
        console.log("kadalpookal", parametrList)
        if (chartName === "H" || chartName === "V" || chartName === "SV" || chartName === "SH") {
            const chartData = convertedTime.map((ele) => ({
                ...dataToPlot,
                chartName: "BarChart",
                barType: chartName,
                fromdateIs: ele[0],
                toDateIs: ele[1],
                customFromDate: fromDate,
                customToDate: toDate,
                comapritiveTime: timeArray,
            }));
            chartNameFunc(chartData);
            setChartJsonData(chartData);
            setChartName("BarChart");
            setBarType(chartName);
        } else {
            const chartData = convertedTime.map((ele) => ({
                ...dataToPlot,
                chartName: chartName,
                barType: "",
                fromdateIs: ele[0],
                toDateIs: ele[1],
                customFromDate: fromDate,
                customToDate: toDate,
                comapritiveTime: timeArray,
            }));
            chartNameFunc(chartData);
            setChartJsonData(chartData);
            setChartName(chartName);
            setBarType("");
        }
        dispatch(analyticalPageView(!viewButtonTogling));
    };

    const renderChart = chart => {
        const ChartComponent = chartComponents[chart.chartName];
        return ChartComponent ? (
            <ChartComponent
                key={chart.id}
                chartId={chart.id}
                chartList={chart}
                checkTheCond={lineChartData}
                paged="analytics"
                showtitle={true}
                type="Chart"
            />
        ) : null;
    };

    const handleChartModal = () => {
        setChartmodal(!chartmodal)
        setValuetab(1)
    }

    const handleFromDateChange = (isoDate) => {
        setSelectedFrom(isoDate);
        const formatted = moment(isoDate).format('YYYY-MM-DD HH:mm:ss');
        console.log('Formatted from Time:', formatted);
        setCustomFromDate(formatted)
        setfromDate(formatted)
    };

    const handleToDateChange = (isoDate) => {
        const formatted = moment(isoDate).format('YYYY-MM-DD HH:mm:ss');
        setCustomFromDate(formatted)
        settoDate(formatted)
    };

    return (
        <>
            <View style={styles.container}>
                <CustomHeader title={WORDS.Analytics} navigation={navigation} icon={'menu'}
                />
                <View style={{ flex: 1 }}>
                    <View style={styles.box} >
                        <Navigator
                            value={valuetab}
                            array={array}
                            onPress={handlevalue}
                        />
                        {valuetab === 1 &&
                            <View>
                                <View style={[styles.firstView, { right: 20 }]}>
                                    <TouchableOpacity onPress={() => handleChartModal()}>
                                        <View style={styles.sharebox} >
                                            <Image style={styles.share} source={IMAGES.settings} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setBookmarkmodal(!Bookmarkmodal)}>
                                        <View style={styles.sharebox}>
                                            <Image style={styles.share} source={IMAGES.bookmark} />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setshareModal(!sharemodal)}>
                                        <View style={styles.sharebox}>
                                            <Image style={styles.share} source={IMAGES.share} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <ScrollView
                                        ref={scrollViewRef}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{
                                            height: containerHeight != null
                                                ? scaleHeight(containerHeight + 100)
                                                : scaleHeight(height),
                                            backgroundColor: 'transparent',
                                        }}
                                        style={{ paddingBottom: Platform.OS === 'ios' ? scaleHeight(200) : 0 }}>
                                        {/* <------ Dynamic Rendering Based on Data Arrays ------> */}
                                        {chartValueData?.map(chart => renderChart(chart))}

                                    </ScrollView>
                                </View>
                            </View>}
                        {valuetab === 2 &&
                            <View>
                                <View style={styles.innerbox}>
                                    <View style={styles.dropview}>
                                        <CustomDropDown
                                            array={bookmark}
                                            renderItem={(item) => renderBookmark(item)}
                                            placeholder={'Select'}
                                            value={value}
                                            field={'bookmark_name'}
                                            valueField={'bookmark_name'}
                                            onChange={(item) => {
                                                handleBookChange(item)
                                                setValue(item.bookmark_name);
                                            }}
                                            search={true}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => onBackPress()}>
                                        <View style={styles.sharebox}>
                                            <Image style={styles.share} source={IMAGES.trash} />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setshareModal(!sharemodal)}>
                                        <View style={styles.sharebox}>
                                            <Image style={styles.share} source={IMAGES.share} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <ScrollView
                                        ref={scrollViewRef}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{
                                            height: containerHeight != null
                                                ? scaleHeight(containerHeight + 100)
                                                : scaleHeight(height)
                                        }}
                                        style={{ paddingBottom: Platform.OS === 'ios' ? scaleHeight(200) : 0 }}>
                                        {chartValueData?.map(chart => renderChart(chart))}

                                    </ScrollView>
                                </View>
                            </View>}
                    </View>


                </View>
                {
                    sharemodal &&
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={() => setDirectShareModal(!directshareModal)}>
                            <Text style={styles.shareTextstyle}>Direct Share</Text>
                        </TouchableOpacity>
                        <Divider style={styles.divider} />
                        <TouchableOpacity onPress={() => handleEmailCompose()}>
                            <Text style={styles.shareTextstyle}>Mail Share</Text>
                        </TouchableOpacity>
                    </View>
                }

                {Bookmarkmodal &&
                    <Animated.View
                        style={[
                            styles.bookmodalView,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>
                        <View style={[styles.boxView]}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '90%' }}>
                                    <Text style={[styles.dropdowntextstyle, { color: COLORS.WHITE }]}>Bookmark</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ alignSelf: 'flex-end' }}
                                    onPress={() => {
                                        setBookmarkmodal(!Bookmarkmodal),
                                            setBookMarkName(""),
                                            setBookMarkDescription("")
                                    }}>
                                    <View style={styles.closeView}>
                                        <Image source={IMAGES.close} style={[styles.close, { tintColor: COLORS.WHITE }]} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.dropdowntextstyle, { color: COLORS.BLACK }]}>Name</Text>
                            <View style={styles.textInput}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter"
                                    placeholderTextColor={COLORS.GREY}
                                    onChangeText={(e) => setBookMarkName(e)}
                                />
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.dropdowntextstyle, { color: COLORS.BLACK }]}>Description</Text>
                            <View style={[styles.textInput, { height: scaleHeight(80) }]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter"
                                    placeholderTextColor={COLORS.GREY}
                                    onChangeText={(e) => setBookMarkDescription(e)}
                                />
                            </View>
                        </View>
                        <View style={styles.buttonView}>
                            <TouchableOpacity style={styles.clearView} onPress={() => setBookmarkmodal(!Bookmarkmodal)}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveView} onPress={() => bookMarkSaveFunc()}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                }

                {chartmodal &&
                    <Animated.View
                        style={[
                            styles.chartmodal,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>

                        <View style={[styles.boxView]}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '90%' }}>
                                    <Text style={[styles.dropdowntextstyle, { color: COLORS.WHITE }]}>Settings</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ alignSelf: 'flex-end' }}
                                    onPress={() => {
                                        setChartmodal(!chartmodal),
                                            setChartName('');
                                    }}>
                                    <View style={styles.closeView}>
                                        <Image source={IMAGES.close} style={[styles.close, { tintColor: COLORS.WHITE }]} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />

                        </View>

                        <View style={{ marginTop: scaleHeight(10), marginBottom: -8 }}>
                            <Navigator
                                value={settingValuetab}
                                array={settings}
                                onPress={handlevaluetab}
                            />
                        </View>
                        {settingValuetab === 1 &&
                            <View>
                                <View style={[styles.boxView, { backgroundColor: COLORS.BLUE_BG }]}>
                                    <Text style={[styles.dropdowntextstyle, { fontWeight: '600' }]}>Direct Chart Analytics</Text>
                                    <Divider style={styles.divider} />
                                </View>
                                <FlatList
                                    data={svgimage}
                                    numColumns={4}
                                    renderItem={(item, index) => {
                                        return (
                                            <TouchableOpacity style={{ marginVertical: scaleHeight(10), borderWidth: chartName === item.item.name ? 1 : 0, marginHorizontal: scaleWidth(5) }} onPress={() => handleChartName(item.item)}>
                                                <SvgXml xml={item.item.image} width={scaleWidth(70)} height={scaleHeight(80)} />
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <View style={[styles.boxView, , { backgroundColor: COLORS.BLUE_BG }]}>
                                    <Text style={[styles.dropdowntextstyle, { fontWeight: '600' }]}>Relationship Analytics</Text>
                                    <Divider style={styles.divider} />
                                </View>
                                <FlatList data={svgimage2}
                                    numColumns={4}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: scaleHeight(5), borderWidth: chartName === item.item.name ? 1 : 0, marginHorizontal: scaleWidth(5) }} onPress={() => handleChartName(item.item)}>
                                                <SvgXml xml={item.item.image} width={scaleWidth(70)} height={scaleHeight(90)} />
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <View style={styles.next}>
                                    <TouchableOpacity style={styles.saveView} onPress={() => handlechartselectNext()}>
                                        <Text style={styles.saveText}>Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        {settingValuetab === 2 &&
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.clearText, { fontSize: normalizeFont(18), marginLeft: scaleWidth(10) }]}>Multi Y-Axis</Text>
                                    <Switch
                                        value={isMultiAxis}
                                        onValueChange={toggleMultiAxis}
                                        trackColor={{ false: COLORS.HALF_WHITE, true: COLORS.GREYBG }}
                                        thumbColor={isMultiAxis ? COLORS.HEADERBG : COLORS.ASH}
                                    />
                                </View>
                                <Text style={[styles.dropdowntextstyle]}>Category</Text>
                                <View style={[styles.dropview, { marginLeft: scaleWidth(10), width: '85%', }]}>
                                    <CustomDropDown
                                        array={category}
                                        renderItem={(item) => renderParameter(item)}
                                        placeholder={'Select'}
                                        value={valuecategory}
                                        field={'bookmark_name'}
                                        valueField={'bookmark_name'}
                                        onChange={(item) => {
                                            setSelectedTags(item.key)
                                            setValueCategory(item.bookmark_name);
                                        }}
                                        search={true}
                                    />
                                </View>

                                <View style={{ height: scaleHeight(400) }}>
                                    <ScrollView>
                                        <Text style={[styles.dropdowntextstyle]}>Global Name / Description</Text>
                                        <View style={styles.searchboxcontainer}>

                                            <View style={styles.searchbox}>
                                                <TextInput style={styles.searchboxinput} placeholderTextColor={COLORS.GREY} placeholder='' onChangeText={(text) => setName(text)} />
                                            </View>
                                            <View style={styles.flexicon}>
                                                <TouchableOpacity style={styles.iconview} onPress={() => handleSearchClick()} accessibilityLabel='cancel'>
                                                    <View style={styles.icon}>
                                                        <Icon name={"search"} type='materialicon' size={25} color={COLORS.WHITE} style={styles.iconAlign} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.flexicon}>
                                                <TouchableOpacity style={styles.iconview} onPress={() => handleAddClick()} accessibilityLabel='cancel'>
                                                    <View style={styles.icon}>
                                                        <Icon name={"add"} type='materialicon' size={25} color={COLORS.WHITE} style={styles.iconAlign} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {showTable ?
                                            <View style={{ marginLeft: scaleWidth(10) }}>
                                                <View >
                                                    <View style={[styles.cellView, {
                                                        backgroundColor: COLORS.NEW_HEADER,
                                                        width: scaleWidth(370),
                                                        height: scaleHeight(50)
                                                    }]}>
                                                        <Text style={[styles.tableText, { color: COLORS.WHITE }]}>
                                                            {'Global Code'}
                                                        </Text>
                                                        <View style={{ borderLeftWidth: 1, borderLeftColor: COLORS.WHITE }}>
                                                            <Text style={[styles.tableText, { color: COLORS.WHITE }]}>
                                                                {'Description'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {globalParameters?.length !== 0 &&
                                                    <FlatList
                                                        data={globalParameters}
                                                        renderItem={(item, index) => {
                                                            return (
                                                                <View style={styles.dataRow} key={index}>
                                                                    <CustomCell
                                                                        item={item?.item}
                                                                        value={item?.item?.global_code ? item?.item?.global_code : '-'}
                                                                        description={item?.item?.global_parameter_description ? item?.item?.global_parameter_description : '-'}
                                                                        index={item.index}
                                                                        key={item.index}
                                                                    />
                                                                </View>
                                                            )
                                                        }}
                                                        style={{ height: scaleHeight(150) }} />}
                                            </View>
                                            :

                                            <>
                                                {addParam?.length > 0 &&
                                                    <>
                                                        <Text style={[styles.dropdowntextstyle]}>Parameter Mapping List</Text>
                                                        <View style={{ marginLeft: scaleWidth(10) }}>
                                                            <View style={[styles.cellView, {
                                                                backgroundColor: COLORS.NEW_HEADER,
                                                                width: scaleWidth(370),
                                                                height: scaleHeight(50)
                                                            }]}>
                                                                <Text style={[styles.table3Text, { color: COLORS.WHITE }]}>
                                                                    {'Global Code'}
                                                                </Text>
                                                                <View style={{ borderLeftWidth: 1, borderLeftColor: COLORS.WHITE }}>
                                                                    <Text style={[styles.table3Text, { color: COLORS.WHITE }]}>
                                                                        {'Description'}
                                                                    </Text>
                                                                </View>
                                                                <View style={{ borderLeftWidth: 1, borderLeftColor: COLORS.WHITE }}>
                                                                    <Text style={[styles.table3Text, { color: COLORS.WHITE }]}>
                                                                        {'Action'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <FlatList
                                                                data={addParam}
                                                                extraData={addParam}
                                                                renderItem={(item, index) => {
                                                                    return (
                                                                        <View style={styles.dataRow} key={index}>
                                                                            <CustomCell1
                                                                                item={item?.item}
                                                                                value={item?.item?.global ? item?.item?.global : '-'}
                                                                                description={item?.item?.description ? item?.item?.description : '-'}
                                                                                index={item}
                                                                                key={index + 1}
                                                                                parameterId={item.item.parameterId}
                                                                            />
                                                                        </View>
                                                                    )
                                                                }}
                                                            />
                                                        </View>
                                                    </>}
                                            </>

                                        }
                                        {chartName === "MixedChart" &&
                                            <>
                                                <Text style={[styles.dropdowntextstyle]}>Chart Type</Text>
                                                <FlatList
                                                    data={chart}
                                                    numColumns={2}
                                                    renderItem={(item, index) => {
                                                        return (
                                                            <TouchableOpacity style={{ width: scaleWidth(150) }} onPress={() => handleItem(item.item.chart_name)}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Icon
                                                                        name={selectedChart === item.item.chart_name ? 'radio-button-on' : 'radio-button-off'}
                                                                        type='ionicon'
                                                                        color={COLORS.NEW_HEADER}
                                                                    />

                                                                    <Text style={[styles.dropdowntextstyle]}>{item.item.chart_name}</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )
                                                    }}
                                                    contentContainerStyle={{ marginLeft: scaleWidth(10) }}
                                                />
                                            </>
                                        }
                                    </ScrollView>
                                </View>
                                <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: scaleHeight(10) }}>
                                    <TouchableOpacity style={[styles.saveView, { marginRight: scaleWidth(10), }]} onPress={() => handlechartselectPrevious()}>
                                        <Text style={styles.saveText}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.saveView, { marginRight: scaleWidth(10), }]} onPress={() => handleparameterselectNext()}>
                                        <Text style={styles.saveText}>Next</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>

                        }
                        {settingValuetab === 3 &&
                            <View>
                                <View style={{ flexDirection: 'row', marginTop: scaleHeight(30) }}>
                                    <View  >
                                        <FlatList
                                            data={filtertime}
                                            renderItem={(item, index) => {
                                                return (
                                                    <>
                                                        <View style={{ width: scaleWidth(150), marginHorizontal: scaleWidth(20) }}>
                                                            <TouchableOpacity style={[styles.timeView, {
                                                                backgroundColor: selectedtime === item.item.name ? COLORS.HEADER : COLORS.WHITE,
                                                                borderColor: selectedtime === item.item.name ? COLORS.HEADER : COLORS.GREY,
                                                            }]} onPress={() => { item.item.name === 'Custom Duration' ? setCustom(!Custom) : setCustom(false), setSelectedtime(item.item.name), getBtnNameFunc(item.item.name) }}>
                                                                <Text style={[styles.timeText, { color: selectedtime === item.item.name ? COLORS.WHITE : COLORS.DATETEXT, }]}>{item.item.name}</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                    </>
                                                )
                                            }}
                                        />
                                        {Custom &&
                                            <View style={{ marginTop: scaleHeight(15) }}>
                                                <Text style={styles.FromText}>From</Text>
                                                <CustomDateTimePicker time={handleFromDateChange} />
                                                <Text style={styles.FromText}>To</Text>
                                                <CustomDateTimePicker time={handleToDateChange} from={selectedfrom} />
                                            </View>
                                        }
                                    </View>
                                    <FlatList
                                        data={timeFilter}
                                        renderItem={(item, index) => {
                                            return (
                                                <View style={{ width: scaleWidth(150) }}>
                                                    <TouchableOpacity style={[styles.timeView, {
                                                        backgroundColor: selectedtime === item.item.name ? COLORS.HEADER : COLORS.WHITE,
                                                        borderColor: selectedtime === item.item.name ? COLORS.HEADER : COLORS.GREY,
                                                    }]} onPress={() => { setSelectedtime(item.item.name), getBtnNameFunc(item.item.name) }}>
                                                        <Text style={[styles.timeText, { color: selectedtime === item.item.name ? COLORS.WHITE : COLORS.DATETEXT, }]}>{item.item.name}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }} />
                                </View>
                                <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: scaleHeight(30) }}>
                                    <TouchableOpacity style={[styles.saveView, { marginRight: scaleWidth(10), }]} onPress={() => handletimeprevious()}>
                                        <Text style={styles.saveText}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.saveView, { marginRight: scaleWidth(10), }]} onPress={() => handletimeNext()}>
                                        <Text style={styles.saveText}>View</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }

                    </Animated.View>
                }

                {/* <------ Sharing Modal ------> */}
                {directshareModal && (
                    <Animated.View
                        style={[
                            styles.shareView,
                            { transform: [{ translateY: slideAnim }] },
                        ]}>
                        <View style={styles.headerLine}>
                            <Text
                                style={[
                                    styles.saveText,
                                    {
                                        marginHorizontal: scaleWidth(20),
                                        marginVertical: scaleHeight(10),
                                        fontSize: normalizeFont(18),
                                    },
                                ]}>
                                Share to
                            </Text>
                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', left: scaleWidth(240) }}
                                onPress={() => {
                                    setDirectShareModal(!directshareModal), setDescription('');
                                }}>
                                <View style={styles.closeView}>
                                    <Image source={IMAGES.close} style={[styles.close]} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                marginVertical: scaleHeight(20),
                                marginHorizontal: scaleWidth(5),
                            }}>
                            <Text
                                style={[
                                    styles.clearText,
                                    { marginLeft: scaleWidth(15), marginBottom: scaleHeight(10) },
                                ]}>
                                To
                            </Text>
                            <View>
                                <View style={styles.textInput}>
                                    <TextInput
                                        style={{ height: 40, fontSize: 12, color: 'grey', marginLeft: scaleWidth(10), fontFamily: FONTS.SEGOEUISEMIBOLD }}
                                        onChangeText={text => setUser(text)}
                                        value={user}
                                        placeholder="Enter"
                                        placeholderTextColor="grey"
                                    />
                                </View>

                                {usernames.length > 0 && user !== '' && (
                                    <FlatList
                                        data={usernames}
                                        keyExtractor={item => item.user_name}
                                        numColumns={3}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.userTextView,
                                                    { marginRight: 5, marginBottom: 10 },
                                                ]}
                                                onPress={() => handleUserSelect(item.user_name, item.id)}>
                                                <Text
                                                    style={[
                                                        styles.timeText,
                                                        { marginHorizontal: 3, fontWeight: '500' },
                                                    ]}>
                                                    {item.user_name}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        contentContainerStyle={{ marginLeft: scaleWidth(20) }}
                                    />
                                )}
                                <View style={styles.selectedUsersContainer}>
                                    {selectedUsers.map((selectedUser, index) => (
                                        <View key={index} style={styles.selectedUser}>
                                            <Text style={styles.clearText}>{selectedUser}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleUserRemove(selectedUser)}>
                                                <Text style={styles.removeText}>✖</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <Text
                                style={[
                                    styles.clearText,
                                    { marginLeft: scaleWidth(15), marginBottom: scaleHeight(10) },
                                ]}>
                                Description
                            </Text>
                            <View style={[styles.textInput, { height: 60 }]}>
                                <TextInput
                                    style={{ height: 60, fontSize: 12, color: COLORS.GREY, marginLeft: scaleWidth(10), fontFamily: FONTS.SEGOEUISEMIBOLD }}
                                    onChangeText={text => setDescription(text)}
                                    value={description}
                                    placeholder="Enter"
                                    placeholderTextColor={COLORS.GREY}
                                />
                            </View>

                            <View
                                style={[
                                    styles.buttonView,
                                    { right: scaleWidth(10), marginTop: scaleHeight(20) },
                                ]}>
                                <TouchableOpacity
                                    style={styles.clearView}
                                    onPress={() => {
                                        setDirectShareModal(!directshareModal), setDescription('');
                                    }}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveView}
                                    onPress={() => handleSendClick()}>
                                    <Text style={styles.saveText}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>
        </>
    )
}
export default Analytics;
