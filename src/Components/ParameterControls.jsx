import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import CustomPlotly from './CustomPlotly';
import { evaluateColorRange } from './elementUtils';
import { useParameterData } from './useParameterData';
import { calculateProgress } from './shapeUtils';

const CHART_LAYOUT = {
  margin: { t: 0, l: 0, r: 0, b: 0 },
  xaxis: { showgrid: false, zeroline: false, showline: false, showticklabels: false },
  yaxis: { showgrid: false, zeroline: false, showline: false, showticklabels: false },
  showlegend: false,
};

const idType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);
const elementType = PropTypes.shape({ id: idType });
const styleType = PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]);

export const toProgress = (value, ele) => {
  const min = Number.parseInt(ele.minVal, 10);
  const max = Number.parseInt(ele.maxVal, 10);
  return calculateProgress(
    Number.parseFloat(value),
    Number.isFinite(min) ? min : 0,
    Number.isFinite(max) ? max : 100,
  );
};

const buildTrace = (data, ele, mode) => {
  const entries = Object.entries(data);
  const x = entries.map(([timestamp]) => timestamp);
  const y = entries.map(([, values]) => values?.[ele.id] || null);

  if (mode === 'bar') {
    return { x, y, type: 'bar', orientation: 'v', hoverinfo: 'none', marker: { color: ele.chartColor } };
  }
  return {
    x,
    y,
    mode: 'lines',
    hoverinfo: 'none',
    line: { dash: 'solid', width: 1.5, color: ele.chartColor },
  };
};

export const TrendChart = React.memo(function TrendChart({ ele, baseUrl, refreshFreq, mode, style }) {
  const data = useParameterData(baseUrl, ele, mode, refreshFreq);
  const traces = useMemo(() => (data ? [buildTrace(data, ele, mode)] : []), [data, ele, mode]);
  return <CustomPlotly data={traces} layout={CHART_LAYOUT} style={style} />;
});

TrendChart.propTypes = {
  ele: elementType.isRequired,
  baseUrl: PropTypes.string,
  refreshFreq: PropTypes.string,
  mode: PropTypes.oneOf(['line', 'bar']).isRequired,
  style: styleType,
};

export const ValueLabel = React.memo(function ValueLabel({ ele, baseUrl, refreshFreq, textStyle }) {
  const data = useParameterData(baseUrl, ele, 'aggregate', refreshFreq);
  const raw = data?.[ele.id];
  const text = raw === undefined || raw === null ? '' : Number(raw).toFixed(ele.decimalValue);
  const color = evaluateColorRange(ele.colorTable, text);
  return <Text style={[textStyle, { color }]}>{text}</Text>;
});

ValueLabel.propTypes = {
  ele: elementType.isRequired,
  baseUrl: PropTypes.string,
  refreshFreq: PropTypes.string,
  textStyle: styleType,
};

export const ValueShape = React.memo(function ValueShape({ ele, baseUrl, refreshFreq, style }) {
  const data = useParameterData(baseUrl, ele, 'aggregate', refreshFreq);
  const color = evaluateColorRange(ele.colorTable, data?.[ele.id] ?? '');
  return <View style={[style, { backgroundColor: color }]} />;
});

ValueShape.propTypes = {
  ele: elementType.isRequired,
  baseUrl: PropTypes.string,
  refreshFreq: PropTypes.string,
  style: styleType,
};

export const ProgressBarView = React.memo(function ProgressBarView({
  value,
  ele,
  color,
  containerStyle,
  labelStyle,
  trackStyle,
  labelSuffix,
}) {
  const progress = useMemo(() => toProgress(value, ele), [value, ele]);
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{`${value ?? ''}${labelSuffix}`}</Text>
      <View style={[trackStyle, styles.track]}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
});

ProgressBarView.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ele: elementType.isRequired,
  color: PropTypes.string,
  containerStyle: styleType,
  labelStyle: styleType,
  trackStyle: styleType,
  labelSuffix: PropTypes.string,
};

ProgressBarView.defaultProps = {
  value: '',
  color: undefined,
  containerStyle: undefined,
  labelStyle: undefined,
  trackStyle: undefined,
  labelSuffix: '',
};

export const ValueProgressBar = React.memo(function ValueProgressBar({ ele, baseUrl, refreshFreq, ...viewProps }) {
  const data = useParameterData(baseUrl, ele, 'aggregate', refreshFreq);
  const value = data?.[ele.id] ?? '';
  const color = evaluateColorRange(ele.colorTable, value);
  return <ProgressBarView value={value} ele={ele} color={color} {...viewProps} />;
});

ValueProgressBar.propTypes = {
  ele: elementType.isRequired,
  baseUrl: PropTypes.string,
  refreshFreq: PropTypes.string,
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});