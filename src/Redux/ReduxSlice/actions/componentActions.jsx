import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHART_UPLOAD_URL = 'https://SustainOS.ai:9012/services/upload_chart/';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('jwttoken');
  return { Authorization: `Bearer ${token}` };
};

export const fetchMenuProjectDetails = createAsyncThunk(
  'chartComponent/fetchMenuProjectDetails',
  async ({ baseUrl, projectName }, { rejectWithValue }) => {
    try {
      const headers = await getAuthHeaders();
      const url = `${baseUrl}ncarp_lens_app/api/menu_project_details/?project=${projectName}&menu_view_type=Mobile View`;
      const response = await axios.get(url, { headers });
      return response.data?.message?.[0] || null;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch menu project details');
    }
  }
);

export const fetchGroupMenuDetails = createAsyncThunk(
  'chartComponent/fetchGroupMenuDetails',
  async ({ baseUrl, menuId }, { rejectWithValue }) => {
    try {
      const headers = await getAuthHeaders();
      const url = `${baseUrl}ncarp_lens_app/api/group_menu_details/?menu_id=${menuId}`;
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch group menu details');
    }
  }
);

export const fetchLineChartData = createAsyncThunk(
  'chartComponent/fetchLineChartData',
  async ({ url }, { rejectWithValue }) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch chart data');
    }
  }
);

export const captureChartImage = createAsyncThunk(
  'chartComponent/captureChartImage',
  async ({ imageUrl, chartTitle, verticalName }, { rejectWithValue }) => {
    try {
      const response = await axios.post(CHART_UPLOAD_URL, {
        image: imageUrl,
        chart_title: chartTitle,
        vertical_name: verticalName
      });
      return response.data?.summary || '';
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to capture chart image');
    }
  }
);