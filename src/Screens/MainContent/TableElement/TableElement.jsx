import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import CustomPlotly from '../../../Components/CustomPlotly';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Table, Row, Rows } from 'react-native-table-component';
import { FONTS } from "../../../Constants/Fonts"
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { COLORS } from '../../../Constants/Colors';
import {
  normalizeFont,
  scaleHeight,
  scaleWidth,
} from '../../../Constants/dynamicSize';
import { panelnormalizeFont, panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';

const TableElement = (props) => {
  const { tableId, type } = props;
  const dispatch = useDispatch();
  const tabledataToUpload = useSelector((state) => state.mainSlice.tableDataFromserver);
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const [dbData, setDbdata] = useState([])
  const tableIS = (tabledataToUpload[tableId] && tabledataToUpload[tableId]["table-colors"]) !== undefined && tabledataToUpload[tableId]["table-colors"]
  const parseHeight = (value) => {
    if (typeof value === 'string') {
      return value.includes('px') ? parseFloat(value?.replace('px', '')) : parseFloat(value);
    }
    return value;
  };
  const WIDTHH = parseHeight(tableIS?.reSizeProperties?.width)
  const HEIGHTT = parseHeight(tableIS?.reSizeProperties?.height)

  useEffect(() => {
    const newHeight = tableIS?.reSizeProperties?.y + HEIGHTT + 150;
    dispatch(updateHeight(newHeight));
  }, [])

  useEffect(() => {
    if (tableIS?.tableType === "dynamic" && tableIS?.dynamicTableData?.id !== undefined) {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq?.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender();
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    } else {
      setDbdata([])
    }
  }, [tableIS?.refreshFreq, tableIS?.dynamicTableData, tableIS?.timeRange])

  const fetchDataAndRender = async () => {
    const paramData = tableIS;
    const parametersId = paramData.dynamicTableData.parameterList ? paramData.dynamicTableData.parameterList.map((ele) => ele.id) : []
    let url;
    const token = await AsyncStorage.getItem('jwttoken');
    if (paramData.timeRange === "custom") {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=reports&from_date=${tableIS?.fromDate}&to_date=${tableIS?.toDate}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=reports&time_frequency=${paramData.timeRange}`;
    }
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response?.data?.data

      if (data) {
        const processedData = Object.entries(data)?.map(([timestamp, values]) => ({
          timestamp,
          ...values
        }));
        setDbdata(processedData)
      } else {
        setDbdata([])
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredParam = tableIS?.dynamicTableData?.parameterList ? tableIS?.dynamicTableData.parameterList?.filter(ele => tableIS?.selectedParams?.includes(ele?.id)) : []

  const combinedRows = Array.from({ length: tableIS?.numRows }, (_, i) => {
    const customRow = tableIS?.rowsTable.find(row => row.rows === i + 1);
    return customRow ? customRow.name : `Row ${i + 1}`;
  });

  const combinedColumns = Array.from({ length: tableIS?.numCols }, (_, i) => {
    const customCol = tableIS?.columnstable.find(col => col.column === i + 1);
    return customCol ? customCol.name : `Column ${i + 1}`;
  });

  const fixedRows = Array.from({ length: tableIS?.numRows }, (_, i) => {
    const customRow = tableIS?.rowMappings.find(rowI => rowI.rowNo === i + 1);
    return customRow ? customRow.row : `Row ${i + 1}`;
  });

  const fixedRowsmapping = Array.from({ length: tableIS?.numRows }, (_, i) => {
    const customRow = tableIS?.rowMappings.find(rowI => rowI.rowNo === i + 1);
    return customRow ? customRow : {};
  });

  function ColorFunction(ele, labelVal) {
    let parmValueColor = "#000"
    const updateColor = (ele) => {
      switch (ele.condition) {
        case "minMax":
          if (parseFloat(labelVal) > parseFloat(ele.min) && parseFloat(labelVal) < parseFloat(ele.max)) {
            parmValueColor = ele.color;
          }
          break;
        case "greaterThan":
          if (parseFloat(labelVal) > parseFloat(ele.max)) {
            parmValueColor = ele.color;
          }
          break;
        case "lessThan":
          if (parseFloat(labelVal) < parseFloat(ele.max)) {
            parmValueColor = ele.color;
          }
          break;
        case "greaterThanEquall":
          if (parseFloat(labelVal) >= parseFloat(ele.max)) {
            parmValueColor = ele.color;
          }
          break;
        case "lessThanEquall":
          if (parseFloat(labelVal) <= parseFloat(ele.max)) {
            parmValueColor = ele.color;
          }
          break;
        default:
          break;
      }
    };
    ele.colorTable.map((ele) => updateColor(ele));
    return parmValueColor
  }

  function LineChartElement({ ele, tableIS, BASE_URL }) {
    const [tracesIs, setTraces] = useState([])
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele])

    const fetchDataAndRender = async (dataIs) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&data_type=line`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&data_type=line&time_frequency=${dataIs.timeRange}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          const traces = [];
          [dataIs.id].forEach((key, ind) => {
            const trace = {
              x: [],
              y: [],
              mode: 'lines',
              "hoverinfo": 'none',
              line: {
                dash: 'solid',
                width: 1.5,
                color: dataIs.chartColor
              }
            };
            Object.entries(data).forEach(([timestamp, values]) => {
              const valueObj = values[dataIs.id];
              trace.x.push(timestamp);
              trace.y.push(valueObj || null);
            });
            traces.push(trace);
          });
          setTraces(traces);
        } else {
          setTraces([])
        }

      } catch (error) {
      }
    };

    const layoutIs = {
      margin: {
        t: 0,
        l: 0,
        r: 0,
        b: 0,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      showlegend: false,
    }

    return (
      <CustomPlotly
        data={tracesIs}
        layout={layoutIs}
        style={{ width: "100%", height: type === "panel" ? panelscaleHeight(30) : scaleHeight(30) }}
      />

    );
  }

  function BarChartElement({ ele, tableIS, BASE_URL }) {
    const [tracesIs, setTraces] = useState([])
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele])

    const fetchDataAndRender = async (dataIs) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&data_type=bar`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&data_type=bar&time_frequency=${dataIs.timeRange}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          const traces = [];
          [dataIs.id].forEach((key, ind) => {
            const trace = {
              x: [],
              y: [],
              type: 'bar',
              orientation: "v",
              "hoverinfo": 'none',
              marker: {
                color: dataIs.chartColor
              },
            };
            Object.entries(data).forEach(([timestamp, values]) => {
              const valueObj = values[dataIs.id];
              trace.x.push(timestamp);
              trace.y.push(valueObj || null);
            });
            traces.push(trace);
          });
          setTraces(traces);
        } else {
          setTraces([])
        }

      } catch (error) {
      }
    };

    const layoutIs = {
      margin: {
        t: 0,
        l: 0,
        r: 0,
        b: 0,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      showlegend: false,
    }

    return (
      <CustomPlotly
        data={tracesIs}
        layout={layoutIs}
        style={{ width: "100%", height: type === "panel" ? panelscaleHeight(30) : scaleHeight(30) }}
      />
    );
  }

  function StaticLabelElement({ ele, tableIS, BASE_URL }) {
    const [labelVal, setLableVal] = useState("")
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele])
    const fetchDataAndRender = async (data) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data.id}&from_date=${data.fromDate}&to_date=${data.toDate}&aggregation_type=${data.aggregate}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data.id}&time_frequency=${data.timeRange}&aggregation_type=${data.aggregate}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          setLableVal(data[ele.id].toFixed(ele.decimalValue))
        } else {
          setLableVal("")
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const parmValueColor = ColorFunction(ele, labelVal)
    return (
      <Text style={{ fontSize: type === "panel" ? panelnormalizeFont(14) : normalizeFont(14), textAlign: 'center', color: parmValueColor, fontFamily: FONTS.SEGOEUISEMIBOLD }}>
        {labelVal}
      </Text>
    );
  }

  function StaticSquareElement({ ele, tableIS, BASE_URL }) {
    const [paramValue, setParamValue] = useState("")
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele])

    const fetchDataAndRender = async (dataIs) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&aggregation_type=${dataIs.aggregate}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&time_frequency=${dataIs.timeRange}&aggregation_type=${dataIs.aggregate}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          setParamValue(data[ele.id])
        } else {
          setParamValue("")
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const parmValueColor = ColorFunction(ele, paramValue)

    return (
      <View style={{ width: type === "panel" ? panelscaleWidth(Number(ele.shapeSize)) : scaleWidth(Number(ele.shapeSize)), height: type === "panel" ? panelscaleHeight(Number(ele.shapeSize)) : scaleHeight(Number(ele.shapeSize)), backgroundColor: parmValueColor }}></View>
    );
  }

  function StaticCircleElement({ ele, tableIS, BASE_URL }) {
    const [paramValue, setParamValue] = useState("")
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele])

    const fetchDataAndRender = async (dataIs) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&aggregation_type=${dataIs.aggregate}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&time_frequency=${dataIs.timeRange}&aggregation_type=${dataIs.aggregate}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          setParamValue(data[ele.id])
        } else {
          setParamValue("")
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const parmValueColor = ColorFunction(ele, paramValue)

    return (
      <View style={{ width: ele.shapeSize,alignSelf:'center', height: ele.shapeSize, backgroundColor: parmValueColor, borderRadius: ele.shapeSize / 2 }}>
      </View>
    );
  }

  function StaticProgressBarElement({ ele, tableIS, BASE_URL }) {
    const [labelParamValue, setlabelParmValue] = useState("")
    const [progress, setProgress] = useState(0)
    useEffect(() => {
      let refreshTime = 0;
      const refreshFreq = tableIS?.refreshFreq.split(" ")
      if (refreshFreq[1] === "Second") {
        refreshTime = parseInt(refreshFreq[0]) * 1000
      } else if (refreshFreq[1] === "Minute") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
      } else if (refreshFreq[1] === "Hours") {
        refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
      } else {
        refreshTime = "None"
      }
      const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
      fetchDataAndRenderWrapper();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRenderWrapper, refreshTime);
        return () => clearInterval(intervalId);
      }
    }, [ele.maxVal, ele.minVal, ele])

    const fetchDataAndRender = async (dataIs) => {
      const paramData = tableIS;
      let url;
      if (paramData.timeRange === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&aggregation_type=${dataIs.aggregate}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&time_frequency=${dataIs.timeRange}&aggregation_type=${dataIs.aggregate}`;
      }
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          const value = data[ele.id]
          setlabelParmValue(value)
          const maxValue = parseInt(ele.maxVal)
          const minValue = parseInt(ele.minVal)
          if (value >= maxValue) {
            setProgress(100)
          } else if (value <= minValue) {
            setProgress(0)
          } else {
            const valueIs = (100 * value) / maxValue
            setProgress(valueIs)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const parmValueColor = ColorFunction(ele, labelParamValue)

    return (
      <View >
        <Text style={{ fontSize: type === "panel" ? panelnormalizeFont(12) : normalizeFont(12), color: "#fff", marginRight: 8, position: "absolute", zIndex: 1, height: 20 }}>
          {labelParamValue}
        </Text>
        <View
          style={{ width: "90%", height: type === "panel" ? panelscaleHeight(20) : scaleHeight(20), backgroundColor: "#808080", borderRadius: 5, margin: 4 }}
        >
          <View
            style={{ width: `${progress}%`, backgroundColor: parmValueColor, borderRadius: 5 }} >
          </View>
        </View>
      </View>
    );
  }

  const tableData = fixedRows.map((rowName, i) => {
    const selectedParams = fixedRowsmapping[i]?.selectedParams || [];
    const paramList = fixedRowsmapping[i]?.parameterList || [];
    const paramData = paramList.filter(ele => selectedParams.includes(ele.id));
    const rowComponents = paramData.map((param, j) => {
      switch (param.controlType) {
        case "Numeric":
          return <StaticLabelElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        case "Line Chart":
          return <LineChartElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        case "Bar Chart":
          return <BarChartElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        case "Square":
          return <StaticSquareElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        case "Circle":
          return <StaticCircleElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        case "Progress Bar":
          return <StaticProgressBarElement key={j} ele={param} tableIS={tableIS} BASE_URL={BASE_URL} />;
        default:
          return null;
      }
    });

    return [rowName, ...rowComponents];
  });

  const StaticFixedTable = () => {
    const transformData = (data, combinedColumns) => {
      const rows = [];
      const numRows = Math.max(...Object.keys(data).map(key => parseInt(key.split('-')[0]))) + 1;
      const numCols = Math.max(...Object.keys(data).map(key => parseInt(key.split('-')[1]))) + 1;
      const firstColumnData = combinedColumns;
      for (let row = 0; row < numRows; row++) {
        const rowData = [firstColumnData[row] || ''];
        for (let col = 0; col < numCols; col++) {
          const key = `${row}-${col}`;
          rowData.push(data[key] || '');
        }
        rows.push(rowData);
      }
      return rows;
    };

    const newtableData = transformData(tableIS?.staticTableData, combinedRows);
    const newRowData = [
      statictableHead,
      ...newtableData
    ];
    const Number = parseInt(tableIS?.numRows) + 2.5;

    // Dynamically create the styles for header and rows
    const headerTextStyle = {
      ...styles.text,
      fontSize: type === "panel"
        ? panelnormalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', '')))
        : normalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', '')))
    };

    const rowTextStyle = {
      ...styles.text,
      fontSize: type === "panel"
        ? panelnormalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', '')))
        : normalizeFont(parseFloat(tableIS?.dFontSize?.replace('px', '')))
    };

    // Ensure that textStyle is always an object and not an array
    const normalizedHeaderTextStyle = Array.isArray(headerTextStyle) ? headerTextStyle[0] : headerTextStyle;
    const normalizedRowTextStyle = Array.isArray(rowTextStyle) ? rowTextStyle[0] : rowTextStyle;

    return (
      <>
        <Table borderStyle={styles.tableBorder}>
          <Row
            data={newRowData[0]}
            style={{
              ...styles.head,
              height: type === "panel" ? panelscaleHeight(HEIGHTT / Number) : HEIGHTT / Number,
              backgroundColor: tableIS?.headerColor
            }}
            textStyle={normalizedHeaderTextStyle}
          />
          {newRowData.slice(1).map((rowData, index) => (
            <Row
              key={index}
              data={rowData}
              style={{
                ...styles.row,
                height: type === "panel" ? panelscaleHeight(HEIGHTT / Number) : HEIGHTT / Number,
                backgroundColor: index % 2 === 0
                  && tableIS?.banderRowColor ? tableIS?.banderRowColor : 'transparent'                             // Odd rows (or any other color)
              }}
              textStyle={normalizedRowTextStyle}
            />
          ))}
        </Table>
      </>
    );
  };


  function LabelElement({ ele, value }) {
    const parmValueColor = ColorFunction(ele, value)
    return (
      <View >
        <Text style={{ alignSelf: 'center', color: parmValueColor, margin: 0, fontFamily: FONTS.SEGOEUISEMIBOLD, fontSize: type === "panel" ? panelnormalizeFont(14) : normalizeFont(14) }}>
          {value}
        </Text>
      </View>
    );
  }

  function SquareElement({ ele, value }) {
    const parmValueColor = ColorFunction(ele, value)
    return (
      <View
        style={{ width: ele.shapeSize, height: ele.shapeSize, backgroundColor: parmValueColor }}
      >
      </View>
    );
  }

  function CircleElement({ ele, value }) {
    const parmValueColor = ColorFunction(ele, value)
    return (
      <View
        style={{ width: ele.shapeSize, height: ele.shapeSize, backgroundColor: parmValueColor, borderRadius: ele.shapeSize / 2,alignSelf:'center' }}
      ></View>
    );
  }

  function ProgressBarElement({ ele, value }) {
    const [progress, setProgress] = useState(0)
    const maxValue = parseInt(ele.maxVal)
    const minValue = parseInt(ele.minVal)
    useEffect(() => {
      if (value >= maxValue) {
        setProgress(100)
      } else if (value <= minValue) {
        setProgress(0)
      } else {
        const valueIs = (100 * value) / maxValue
        setProgress(valueIs)
      }
    }, [ele.maxVal, ele.minVal])
    const parmValueColor = ColorFunction(ele, value)

    return (
      <View style={{ width: type === "panel" ? panelscaleWidth(WIDTHH / dynamictableHead?.length) : WIDTHH / dynamictableHead?.length }}>
        <Text style={{ color: "#fff", fontSize: type === "panel" ? panelnormalizeFont(tableIS?.dFontSize) : normalizeFont(tableIS?.dFontSize), margin: 8, position: "absolute", zIndex: 1, height: type === "panel" ? panelscaleHeight(20) : scaleHeight(20) }}>
          {value}
        </Text>
        <View style={{ width: "90%", height: type === "panel" ? panelscaleHeight(20) : scaleHeight(20), backgroundColor: "#808080", borderRadius: type === "panel" ? panelscaleHeight(5) : scaleHeight(5), margin: type === "panel" ? panelscaleHeight(4) : scaleHeight(4) }}>
          <View
            style={{ width: `${progress}%`, backgroundColor: 'parmValueColor', height: type === "panel" ? panelscaleHeight(5) : scaleHeight(5) }} >
          </View>
        </View>
      </View>
    );
  }

  const renderElement = (header, value) => {
    switch (header.controlType) {
      case 'Numeric':
        return <LabelElement ele={header} value={value} />;
      case 'Square':
        return <SquareElement ele={header} value={value} />;
      case 'Circle':
        return <CircleElement ele={header} value={value} />;
      case 'Progress Bar':
        return <ProgressBarElement ele={header} value={value} />;
      default:
        return null;
    }
  };

  const tableData1 = dbData.map(row => [
    row.timestamp,
    ...filteredParam.map(header => renderElement(header, row[header.id])),
  ]);

  const dynamictableHead = [tableIS?.tableName, ...filteredParam.map(ele => ele.newname || ele.global_code)];
  const statictableHead = [tableIS?.tableName, ...combinedColumns];
  //console.log("helloworld", JSON.stringify(tableIS))
  return (
    <View style={[styles.tableContainer, {
      width: type === "panel" ? panelscaleWidth(WIDTHH) : scaleWidth(WIDTHH),
      height: type === "panel" ? panelscaleHeight(HEIGHTT) : scaleHeight(HEIGHTT),
      position: 'absolute',
      top: type === "panel" ? panelscaleHeight(tableIS?.reSizeProperties?.y - 30) : scaleHeight(tableIS?.reSizeProperties?.y - 30),
      left: type === "panel" ? panelscaleWidth(tableIS?.reSizeProperties?.x) : scaleWidth(tableIS?.reSizeProperties?.x),
    }]}>

      {tableIS?.staticTable &&
        <View style={{ backgroundColor: tableIS?.bgCh ? tableIS?.backgroundColor : "#fff", }}>
          <StaticFixedTable />
        </View>
      }

      {(tableIS?.tableType === "static" && !tableIS?.staticTable) &&
        <View style={{ backgroundColor: tableIS?.bgCh ? tableIS?.backgroundColor : "#fff" }}>
          <Table borderStyle={{ borderColor: '#000' }}>
            <Row data={statictableHead} style={StyleSheet.flatten([styles.head, { height: type === "panel" ? panelscaleHeight(HEIGHTT / 3) : HEIGHTT / 3, backgroundColor: tableIS?.headerColor }])}
              textStyle={StyleSheet.flatten([styles.text, { fontSize: type === "panel" ? panelnormalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) : normalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) }])} />
            <Rows data={tableData} style={StyleSheet.flatten([styles.head, { height: type === "panel" ? panelscaleHeight(HEIGHTT / 3) : HEIGHTT / 3, backgroundColor: tableIS?.headerColor }])} textStyle={StyleSheet.flatten([styles.text, { fontSize: normalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) }])} />
          </Table>
        </View>
      }

      {tableIS?.tableType === "dynamic" &&
        <View style={{ backgroundColor: tableIS?.bgCh ? tableIS?.backgroundColor : "#fff", }}>
          <Table borderStyle={styles.border}>
            <Row data={dynamictableHead} style={StyleSheet.flatten([styles.head, { height: type === "panel" ? panelscaleHeight(40) : scaleHeight(40), backgroundColor: tableIS?.headerColor }])}
              textStyle={StyleSheet.flatten([styles.text, { fontSize: type === "panel" ? panelnormalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) : normalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) }])} />
            {tableData1.map((rowData, index) => (
              <Row key={index} data={rowData} style={StyleSheet.flatten([styles.head, { backgroundColor: tableIS?.headerColor }])} textStyle={StyleSheet.flatten([styles.text, { fontSize: type === "panel" ? panelnormalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) : normalizeFont(parseFloat(tableIS?.hFontSize?.replace('px', ''))) }])} />
            ))}
          </Table>
        </View>}

    </View>
  );
};

export default TableElement;
const styles = StyleSheet.create({
  tableContainer: {
  },
  headingText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    fontSize: normalizeFont(16),
    textAlign: 'center',
    marginVertical: scaleHeight(10),
    fontWeight: '600'
  },
  rowText: {
    color: COLORS.BLACK,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    fontSize: normalizeFont(16),
    textAlign: 'center',
    marginVertical: scaleHeight(10)
  },
  head: {
    backgroundColor: '#f1f8ff',
  },
  text: {
    textAlign: 'center',
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    fontSize: normalizeFont(14),
    color: '#000',
  },
  border: {
    borderColor: '#fff',
  },
  tableContainer: {
    padding: scaleHeight(10),
    margin: scaleHeight(20),
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
})