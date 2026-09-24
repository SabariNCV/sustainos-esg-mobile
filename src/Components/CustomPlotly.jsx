import Plotly from 'react-native-plotly';

const CustomPlotly = ({ data, layout, styles }) => {
    return (
        <Plotly
            data={data}
            layout={layout}
            style={styles}
            useContainerStyle={true}
            enableFullPlotly={true}
            scrollZoom={false}
            config={{
                displayModeBar: false,
                scrollZoom: false,
                doubleClick: true,
                showTips: true,
                staticPlot: true,
            }}

        />
    )
}
export default CustomPlotly