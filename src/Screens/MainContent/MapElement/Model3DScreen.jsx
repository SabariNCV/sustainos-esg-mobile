import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber/native';
import Model from './src/components/Model';
import useControls from 'r3f-native-orbitcontrols';
import { useNavigation } from '@react-navigation/native';
import Trigger from './src/components/Trigger';
import Loader from './src/components/Loader';

const Model3DScreen = () => {
  const navigation = useNavigation();

  const [OrbitControls, events] = useControls();
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.modelContainer} {...events}>
      {loading && <Loader />}
      <Canvas>
        <OrbitControls enablePan={false} />
        <directionalLight position={[1, 0, 0]} args={['white', 5]} />
        <directionalLight position={[-1, 0, 0]} args={['white', 5]} />
        <directionalLight position={[0, 0, 1]} args={['white', 5]} />
        <directionalLight position={[0, 0, -1]} args={['white', 5]} />
        <directionalLight position={[0, 1, 0]} args={['white', 5]} />
        <directionalLight position={[0, -1, 0]} args={['white', 5]} />
        <Suspense fallback={<Trigger setLoading={setLoading} />}>
          <Model />
        </Suspense>
      </Canvas>
    </View>

  );
};

export default Model3DScreen;

const styles = StyleSheet.create({
 
  modelContainer: {
    Height:100,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  textContainer: {
    margin: 20,
    marginBottom: 0,
  },
  textTitle: {
    fontSize: 28,
    color: '#051E47',
    fontWeight: 'bold',
  },
  textPrice: {
    fontSize: 28,
    color: '#3F6900',
    fontWeight: 'bold',
  },
  text: {
    color: 'black',
    fontSize: 16,
    textAlign: 'justify',
    marginVertical: 10,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3F6900',
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  textButton: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
