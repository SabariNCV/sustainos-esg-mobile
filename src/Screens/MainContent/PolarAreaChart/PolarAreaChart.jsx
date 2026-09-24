import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import { COLORS } from '../../../Constants/Colors';
import {
  normalizeFont,
  scaleHeight,
  scaleWidth,
} from '../../../Constants/dynamicSize';
import { styles } from '../styles';
import CustomPlotly from '../../../Components/CustomPlotly';
import { Divider } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { APIRequest } from "../../../Utils/ApiRequest";
import { FONTS } from "../../../Constants/Fonts"
export default function PolarAreaChart(props) {
  const { chartId } = props
  const polarAreaChartData = useSelector(state => state.mainSlice.chartDataFromserver[chartId]["polarAreaChart-colors"])
  const [tracesIs, setTraces] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    fetchDataAndRender();
    const interval = setInterval(() => {
      fetchDataAndRender();
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const fetchDataAndRender = async () => {
    const currentTimestamp = Date.now();
    const twoMinutesEarlierTimestamp = currentTimestamp - (2 * 60 * 1000);
    const date = new Date(currentTimestamp);
    const currentDate = new Date(twoMinutesEarlierTimestamp);
    const toDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const fromDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const markerColor = polarAreaChartData.parameters.map((ele) => ele.parameterColor)
    const parametersName = polarAreaChartData.parameters.map((ele) => ele.global)
    const parametersId = polarAreaChartData.parameters.map((ele) => ele.parameterId)
    const url = `https://SustainOS.ai:9001/dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}`;
    let result = await APIRequest.getGetTimebasedService(url);
    let data = result.data
    if (data) {
      const traceData = data?.map((item, index) => {
        return {
          r: Object.values(item).flatMap(dataArray => dataArray.map(item => item.value)),
          hoverinfo: polarAreaChartData.toolTip ? 'all' : 'none',
          type: "scatterpolar",
          mode: 'lines',
          name: parametersName[index],
          fill: "toself",
          fillcolor: markerColor[index],
          line: {
            color: 'black'
          },
        };
      });
      setTraces(traceData);
    }
  };
  const layout = {
    title: '',
    xaxis: {
      title: 'Time',
      showgrid: false
    },
    yaxis: {
      title: 'Values',
      showgrid: false
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: -0.5,
    },
    showgrid: false,
    font: {
      family: FONTS.SEGOEUIBOLD,
      size: normalizeFont(14)
    },
    margin: {
      l: 60,
      r: 20,
    },
    shapes: [
      {
        type: 'rect',
        x0: 0,
        x1: 1.0,
        y0: 0,
        y1: 1.0,
        xref: 'paper',
        yref: 'paper',
        line: {
          color: COLORS.GREY,
          width: 2,
        },
      },
    ],
  };

  useEffect(() => {
    const data = [
      {
        domain: { x: [0, 1], y: [0, 1] },

        value: 450,
        type: "indicator",
        mode: "gauge+number+delta",
        delta: { reference: 380 },
        gauge: {
          axis: { range: [null, 500] },
          steps: [
            { range: [0, 250], color: "lightgray" },
            { range: [250, 400], color: "gray" }
          ],
          threshold: {
            line: { color: "red", width: 4 },
            thickness: 0.75,
            value: 490
          },
        }
      }
    ];
    setTraces(data);
  }, []);

  return (
    <View style={[styles.chartContainer]}>
      <View style={[styles.box, { backgroundColor: '#fff' }]}>
        <View style={{ backgroundColor: COLORS.HEADERBG, width: '100%' }}>
          <Text style={[styles.charttitle]}>{polarAreaChartData.chartTitle}</Text>
          <Divider style={styles.divider} />
        </View>
        <View style={{ alignSelf: 'flex-start', justifyContent: 'center', height: scaleHeight(400), width: scaleWidth(350) }}>
          <CustomPlotly
            data={tracesIs}
            layout={layout}
            style={{ flex: 1, bottom: scaleHeight(20), height: scaleHeight(200), }}
          />
        </View>
      </View>
    </View>
  )
}

