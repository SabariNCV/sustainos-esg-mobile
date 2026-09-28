import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { COLORS } from '../../../Constants/colors'

const Shapes = (props) => {
  const data = props?.data

  const customhtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
  <meta name="viewport"  content="width=300", initial-scale=-2.0">
    <title>Boxes</title>
    <style>
    .square {
      position: absolute;
      border: 2px solid;
      font-family: 'Open Sans', sans-serif;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      display: flex; /* Added */
      justify-content: center; /* Added */
      align-items: center; /* Added */
    }
    
    .line-shape {
      position: absolute;
      background-color: rgba(133, 174, 251, 1);
      outline: 2px solid #E01212;
    }
    
    .arrow-shape {
      position: absolute;
      background-color: rgba(59, 181, 220, 1);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      outline: 2px solid rgba(59, 181, 220, 1);
    }
    </style>
  </head>
  <body>
  
    <div id="034b2bd0-1add-414c-81b5-5115ecb67a0a" class="square" style="left: 544px; top: 352px; width: 212px; height: 87px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(35, 32, 32, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      WET POZZOLANA
    </div>
  
    <div id="0e973e01-f3f2-47fd-a411-8db70fdc32e2" class="square" style="left: 1083px; top: 498px; width: 229px; height: 91px; border-color: #000; background-color: rgba(254, 51, 0, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(35, 32, 32, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      INSUFFICIENT MILL GRINDING
    </div>
  
    <div id="332d24da-e037-4e16-9d98-bbd3b27dbc37" class="square" style="left: 537px; top: 505px; width: 216px; height: 83px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(31, 28, 28, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      MILL AIRFLOW INSUFFICIENT
    </div>
  
    <div id="3ad8533e-0632-487a-ac63-11928f413c2f" class="square" style="left: 1178px; top: 185px; width: 253px; height: 87px; border-color: #000; background-color: rgba(254, 51, 0, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(7, 7, 7, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      LOW CONSUMPTION OF POZZOLANA
    </div>
  
    <div id="400482a3-f0bf-4b15-8b19-d8f2b21c1d03" class="square" style="left: 1078px; top: 347px; width: 237px; height: 86px; border-color: #000; background-color: rgba(254, 51, 0, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(7, 7, 7, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      INSUFFICIENT CEMENT FINENESS
    </div>
  
    <div id="42b79394-27be-4721-80ad-4ad22aac015e" class="square" style="left: 262px; top: 509px; width: 200px; height: 79px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(49, 47, 47, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      MILL WEAR
    </div>
  
    <div id="492f33ab-b086-47dd-8619-964db9fda085" class="square" style="left: 566px; top: 194px; width: 245px; height: 76px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(7, 7, 7, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      HIGH CARBON FUEL
    </div>
  
    <div id="5efb8efd-6f52-4459-b25a-aae1828e2032" class="square" style="left: 840px; top: 496px; width: 221px; height: 94px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(39, 36, 36, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      SEPARATOR MALFUNCTION
    </div>
  
    <div id="6292ab60-7210-4965-b915-163c06d9fb7d" class="square" style="left: 317px; top: 358px; width: 193px; height: 82px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(32, 30, 30, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      LOW REACTIVE POZZOLANA
    </div>
  
    <div id="871e6ae0-b1f9-4e33-8775-4b58682714e8" class="square" style="left: 889px; top: 191px; width: 273px; height: 82px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(25, 21, 21, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      HIGH SPECIFIC POWER CONSUMPTION
    </div>
  
    <div id="9d92824f-6124-4470-813c-d4efce05ab07" class="square" style="left: 267px; top: 194px; width: 200px; height: 72px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(7, 7, 7, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      HIGH LSF / CAO
    </div>
  
    <div id="b58d4df9-6145-4ca8-9510-9c405d0f4d7f" class="square" style="left: 835px; top: 348px; width: 225px; height: 87px; border-color: #000; background-color: rgba(29, 255, 51, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(32, 28, 28, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      HIGH QUALITY CEMENT DEMAND
    </div>
  
    <div id="bcb48b04-c9e3-4f27-86ca-1c3e9949404d" class="square" style="left: 513px; top: 29px; width: 698px; height: 69px; border-color: #000; background-color: rgba(254, 51, 0, 1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); color: rgba(7, 7, 7, 1); border-radius: 0; border-top-left-radius: 15px; border-top-right-radius: 15px;">
      CARBON FOOTPRINT ON HIGHER SIDE - CEMENT SCOPE 1
    </div>
    
    <div class="line-shape" id="0e15fb3b-79e4-435d-a709-2b86be46bc11" style="width: 904px; height: 4px; top: 304px; left: 410px; transform: rotate(0deg);"></div>
    <div class="line-shape" id="2f0576aa-9d1b-4cae-afff-ac34c8f8700e" style="width: 948px; height: 5px; top: 146px; left: 362px; transform: rotate(0deg);"></div>
    <div class="line-shape" id="c279f415-1d36-412b-9e39-fa5c8762362c" style="width: 43px; height: 8px; top: 119px; left: 812px; transform: rotate(89.9778deg);"></div>
    <div class="line-shape" id="d605af92-f08d-4d34-b622-cfb311db7d16" style="width: 33px; height: 6px; top: 286px; left: 1295px; transform: rotate(89.6577deg);"></div>
    <div class="line-shape" id="e2772ba8-4d47-4478-956a-21252c17c137" style="width: 843px; height: 5px; top: 461px; left: 361px; transform: rotate(0deg);"></div>

    <div class="arrow-shape" id="0e9fb87c-4b24-4a0b-ae2a-2536695ae762" style="width: 53px; height: 6px; top: -81px; left: -478px; transform: rotate(90.7483deg);"></div>
    <div class="arrow-shape" id="23c5edb9-8beb-45ce-bb2b-7f02a191c6ed" style="width: 50px; height: 20px; top: 162px; left: 339px; transform: rotate(88.7096deg);"></div>
    <div class="arrow-shape" id="3388931e-b6f5-4598-a284-df48755f9954" style="width: 41px; height: 20px; top: 474px; left: 625px; transform: rotate(91.08deg);"></div>
    <div class="arrow-shape" id="3b33d55c-43bb-4d30-904a-29fc45d081d2" style="width: 53px; height: 6px; top: -81px; left: -796px; transform: rotate(90deg);"></div>
    <div class="arrow-shape" id="3d6668b0-c2bb-4e0a-abdf-dee67cb7b4b6" style="width: 33px; height: 20px; top: 471px; left: 934px; transform: rotate(89.0047deg);"></div>
    <div class="arrow-shape" id="4c72d67a-17d2-461a-ab38-23705763442a" style="width: 40px; height: 17px; top: 158px; left: 1288px; transform: rotate(90.6039deg);"></div>
    <div class="arrow-shape" id="7cee9c8b-59bd-4efa-86a3-c09527234afc" style="width: 45px; height: 20px; top: 317px; left: 922px; transform: rotate(89.6645deg);"></div>
    <div class="arrow-shape" id="8fbec75e-b22e-47c0-8888-62213a4afc5e" style="width: 48px; height: 20px; top: 474px; left: 338px; transform: rotate(89.636deg);"></div>
    <div class="arrow-shape" id="a918d88b-6328-492d-ab90-4ffc7de2c5c1" style="width: 43px; height: 20px; top: 162px; left: 1000px; transform: rotate(89.6033deg);"></div>
    <div class="arrow-shape" id="b7c235b6-2896-4c5e-aec8-4e3cb9acaf2c" style="width: 41px; height: 6px; top: 103px; left: -693px; transform: rotate(90.8419deg);"></div>
    <div class="arrow-shape" id="bcd6339d-7c75-4556-9153-0397b1d22a11" style="width: 65px; height: 20px; top: 455px; left: 1170px; transform: rotate(89.7514deg);"></div>
    <div class="arrow-shape" id="d382cd34-07ed-4e77-ab13-1bf515b1a181" style="width: 44px; height: 20px; top: 317px; left: 1177px; transform: rotate(89.8548deg);"></div>
    <div class="arrow-shape" id="d7131acf-86f4-4c10-8756-a6e34171b86b" style="width: 52px; height: 20px; top: 321px; left: 386px; transform: rotate(90.6066deg);"></div>

  </body>
  </html>`

  const CustomHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport"  content="width=300", initial-scale=-2.0">
  <title>Dynamic HTML from JSON</title>
  <style>
  .shape {
  position: absolute;
  border: 2px solid black;
  box-sizing: border-box;
  }
  .square {
  background-color: rgba(133, 174, 251, 1);
  }
  .circle {
  background-color: rgba(29, 255, 51, 1);
  border-radius: 50%;
  }
  .triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 43.3px solid rgba(59, 181, 220, 1);
  }
  .arrow {
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-right: 40px solid rgba(255, 0, 0, 1);
  }
  .line {
  border-bottom: 2px solid rgba(255, 0, 0, 1);
  width: 100px;
  }
  </style>
  </head>
  <body>
  <div id="shapes-container"></div>
  <script>
  // JSON data provided
  var jsonData = ${JSON.stringify(props?.data)}
  
  function generateShapesHTML(data) {
  var shapesContainer = document.getElementById('shapes-container');
  
  // Iterate over each shape type
  for (var shapeType in data) {
  // Iterate over each shape in the type
  for (var shapeId in data[shapeType]) {
    var shapeData = data[shapeType][shapeId].dataIs;
    var shapeHTML = '';
  
    // Generate HTML based on shape type
    switch (shapeType) {
  
      case 'squareShape':
      var textLeft = 20
      var textTop = 20
      // Generate HTML for square shape with text
      shapeHTML = 
      '<div class="shape square" style="width:' + shapeData.width + 'px; height:' + shapeData.height + 'px; background-color:' + shapeData.SquareBg + '; left:' + shapeData.position.x + 'px; top:' + shapeData.position.y + 'px; position: absolute; font-size: 20px; color: ' + shapeData.fontColor + ';font-family: Arial, sans-serif; font-weight: bold; ">' + shapeData.squareText +
      '</div>';
      
      break;
  
      case 'arrowShape':
      var arrowData = jsonData.arrowShape[shapeId].dataIs;
      shapeHTML = '<div class="shape arrow" style="transform: rotate(' + arrowData.angle + 'deg); left:' + arrowData.position.x + 'px; top:' + arrowData.position.y + 'px; position: absolute; width: ' + arrowData.width + 'px; height: ' + arrowData.height + 'px; border-color: ' + arrowData.border + ';"></div>';
      break;
  
      case 'lineShape':
      var lineData = jsonData.lineShape[shapeId].dataIs;
      shapeHTML = '<div class="shape line" style="width:' + lineData.width + 'px; transform: rotate(' + lineData.angle + 'deg); left:' + lineData.position.x + 'px; top:' + lineData.position.y + 'px; position: absolute; height: ' + lineData.height + 'px; background-color: ' + lineData.SquareOutlineBg + ';"></div>';
      break;
    }
    
    // Append the generated HTML to the container
    shapesContainer.innerHTML += shapeHTML;
  }
  }
  }
  // Call the function to generate shapes HTML
  generateShapesHTML(jsonData);
  </script>
  </body>
  </html>`

  return (
    <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{marginVertical: scaleHeight(20),width: scaleWidth(340),left: scaleWidth(20),backgroundColor: COLORS.WHITE }}>
      <WebView
        source={{ html: customhtml }}
        style={{ height: scaleHeight(200), width: scaleWidth(380),right: scaleWidth(50) }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsHorizontalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default Shapes;
