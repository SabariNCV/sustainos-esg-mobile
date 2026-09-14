import { IMAGES } from "../../Constants/Images";
import { scaleHeight, scaleWidth } from "../../Constants/dynamicSize";
export const fetchingMessages = [
    "Ah, the wonders of the universe! I'm fetching your queries right now.",
    "Just a moment, I'm thinking as fast as light to get your data.",
    "Hold tight! I'm unraveling the mysteries of your request.",
    "Patience, dear friend, even a genius needs a moment to work.",
    "I'm on it! Your queries will be solved with the elegance of E=mc².",
    "Almost there, I'm deciphering the secrets of your data.",
    "Hang on, I'm conducting an experiment to fetch your information.",
    "Please wait, I'm applying the theory of relativity to your queries.",
    "A brief pause while I bring your data from the realm of the unknown.",
    "Stay tuned, I'm orchestrating a symphony of answers for you."
];
export const ImageSource = [
    IMAGES.animation5,
    IMAGES.animation1,
    IMAGES.animation7,
    IMAGES.animation4,
    IMAGES.animation3,
    IMAGES.animation2,
    IMAGES.animation6,
];

export const layout = {
    width: scaleWidth(300),
    height: scaleHeight(200),
    xaxis: {
        tickfont: {
            size: 12,
            color: '#002E47'
        },
        tickformat: "%b %d",
        ticklabelmode: "instant",
        automargin: true,
        showgrid: false,
        zeroline: false,
        linecolor: '#002E47',
        linewidth: 0.2
    },
    yaxis: {
        tickfont: {
            size: 12,
            color: '#002E47'
        },
        title: {
            text: "CO2 Emissions (T)"
        },
        automargin: true,
        showgrid: false,
        zeroline: false,
        linecolor: '#002E47',
        linewidth: 0.2
    },
    font: {
        family: "Arial, sans-serif",
        size: 14,
        color: '#002E47'
    },
    margin: {
        l: 70,
        r: 40,
        t: 40,
        b: 20
    },
    legend: {
        font: {
            size: 12,
            color: '#002E47'
        }
    },
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)"
}