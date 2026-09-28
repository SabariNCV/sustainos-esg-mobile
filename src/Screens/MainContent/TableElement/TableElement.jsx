import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Row, Rows } from 'react-native-table-component';
import PropTypes from 'prop-types';
import { FONTS } from '../../../Constants/Fonts';
import { COLORS } from '../../../Constants/Colors';
import { scaleHeight } from '../../../Constants/dynamicSize';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { parseHeight, parseFontSize, evaluateColorRange } from '../../../Components/elementUtils';
import { getScalers } from '../../../Components/scalers';
import { clampHorizontal } from '../../../Components/shapeUtils';
import { useParameterData } from '../../../Components/useParameterData';
import { TrendChart, ValueLabel, ValueShape, ValueProgressBar, ProgressBarView } from '../../../Components/ParameterControls';

const EMPTY_LIST = [];
const DEFAULT_TABLE_FONT_SIZE = 14;
const TABLE_MARGIN = scaleHeight(20);
const CHART_MODES = { 'Line Chart': 'line', 'Bar Chart': 'bar' };

const toFontSize = (value) => (value ? parseFontSize(value) : DEFAULT_TABLE_FONT_SIZE);

const buildLabels = (count, items, matchKey, nameKey, prefix) => Array.from(
  { length: count },
  (_, i) => items?.find((item) => item[matchKey] === i + 1)?.[nameKey] || `${prefix} ${i + 1}`,
);

const transformStaticData = (data, labels) => {
  const keys = Object.keys(data ?? {}).map((key) => key.split('-').map((part) => Number.parseInt(part, 10)));
  if (keys.length === 0) {
    return [];
  }
  const numRows = Math.max(...keys.map(([row]) => row)) + 1;
  const numCols = Math.max(...keys.map(([, col]) => col)) + 1;
  return Array.from({ length: numRows }, (_, row) => [
    labels[row] || '',
    ...Array.from({ length: numCols }, (__, col) => data[`${row}-${col}`] || ''),
  ]);
};

function StaticControl({ param, baseUrl, refreshFreq, scalers }) {
  const { sw, sh, sf } = scalers;
  const size = Number(param.shapeSize);
  const chartMode = CHART_MODES[param.controlType];

  if (chartMode) {
    return (
      <TrendChart
        ele={param}
        baseUrl={baseUrl}
        refreshFreq={refreshFreq}
        mode={chartMode}
        style={{ width: '100%', height: sh(30) }}
      />
    );
  }

  switch (param.controlType) {
    case 'Numeric':
      return (
        <ValueLabel
          ele={param}
          baseUrl={baseUrl}
          refreshFreq={refreshFreq}
          textStyle={{ fontSize: sf(14), textAlign: 'center', fontFamily: FONTS.SEGOEUISEMIBOLD }}
        />
      );
    case 'Square':
      return (
        <ValueShape
          ele={param}
          baseUrl={baseUrl}
          refreshFreq={refreshFreq}
          style={{ width: sw(size), height: sh(size) }}
        />
      );
    case 'Circle':
      return (
        <ValueShape
          ele={param}
          baseUrl={baseUrl}
          refreshFreq={refreshFreq}
          style={{ width: size, height: size, borderRadius: size / 2, alignSelf: 'center' }}
        />
      );
    case 'Progress Bar':
      return (
        <ValueProgressBar
          ele={param}
          baseUrl={baseUrl}
          refreshFreq={refreshFreq}
          labelStyle={[styles.progressLabel, { fontSize: sf(12) }]}
          trackStyle={[styles.progressTrack, { height: sh(20) }]}
        />
      );
    default:
      return null;
  }
}

StaticControl.propTypes = {
  param: PropTypes.shape({ controlType: PropTypes.string, shapeSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }).isRequired,
  baseUrl: PropTypes.string,
  refreshFreq: PropTypes.string,
  scalers: PropTypes.shape({ sw: PropTypes.func, sh: PropTypes.func, sf: PropTypes.func }).isRequired,
};

function DynamicCell({ header, value, scalers }) {
  const { sh, sf } = scalers;
  const color = evaluateColorRange(header.colorTable, value);
  const size = Number(header.shapeSize);

  switch (header.controlType) {
    case 'Numeric':
      return (
        <Text style={[styles.numericCell, { color, fontSize: sf(14) }]}>{value}</Text>
      );
    case 'Square':
      return <View style={{ width: size, height: size, backgroundColor: color }} />;
    case 'Circle':
      return (
        <View
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            alignSelf: 'center',
          }}
        />
      );
    case 'Progress Bar':
      return (
        <ProgressBarView
          value={value}
          ele={header}
          color={color}
          labelStyle={[styles.progressLabel, { fontSize: sf(12), height: sh(20) }]}
          trackStyle={[styles.progressTrack, { height: sh(20) }]}
        />
      );
    default:
      return null;
  }
}

DynamicCell.propTypes = {
  header: PropTypes.shape({ controlType: PropTypes.string, shapeSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  scalers: PropTypes.shape({ sh: PropTypes.func, sf: PropTypes.func }).isRequired,
};

DynamicCell.defaultProps = {
  value: '',
};

function StaticFixedTable({ tableIS, tableHeight, scalers, rowLabels, head }) {
  const { sh, sf } = scalers;
  const rows = useMemo(() => transformStaticData(tableIS.staticTableData, rowLabels), [tableIS.staticTableData, rowLabels]);
  const rowHeight = sh(tableHeight / (Number.parseInt(tableIS.numRows, 10) + 2.5));
  const headerTextStyle = [styles.text, { fontSize: sf(toFontSize(tableIS.hFontSize)) }];
  const rowTextStyle = [styles.text, { fontSize: sf(toFontSize(tableIS.dFontSize)) }];

  return (
    <Table borderStyle={styles.tableBorder}>
      <Row
        data={head}
        style={[styles.head, { height: rowHeight, backgroundColor: tableIS.headerColor }]}
        textStyle={headerTextStyle}
      />
      {rows.map((rowData, rowIndex) => (
        <Row
          key={rowData[0] || `row-${rowData.length}`}
          data={rowData}
          style={[
            styles.row,
            {
              height: rowHeight,
              backgroundColor: rowIndex % 2 === 0 && tableIS.banderRowColor ? tableIS.banderRowColor : 'transparent',
            },
          ]}
          textStyle={rowTextStyle}
        />
      ))}
    </Table>
  );
}

StaticFixedTable.propTypes = {
  tableIS: PropTypes.shape({ numRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }).isRequired,
  tableHeight: PropTypes.number.isRequired,
  scalers: PropTypes.shape({ sh: PropTypes.func, sf: PropTypes.func }).isRequired,
  rowLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  head: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function TableElement({ tableId, type }) {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const tableDataFromServer = useSelector((state) => state.mainSlice.tableDataFromserver);
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const tableIS = tableDataFromServer[tableId]?.['table-colors'];
  const scalers = getScalers(type);
  const { sw, sh, sf } = scalers;

  const resize = tableIS?.reSizeProperties;
  const tableWidth = parseHeight(resize?.width);
  const tableHeight = parseHeight(resize?.height);
  const positionX = Number(resize?.x);
  const positionY = Number(resize?.y);

  useEffect(() => {
    dispatch(updateHeight(positionY + tableHeight + 150));
  }, [positionY, tableHeight, ]);

  const dynamicSource = useMemo(() => {
    if (tableIS?.tableType !== 'dynamic' || tableIS.dynamicTableData?.id === undefined) {
      return null;
    }
    const ids = (tableIS.dynamicTableData.parameterList ?? EMPTY_LIST).map((ele) => ele.id);
    return {
      id: ids.join(','),
      timeRange: tableIS.timeRange,
      fromDate: tableIS.fromDate,
      toDate: tableIS.toDate,
    };
  }, [tableIS]);

  const dynamicData = useParameterData(baseUrl, dynamicSource, 'reports', tableIS?.refreshFreq);

  const dbData = useMemo(
    () => (dynamicData ? Object.entries(dynamicData).map(([timestamp, values]) => ({ timestamp, ...values })) : EMPTY_LIST),
    [dynamicData],
  );

  const numRows = tableIS?.numRows ?? 0;
  const numCols = tableIS?.numCols ?? 0;

  const rowLabels = useMemo(
    () => buildLabels(numRows, tableIS?.rowsTable, 'rows', 'name', 'Row'),
    [numRows, tableIS?.rowsTable],
  );
  const columnLabels = useMemo(
    () => buildLabels(numCols, tableIS?.columnstable, 'column', 'name', 'Column'),
    [numCols, tableIS?.columnstable],
  );
  const fixedRowNames = useMemo(
    () => buildLabels(numRows, tableIS?.rowMappings, 'rowNo', 'row', 'Row'),
    [numRows, tableIS?.rowMappings],
  );

  const filteredParams = useMemo(
    () => (tableIS?.dynamicTableData?.parameterList ?? EMPTY_LIST).filter((ele) => tableIS?.selectedParams?.includes(ele?.id)),
    [tableIS?.dynamicTableData?.parameterList, tableIS?.selectedParams],
  );

  const containerStyle = useMemo(
    () => clampHorizontal(
      {
        top: sh(positionY - 30) + TABLE_MARGIN,
        left: sw(positionX) + TABLE_MARGIN,
        width: sw(tableWidth),
        height: sh(tableHeight),
      },
      screenWidth,
    ),
    [sw, sh, positionX, positionY, tableWidth, tableHeight, screenWidth],
  );

  if (!tableIS) {
    return null;
  }

  const headerFontSize = toFontSize(tableIS.hFontSize);
  const backgroundColor = tableIS.bgCh ? tableIS.backgroundColor : '#fff';
  const staticHead = [tableIS.tableName, ...columnLabels];
  const dynamicHead = [tableIS.tableName, ...filteredParams.map((ele) => ele.newname || ele.global_code)];
  const headerTextStyle = [styles.text, { fontSize: sf(headerFontSize) }];
  const thirdHeight = sh(tableHeight / 3);

  const staticTableRows = fixedRowNames.map((rowName, rowIndex) => {
    const mapping = tableIS.rowMappings?.find((item) => item.rowNo === rowIndex + 1);
    const selected = mapping?.selectedParams ?? EMPTY_LIST;
    const params = (mapping?.parameterList ?? EMPTY_LIST).filter((ele) => selected.includes(ele.id));
    return [
      rowName,
      ...params.map((param) => (
        <StaticControl
          key={param.id}
          param={param}
          baseUrl={baseUrl}
          refreshFreq={tableIS.refreshFreq}
          scalers={scalers}
        />
      )),
    ];
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={{ backgroundColor }}>
        {tableIS.staticTable ? (
          <StaticFixedTable
            tableIS={tableIS}
            tableHeight={tableHeight}
            scalers={scalers}
            rowLabels={rowLabels}
            head={staticHead}
          />
        ) : null}

        {tableIS.tableType === 'static' && !tableIS.staticTable ? (
          <Table borderStyle={styles.staticBorder}>
            <Row
              data={staticHead}
              style={[styles.head, { height: thirdHeight, backgroundColor: tableIS.headerColor }]}
              textStyle={headerTextStyle}
            />
            <Rows
              data={staticTableRows}
              style={[styles.head, { height: thirdHeight, backgroundColor: tableIS.headerColor }]}
              textStyle={headerTextStyle}
            />
          </Table>
        ) : null}

        {tableIS.tableType === 'dynamic' ? (
          <Table borderStyle={styles.border}>
            <Row
              data={dynamicHead}
              style={[styles.head, { height: sh(40), backgroundColor: tableIS.headerColor }]}
              textStyle={headerTextStyle}
            />
            {dbData.map((row) => (
              <Row
                key={row.timestamp}
                data={[
                  row.timestamp,
                  ...filteredParams.map((header) => (
                    <DynamicCell key={header.id} header={header} value={row[header.id]} scalers={scalers} />
                  )),
                ]}
                style={[styles.head, { backgroundColor: tableIS.headerColor }]}
                textStyle={headerTextStyle}
              />
            ))}
          </Table>
        ) : null}
      </View>
    </View>
  );
}

TableElement.propTypes = {
  tableId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  type: PropTypes.string,
};

TableElement.defaultProps = {
  type: undefined,
};

export default React.memo(TableElement);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: scaleHeight(10),
  },
  head: {
    backgroundColor: '#f1f8ff',
  },
  text: {
    textAlign: 'center',
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    color: COLORS.BLACK,
  },
  border: {
    borderColor: '#fff',
  },
  staticBorder: {
    borderColor: '#000',
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  numericCell: {
    alignSelf: 'center',
    margin: 0,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  progressLabel: {
    color: '#fff',
    position: 'absolute',
    zIndex: 1,
    margin: 4,
  },
  progressTrack: {
    width: '90%',
    backgroundColor: '#808080',
    borderRadius: 5,
    margin: 4,
  },
});