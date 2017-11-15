import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import Video from 'react-native-video';
import SampleVideo from '../Resources/792677592.mp4';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  text: {
    color: '#fff'
  },
});

export default class RnVideo extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Video
          source={SampleVideo}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          repeat={true}
        />
      </View>
    );
  }
}