import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/FontAwesome';
import SampleVideo from '../Resources/792677592.mp4';
import ProgressBar from 'react-native-progress/Bar';

const THRESHOLD = 150;

secondToTime = (time) => {
  return ~~(time/60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
};

export default class RnVideo extends Component {
  constructor(props){
    super(props);
    this.state = {
      error: false,
      buffering: true,
      animated: new Animated.Value(0),
      paused: true,
      duration: 0,
      progress: 0,
    };
    this.position = {
      start: null,
      end: null
    };
    this.animated = new Animated.Value(0);
  }

  componentWillMount(){
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => {
        this.triggerShowHide();
        return false;
      }
    });
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

  handleVideoLayout = (e) => {
    const {height} = Dimensions.get("window");
    this.position.start = e.nativeEvent.layout.y + THRESHOLD;
    this.position.end = e.nativeEvent.layout.y + height + THRESHOLD*2;
  };

  handleScroll = (e) => {
    const scrollPosition = e.nativeEvent.contentOffset.y;
    const paused = this.state.paused;
    const {start, end} = this.position;
    if(scrollPosition > start && scrollPosition < end && paused){
      this.setState({paused: false});
    } else if((scrollPosition > end || scrollPosition < start) && !paused) {
      this.setState({paused: true});
    }
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

  handleLoad = (meta) => {
    this.triggerShowHide();
    this.setState({
      duration: meta.duration
    });
  };

  handleProgress = (progress) => {
    this.setState({
      progress: progress.currentTime / this.state.duration
    });
  };

  handleEnd = (e) => {
    this.setState({
      paused: true
    });
  };

  handleMainButtonTouch = () => {
    if(this.state.progress >= 1) {
      this.player.seek(0);
    }
    this.setState(state => {
      return {
        paused: !state.paused
      };
    });
  };

  handleProgressPress = (e) => {
    const position = e.nativeEvent.locationX;
    const progress = (position /250.0) * this.state.duration;
    this.player.seek(progress);
  };

  triggerShowHide = () => {
    clearTimeout(this.hideTimeout);

    Animated.timing(this.animated, {
      toValue: 1,
      duration: 100,
    }).start();

    this.hideTimeout = setTimeout(() => {
      Animated.timing(this.animated, {
        toValue: 0,
        duration: 300
      }).start();
    }, 1500);
  };

  render() {
    // const windowSize = Dimensions.get("window");
    const {width} = Dimensions.get("window");
    const height = width * 0.5625;
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

    const interpolatedControls = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [48, 0],
    });

    const controlHideStyle = {
      transform: [
        {
          translateY: interpolatedControls
        }
      ]
    };

    return (
        <ScrollView scrollEventThrottle={16} onScroll={this.handleScroll}>
          <View style={styles.fakeContent}>
            <Text>{this.state.paused ? "Paused" : "Playing"}</Text>
          </View>
          <View
            {...this.panResponder.panHandlers}
            style={error ? styles.error : (buffering ? styles.buffering : styles.container)}
          >
            <Video
              source={SampleVideo}
              resizeMode="contain"
              style={{width: "100%", height}}
              repeat
              onError={this.handleError}
              onLoadStart={this.handleLoadStart}
              onBuffer={this.handleBuffer}
              paused={this.state.paused}
              onLayout={this.handleVideoLayout}
              onLoad={this.handleLoad}
              onProgress={this.handleProgress}
              onEnd={this.handleEnd}
              ref={ref => this.player = ref}
            />
            <Animated.View style={[styles.controls, controlHideStyle]}>
              <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
                <Icon name={!this.state.paused ? "pause" : "play"} size={30} color="#fff" />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={this.handleProgressPress}>
                <View>
                  <ProgressBar
                    progress={this.state.progress}
                    color="#fff"
                    unfilledColor="rgba(255,255,255,.5)"
                    borderColor="#fff"
                    width={250}
                    height={20}
                  />
                </View>
              </TouchableWithoutFeedback>
              <Text style={styles.duration}>
                {secondToTime(Math.floor(this.state.progress * this.state.duration))}
              </Text>
            </Animated.View>
            {/*<View>*/}
              {/*<Text style={styles.header}>Login</Text>*/}
              {/*<TextInput placeholder="Email" style={styles.input}/>*/}
              {/*<TextInput secureTextEntry placeholder="Password" style={styles.input}/>*/}
            {/*</View>*/}
            {/*<View style={styles.bufferCover}>*/}
              {/*{*/}
                {/*buffering &&*/}
                {/*<Animated.View style={rotateStyle}><Icon name="circle-o-notch" size={30} color="#fff"/></Animated.View>*/}
              {/*}*/}
            {/*</View>*/}
            {/*<View style={{alignSelf: 'center'}}>*/}
              {/*{*/}
                {/*error &&*/}
                {/*<Icon name="exclamation-triangle" size={30} color='red' style={{alignSelf: 'center'}}/>*/}
              {/*}*/}
              {/*{*/}
                {/*error &&*/}
                {/*<Text style={{color: '#fff'}}>{error}</Text>*/}
              {/*}*/}
            {/*</View>*/}
          </View>
          <View style={styles.fakeContent}>
            <Text>{this.state.paused ? "Paused" : "Playing"}</Text>
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
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
  },
  fakeContent: {
    height: 850,
    backgroundColor: '#CCC',
    paddingTop: 250,
    alignItems: 'center',
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 48,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  duration: {
    color: "#FFF",
    marginLeft: 15,
  },
});