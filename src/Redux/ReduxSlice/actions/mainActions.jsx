import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const normalizeJsonData = (jsonData) => ({
    chartInfo: jsonData?.chartInfo,
    labelData: jsonData?.labelData,
    imageData: jsonData?.imageData,
    buttonData: jsonData?.buttonData,
    mapData: jsonData?.mapData,
    tableData: jsonData?.tableData,
    tabData: jsonData?.tabData,
    shapesData: jsonData?.shapesData,
    charsIs: jsonData?.charsIs,
    labelsIs: jsonData?.labelsIs,
    imagesIs: jsonData?.imagesIs,
    buttonIs: jsonData?.buttonIs,
    mapIs: jsonData?.mapIs,
    tableIs: jsonData?.tableIs,
    tabIs: jsonData?.tabIs,
})

export const fetchChartData = createAsyncThunk('main/fetchChartData', async ({ baseUrl, projectName, id }, { rejectWithValue }) => {
    try {
        const url = `${baseUrl}ncarp_lens_app/api/page_list/?project=${projectName}&id=${id}`;
        const token = await AsyncStorage.getItem('jwttoken');
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const message = data?.message?.[0];
       
        return {
            ...normalizeJsonData(message?.json),
            background: message?.background,
        };
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});

export const fetchPanelData = createAsyncThunk('main/fetchPanelData', async ({ baseUrl, projectId, id }, { rejectWithValue }) => {
    try {
        const url = `${baseUrl}ncarp_lens_app/api/panel_details/?project_id=${projectId}&id=${id}`;
        const token = await AsyncStorage.getItem('jwttoken');
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = data?.[0]?.json_data;
        return {
            ...normalizeJsonData(jsonData),
            background: data?.[0]?.background,
        };
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});

export const fetchPageData = createAsyncThunk('main/fetchPageData', async ({ baseUrl, projectName, id }, { rejectWithValue }) => {
    try {
        const url = `${baseUrl}ncarp_lens_app/api/page_list/?project=${projectName}&id=${id}`;
        const token = await AsyncStorage.getItem('jwttoken');
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const message = data?.message?.[0];
        return {
            ...normalizeJsonData(message?.json),
            background: message?.background,
        };
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});

export const fetchNotificationCount = createAsyncThunk('main/fetchNotificationCount', async ({ baseUrl, projectId }, { rejectWithValue }) => {
    try {
        const url = `${baseUrl}dataservice_app/api/notification_details/?notification_retrieval_type=count&project_id=${projectId}`;
        const token = await AsyncStorage.getItem('jwttoken');
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return {
            count: data?.count,
        };
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});