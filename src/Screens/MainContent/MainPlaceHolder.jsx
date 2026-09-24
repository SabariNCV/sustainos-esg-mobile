import React from 'react';
import { Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const MainPlaceHolder = props => {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item
        flex={1}
        width={Dimensions.get('window').width / 1.05}
        borderWidth={1}
        borderColor="#ECECEC"
        padding={10}
        marginHorizontal={1}
        paddingBottom={props?.bottom}
        borderRadius={props?.radius}
        alignSelf="center"
        marginTop={props?.topSpace ? props?.topSpace : 0}>
        <SkeletonPlaceholder.Item flexDirection="row">
          <SkeletonPlaceholder.Item flexDirection="column">
            <SkeletonPlaceholder.Item
              width={Dimensions.get('window').width / 1.15}
              height={25}
              marginLeft={5}
              borderRadius={0}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          alignSelf="center"
          marginTop={35}
          width={Dimensions.get('window').width / 1.05}
          height={1}
        />
        <SkeletonPlaceholder.Item
          marginTop={10}
          width={Dimensions.get('window').width / 1.15}
          height={props?.height}
          alignSelf="center"
          borderRadius={0}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default MainPlaceHolder;