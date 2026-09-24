import { createSlice } from '@reduxjs/toolkit'
import { fetchChartData, fetchPanelData, fetchPageData, fetchNotificationCount } from './actions/mainActions'

const initialState = {
    scrollEnable: true,
    maxHeight: 1500,
    chartDataFromserver: {},
    shapesStyles: {},
    panelshapesStyles: {},
    ChartsInfo: [],
    imageInfo: [],
    imageDataFromserver: {},
    isImageSelected: false,
    ImageId: "",
    labelDataFromserver: {},
    labelInfo: [],
    isLabelSelected: false,
    LabelId: "",
    panelIdIs: "",
    onPageClick: false,
    isDataFetched: false,
    notificationcount: 0,
    notificationDataIs: {},
    baseUrlIs: 'https://SustainOS.ai:9000/',
    eventsData: { timingBtnName: "today", fromDate: null, toDate: null, applyBtn: false },
    eventDate: [],
    squarestyles: {},
    linestyles: {},
    arrowstyles: {},
    circlestyles: {},
    trianglestyles: {},
    panelsquarestyles: {},
    panellinestyles: {},
    panelarrowstyles: {},
    panelcirclestyles: {},
    paneltrianglestyles: {},
    squareId: "",
    circleId: '',
    lineId: '',
    arrowId: '',
    triangleId: '',
    buttonInfo: [],
    buttonDataFromserver: {},
    isButtonSelected: false,
    ButtonId: "",
    progressBarStyles: {},
    panelprogressBarStyles: {},
    progressBarId: "",
    menuInfo: [],
    customChartData: [],
    menuBackground: '',
    tableDataFromserver: {},
    tableInfo: [],
    paneltableDataFromserver: {},
    paneltableInfo: [],
    tabInfo: [],
    tabDataFromserver: {},
    mapInfo: [],
    mapDataFromserver: {},
    isMapSelected: false,
    MapId: "",
    title: "",
    PageInfo: [],
    openPanel: false,
    openNotification: false,
    openLoadedpanel: false,
    panelDataIdsFromStore: [],
    locationId: "",
    showalert: false,
    alertMessage: "",
    AItext: "",
    AIArray: [],
    showAI: false,
    chatArray: [{ text: 'Hi! What can I do for you?', type: 'incoming' }],
    lastScreen: "",
    listening: false,
    chatMessage: "",
    currentScreen: "",
    analyticalPageView: false,
    panelbuttonDataFromserver: {},
    panelmapDataFromserver: {},
    panelchartDataFromserver: {},
    panelimageDataFromserver: {},
    panellabelDataFromserver: {},
    panelChartsInfo: [],
    panellabelInfo: [],
    panelimageInfo: [],
    panelbuttonInfo: [],
    panelmapInfo: [],
    paneltabInfo: [],
    panelbg: '',
    loading: true,
    panelLoading: false,
    showBar: false,
    bgColor: '',
    panelOpen: false,
    refreshing: false
}

const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        logoutReset: () => initialState,
        updateHeight(state, action) {
            const newHeight = action.payload;
            if (newHeight > state.maxHeight) {
                state.maxHeight = newHeight;
            }
        },
        resetHeight(state) {
            state.maxHeight = 500;
        },
        menuBackground(state, action) {
            state.menuBackground = action.payload;
        },
        panelbg(state, action) {
            state.panelbg = action.payload;
        },
        chartDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.chartDataFromserver = {
                    ...state.chartDataFromserver,
                    [key]: value
                };
            } else {
                state.chartDataFromserver = {
                    ...value
                };
            }
        },
        panelchartDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelchartDataFromserver = {
                    ...state.panelchartDataFromserver,
                    [key]: value
                };
            } else {
                state.panelchartDataFromserver = {
                    ...value
                };
            }
        },
        eventDate: (state, action) => {
            state.eventDate = action.payload
        },
        shapesStyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.shapesStyles = {
                    ...state.shapesStyles,
                    [key]: value
                };
            } else {
                state.shapesStyles = {
                    ...value
                };
            }
        },
        panelshapesStyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelshapesStyles = {
                    ...state.panelshapesStyles,
                    [key]: value
                };
            } else {
                state.panelshapesStyles = {
                    ...value
                };
            }
        },
        ChartsInfo: (state, action) => {
            state.ChartsInfo = action.payload
        },
        imageInfo: (state, action) => {
            state.imageInfo = action.payload
        },
        panelChartsInfo: (state, action) => {
            state.panelChartsInfo = action.payload
        },
        panelimageInfo: (state, action) => {
            state.panelimageInfo = action.payload
        },
        imageDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.imageDataFromserver = {
                    ...state.imageDataFromserver,
                    [key]: value
                };
            } else {
                state.imageDataFromserver = {
                    ...value
                };
            }
        },
        panelimageDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelimageDataFromserver = {
                    ...state.panelimageDataFromserver,
                    [key]: value
                };
            } else {
                state.panelimageDataFromserver = {
                    ...value
                };
            }
        },
        isImageSelected: (state, action) => {
            state.isImageSelected = action.payload
        },
        ImageId: (state, action) => {
            state.ImageId = action.payload
        },
        title: (state, action) => {
            state.title = action.payload
        },
        labelDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.labelDataFromserver = {
                    ...state.labelDataFromserver,
                    [key]: value
                };
            } else {
                state.labelDataFromserver = {
                    ...value
                };
            }
        },
        panellabelDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panellabelDataFromserver = {
                    ...state.panellabelDataFromserver,
                    [key]: value
                };
            } else {
                state.panellabelDataFromserver = {
                    ...value
                };
            }
        },
        labelInfo: (state, action) => {
            state.labelInfo = action.payload
        },
        panellabelInfo: (state, action) => {
            state.panellabelInfo = action.payload
        },
        isLabelSelected: (state, action) => {
            state.isLabelSelected = action.payload
        },
        LabelId: (state, action) => {
            state.LabelId = action.payload
        },
        openPanel: (state, action) => {
            state.openPanel = action.payload
        },
        panelIdIs: (state, action) => {
            state.panelIdIs = action.payload
        },
        onPageClick: (state, action) => {
            state.onPageClick = action.payload
        },
        isDataFetched: (state, action) => {
            state.isDataFetched = action.payload
        },
        notificationcount: (state, action) => {
            state.notificationcount = action.payload
        },
        notificationDataIs: (state, action) => {
            state.notificationDataIs = action.payload
        },
        baseUrlIs: (state, action) => {
            state.baseUrlIs = action.payload
        },
        eventsData: (state, action) => {
            state.eventsData = action.payload
        },
        squarestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.squarestyles = {
                    ...state.squarestyles,
                    [key]: value
                };
            } else {
                state.squarestyles = {
                    ...value
                };
            }
        },
        progressBarStyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.progressBarStyles = {
                    ...state.progressBarStyles,
                    [key]: value
                };
            } else {
                state.progressBarStyles = {
                    ...value
                };
            }
        },
        circlestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.circlestyles = {
                    ...state.circlestyles,
                    [key]: value
                };
            } else {
                state.circlestyles = {
                    ...value
                };
            }
        },
        trianglestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.trianglestyles = {
                    ...state.trianglestyles,
                    [key]: value
                };
            } else {
                state.trianglestyles = {
                    ...value
                };
            }
        },
        linestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.linestyles = {
                    ...state.linestyles,
                    [key]: value
                };
            } else {
                state.linestyles = {
                    ...value
                };
            }
        },
        arrowstyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.arrowstyles = {
                    ...state.arrowstyles,
                    [key]: value
                };
            } else {
                state.arrowstyles = {
                    ...value
                };
            }
        },
        panelsquarestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelsquarestyles = {
                    ...state.panelsquarestyles,
                    [key]: value
                };
            } else {
                state.panelsquarestyles = {
                    ...value
                };
            }
        },
        panelprogressBarStyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelprogressBarStyles = {
                    ...state.panelprogressBarStyles,
                    [key]: value
                };
            } else {
                state.panelprogressBarStyles = {
                    ...value
                };
            }
        },
        panelcirclestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelcirclestyles = {
                    ...state.panelcirclestyles,
                    [key]: value
                };
            } else {
                state.panelcirclestyles = {
                    ...value
                };
            }
        },
        paneltrianglestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.paneltrianglestyles = {
                    ...state.paneltrianglestyles,
                    [key]: value
                };
            } else {
                state.paneltrianglestyles = {
                    ...value
                };
            }
        },
        panellinestyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panellinestyles = {
                    ...state.panellinestyles,
                    [key]: value
                };
            } else {
                state.panellinestyles = {
                    ...value
                };
            }
        },
        panelarrowstyles: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelarrowstyles = {
                    ...state.panelarrowstyles,
                    [key]: value
                };
            } else {
                state.panelarrowstyles = {
                    ...value
                };
            }
        },
        squareId: (state, action) => {
            state.squareId = action.payload
        },
        circleId: (state, action) => {
            state.circleId = action.payload
        },
        lineId: (state, action) => {
            state.lineId = action.payload
        },
        arrowId: (state, action) => {
            state.arrowId = action.payload
        },
        triangleId: (state, action) => {
            state.triangleId = action.payload
        },
        buttonInfo: (state, action) => {
            state.buttonInfo = action.payload
        },
        panelbuttonInfo: (state, action) => {
            state.panelbuttonInfo = action.payload
        },
        buttonDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.buttonDataFromserver = {
                    ...state.buttonDataFromserver,
                    [key]: value
                };
            } else {
                state.buttonDataFromserver = {
                    ...value
                };
            }
        },
        panelbuttonDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelbuttonDataFromserver = {
                    ...state.panelbuttonDataFromserver,
                    [key]: value
                };
            } else {
                state.panelbuttonDataFromserver = {
                    ...value
                };
            }
        },
        isButtonSelected: (state, action) => {
            state.isButtonSelected = action.payload
        },
        ButtonId: (state, action) => {
            state.ButtonId = action.payload
        },
        mapInfo: (state, action) => {
            state.mapInfo = action.payload
        },
        mapDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.mapDataFromserver = {
                    ...state.mapDataFromserver,
                    [key]: value
                };
            } else {
                state.mapDataFromserver = {
                    ...value
                };
            }
        },
        panelmapDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.panelmapDataFromserver = {
                    ...state.panelmapDataFromserver,
                    [key]: value
                };
            } else {
                state.panelmapDataFromserver = {
                    ...value
                };
            }
        },
        isMapSelected: (state, action) => {
            state.isMapSelected = action.payload
        },
        MapId: (state, action) => {
            state.MapId = action.payload
        },
        menuInfo: (state, action) => {
            state.menuInfo = action.payload
        },
        emptyChartData: (state) => {
            state.chartDataFromserver = {}
            state.imageDataFromserver = {}
            state.labelDataFromserver = {}
            state.buttonDataFromserver = {}
            state.mapDataFromserver = {}
            state.tableDataFromserver = {}
            state.tabDataFromserver = {}
            state.shapesStyles = {}
            state.ChartsInfo = []
            state.imageInfo = []
            state.labelInfo = []
            state.buttonInfo = []
            state.mapInfo = []
            state.tableInfo = []
            state.tabInfo = []
        },
        panelemptyChartData: (state) => {
            state.panelchartDataFromserver = {}
            state.panelimageDataFromserver = {}
            state.panellabelDataFromserver = {}
            state.panelbuttonDataFromserver = {}
            state.panelmapDataFromserver = {}
            state.panelshapesStyles = {}
            state.paneltableDataFromserver = {}
            state.paneltableInfo = []
            state.panelChartsInfo = []
            state.panelimageInfo = []
            state.panellabelInfo = []
            state.panelbuttonInfo = []
            state.panelmapInfo = []
            state.paneltabInfo = []
        },
        scrollEnable: (state, action) => {
            state.scrollEnable = action.payload
        },
        tableDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.tableDataFromserver = {
                    ...state.tableDataFromserver,
                    [key]: value
                };
            } else {
                state.tableDataFromserver = {
                    ...value
                };
            }
        },
        tableInfo: (state, action) => {
            state.tableInfo = action.payload
        },
        paneltableDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.paneltableDataFromserver = {
                    ...state.paneltableDataFromserver,
                    [key]: value
                };
            } else {
                state.paneltableDataFromserver = {
                    ...value
                };
            }
        },
        paneltableInfo: (state, action) => {
            state.paneltableInfo = action.payload
        },
        tabInfo: (state, action) => {
            state.tabInfo = action.payload
        },
        paneltabInfo: (state, action) => {
            state.paneltabInfo = action.payload
        },
        tabDataFromserver: (state, action) => {
            const { key, value } = action.payload;
            if (key) {
                state.tabDataFromserver = {
                    ...state.tabDataFromserver,
                    [key]: value
                };
            } else {
                state.tabDataFromserver = {
                    ...value
                };
            }
        },
        PageInfo: (state, action) => {
            state.PageInfo = action.payload
        },
        openNotification: (state, action) => {
            state.openNotification = action.payload
        },
        notificationDataIs: (state, action) => {
            state.notificationDataIs = action.payload
        },
        openLoadedpanel: (state, action) => {
            state.openLoadedpanel = action.payload
        },
        locationId: (state, action) => {
            state.locationId = action.payload
        },
        panelDataIdsFromStore: (state, action) => {
            state.panelDataIdsFromStore = action.payload
        },
        showalert: (state, action) => {
            state.showalert = action.payload
        },
        showAI: (state, action) => {
            state.showAI = action.payload
        },
        alertMessage: (state, action) => {
            state.alertMessage = action.payload
        },
        AIArray: (state, action) => {
            state.AIArray = action.payload
        },
        chatArray: (state, action) => {
            state.chatArray = action.payload
        },
        AItext: (state, action) => {
            state.AItext = action.payload
        },
        lastScreen: (state, action) => {
            state.lastScreen = action.payload
        },
        listening: (state, action) => {
            state.listening = action.payload
        },
        chatMessage: (state, action) => {
            state.chatMessage = action.payload
        },
        currentScreen: (state, action) => {
            state.currentScreen = action.payload
        },
        analyticalPageView: (state, action) => {
            state.analyticalPageView = action.payload;
        },
        showBar: (state, action) => {
            state.showBar = action.payload;
        },
        bgColor: (state, action) => {
            state.bgColor = action.payload;
        },
        panelOpen: (state, action) => {
            state.panelOpen = action.payload;
        },
        refreshing: (state, action) => {
            state.refreshing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChartData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChartData.fulfilled, (state, { payload }) => {
                const data = payload;
                if (data.charsIs !== undefined) state.ChartsInfo = data.charsIs;
                if (data.labelsIs !== undefined) state.labelInfo = data.labelsIs;
                if (data.imagesIs !== undefined) state.imageInfo = data.imagesIs;
                if (data.buttonIs !== undefined) state.buttonInfo = data.buttonIs;
                if (data.mapIs !== undefined) state.mapInfo = data.mapIs;
                if (data.tableData !== undefined) state.tableDataFromserver = { ...data.tableData };
                if (data.tableIs !== undefined) state.tableInfo = data.tableIs;
                if (data.tabIs !== undefined) state.tabInfo = data.tabIs;
                state.bgColor = data.background;
                state.chartDataFromserver = { ...data.chartInfo };
                state.labelDataFromserver = { ...data.labelData };
                state.imageDataFromserver = { ...data.imageData };
                state.buttonDataFromserver = { ...data.buttonData };
                state.mapDataFromserver = { ...data.mapData };
                state.shapesStyles = { ...data.shapesData };
                state.tabDataFromserver = { ...data.tabData };
                state.showBar = true;
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchChartData.rejected, (state) => {
                state.loading = false;
                state.refreshing = false;
                state.showBar = false;
            })
            .addCase(fetchPanelData.pending, (state) => {
                state.panelLoading = true;
            })
            .addCase(fetchPanelData.fulfilled, (state, { payload }) => {
                const data = payload;
                const panelDataIds = [];
                panelDataIds.push(
                    ...Object.keys(data.shapesData?.squareShape || {}),
                    ...Object.keys(data.shapesData?.arrowShape || {}),
                    ...Object.keys(data.shapesData?.circleShape || {}),
                    ...Object.keys(data.shapesData?.lineShape || {}),
                    ...Object.keys(data.shapesData?.progressBar || {}),
                    ...Object.keys(data.shapesData?.triangleShape || {}),
                );
                if (data.charsIs !== undefined) {
                    data.charsIs.forEach(ele => panelDataIds.push(ele.id));
                    state.panelChartsInfo = data.charsIs;
                }
                if (data.labelsIs !== undefined) {
                    data.labelsIs.forEach(ele => panelDataIds.push(ele.id));
                    state.panellabelInfo = data.labelsIs;
                }
                if (data.buttonIs !== undefined) {
                    data.buttonIs.forEach(ele => panelDataIds.push(ele.id));
                    state.panelbuttonInfo = data.buttonIs;
                }
                if (data.mapIs !== undefined) {
                    data.mapIs.forEach(ele => panelDataIds.push(ele.id));
                    state.panelmapInfo = data.mapIs;
                }
                if (data.imagesIs !== undefined) {
                    data.imagesIs.forEach(ele => panelDataIds.push(ele.id));
                    state.panelimageInfo = data.imagesIs;
                }
                state.panelbg = data.background;
                state.panelchartDataFromserver = { ...data.chartInfo };
                state.panelshapesStyles = { ...data.shapesData };
                state.panellabelDataFromserver = { ...data.labelData };
                state.panelbuttonDataFromserver = { ...data.buttonData };
                state.panelmapDataFromserver = { ...data.mapData };
                state.panelimageDataFromserver = { ...data.imageData };
                state.openPanel = true;
                state.openLoadedpanel = true;
                state.panelDataIdsFromStore = panelDataIds;
                state.panelLoading = false;
                state.panelOpen = true;
            })
            .addCase(fetchPanelData.rejected, (state) => {
                state.panelLoading = false;
            })
            .addCase(fetchPageData.pending, (state) => {
                state.panelLoading = true;
            })
            .addCase(fetchPageData.fulfilled, (state, { payload }) => {
                const data = payload;
                if (data.charsIs !== undefined) state.panelChartsInfo = data.charsIs;
                if (data.labelsIs !== undefined) state.panellabelInfo = data.labelsIs;
                if (data.imagesIs !== undefined) state.panelimageInfo = data.imagesIs;
                if (data.buttonIs !== undefined) state.panelbuttonInfo = data.buttonIs;
                if (data.tableData !== undefined) state.paneltableDataFromserver = { ...data.tableData };
                if (data.tableIs !== undefined) state.paneltableInfo = data.tableIs;
                state.panelbg = data.background;
                state.panelchartDataFromserver = { ...data.chartInfo };
                state.panellabelDataFromserver = { ...data.labelData };
                state.panelimageDataFromserver = { ...data.imageData };
                state.panelbuttonDataFromserver = { ...data.buttonData };
                state.panelmapDataFromserver = { ...data.mapData };
                state.panelshapesStyles = { ...data.shapesData };
                state.tableDataFromserver = { ...data.tableData };
                state.tabDataFromserver = { ...data.tabData };
                state.panelOpen = true;
                state.panelLoading = false;
            })
            .addCase(fetchPageData.rejected, (state) => {
                state.panelLoading = false;
            })
            .addCase(fetchNotificationCount.fulfilled, (state, { payload }) => {
                state.notificationcount = payload.count;
            })
            .addCase(fetchNotificationCount.rejected, (state) => {
                state.notificationcount = 0;
            })
    }
})

export const {
    logoutReset, updateHeight, resetHeight, chartDataFromserver, emptyChartData, panelemptyChartData,
    shapesStyles, panelshapesStyles, ChartsInfo, imageInfo, isImageSelected, ImageId, imageDataFromserver,
    labelDataFromserver, labelInfo, isLabelSelected, LabelId, openPanel, panelIdIs, squareId, lineId,
    arrowId, circleId, triangleId, buttonInfo, scrollEnable, title, buttonDataFromserver, isButtonSelected,
    ButtonId, progressBarStyles, mapDataFromserver, isMapSelected, MapId, mapInfo, onPageClick,
    isDataFetched, notificationcount, PageInfo, showalert, openNotification, eventDate, openLoadedpanel,
    panelDataIdsFromStore, locationId, notificationDataIs, analyticalPageView, baseUrlIs, eventsData,
    squarestyles, linestyles, arrowstyles, circlestyles, trianglestyles, menuInfo, customChartData,
    menuBackground, tableDataFromserver, tableInfo, alertMessage, AIArray, AItext, showAI, chatArray,
    lastScreen, listening, chatMessage, currentScreen, tabDataFromserver, tabInfo, panelsquarestyles,
    panellinestyles, panelarrowstyles, panelcirclestyles, paneltrianglestyles, panelprogressBarStyles,
    panelbuttonDataFromserver, panelmapDataFromserver, panelchartDataFromserver,
    panelimageDataFromserver, panellabelDataFromserver, panelChartsInfo, panellabelInfo,
    panelbuttonInfo, panelmapInfo, paneltableInfo, paneltabInfo, panelimageInfo, panelbg,
    paneltableDataFromserver, showBar, bgColor, panelOpen, refreshing
} = mainSlice.actions;

export default mainSlice.reducer