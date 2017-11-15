import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Animated
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/FontAwesome';

import SampleVideo from '../Resources/647597071.mp4';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoCover: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, .9)',
  },
  bufferCover: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  error: {
    backgroundColor: '#000'
  },
  buffering: {
    backgroundColor: '#000'
  },
  header: {
    fontSize: 30,
    backgroundColor: 'transparent',
    color: '#fff'
  },
  input: {
    width: 300,
    height: 50,
    backgroundColor: '#FFF',
    marginVertical: 15,
    paddingLeft: 15,
  }
});

export default class RnVideo extends Component {
  constructor(props){
    super(props);
    this.state = {
      error: false,
      buffering: true,
      animated: new Animated.Value(0)
    };
  }

  handleError = (meta) => {
    const { error : {code}} = meta;
    let error = "An error occurred playing this video";
    switch (code){
      case -11800:
        error = "Could not load video from URL";
        break;
    }
    this.setState({
      error
    });
  };

  handleLoadStart = () => {
    this.triggerBufferAnimation();
  };

  triggerBufferAnimation = () => {
    this.loopingAnimation = Animated.loop(
      Animated.timing(this.state.animated, {
        toValue: 1,
        duration: 350,
      })
    ).start()
  };

  handleBuffer = (meta) => {
    meta.isBuffering && this.triggerBufferAnimation();
    if(this.loopingAnimation && !meta.isBuffering) {
      this.loopingAnimation.stopAnimation();
    }
    this.setState({
      buffering: meta.isBuffering
    })
  };

  render() {
    const windowSize = Dimensions.get("window");
    console.log(windowSize.height);
    // const height = width * 0.5625;
    const {error} = this.state;
    const {buffering} = this.state;
    const interpolatedAnimation =
      this.state.animated.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"]
      });
    const rotateStyle = {
      transform: [
        {rotate: interpolatedAnimation}
      ]
    };

    return (
      <View style={styles.container}>
        <View style={error ? styles.error : (buffering ? styles.buffering : styles.container)}>
          <Video
            source={SampleVideo}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            repeat
            onError={this.handleError}
            onLoadStart={this.handleLoadStart}
            onBuffer={this.handleBuffer}
          />
          <View>
            <Text style={styles.header}>Login</Text>
            <TextInput placeholder="Email" style={styles.input}/>
            <TextInput secureTextEntry placeholder="Password" style={styles.input}/>
          </View>
          <View style={styles.bufferCover}>
            {
              buffering &&
              <Animated.View style={rotateStyle}><Icon name="circle-o-notch" size={30} color="#fff"/></Animated.View>
            }
          </View>
          <View style={{alignSelf: 'center'}}>
            {
              error &&
              <Icon name="exclamation-triangle" size={30} color='red' style={{alignSelf: 'center'}}/>
            }
            {
              error &&
              <Text style={{color: '#fff'}}>{error}</Text>
            }
          </View>
        </View>
      </View>
    );
  }
}