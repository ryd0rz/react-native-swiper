import React from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  sceneContainerBase: {
    flex: 1,
    flexDirection: 'row'
  },
  paginationX: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  paginationY: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  title: {
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    paddingLeft: 10,
    bottom: -30,
    left: 0,
    flexWrap: 'nowrap',
    width: 250,
    backgroundColor: 'transparent',

    borderColor: 'rgb(255,0,0)',
    borderWidth: 1
  },
  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 50,
    color: '#007aff',
    fontFamily: 'Arial'
  },
  activeDot: {
    backgroundColor: '#007aff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  },
  notActiveDot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  }
});

import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';

const window = Dimensions.get('window');

const windowWidth = window.width;
const windowHeight = window.height;

const vw = windowWidth / 100;
const vh = windowHeight / 100;

class Swiper extends React.Component {

  constructor(props) {
    super(props);

    this.onPanResponderMoveH = this.onPanResponderMoveH.bind(this);
    this.onMoveShouldSetPanResponderH = this.onMoveShouldSetPanResponderH.bind(this);
    this.onReleasePanResponderH = this.onReleasePanResponderH.bind(this);

    this.onPanResponderMoveV = this.onPanResponderMoveV.bind(this);
    this.onMoveShouldSetPanResponderV = this.onMoveShouldSetPanResponderV.bind(this);
    this.onReleasePanResponderV = this.onReleasePanResponderV.bind(this);

    const offset = props.horizontal ? this.getScrollPageOffsetH() : this.getScrollPageOffsetV();

    this.vxThreshold = Platform.os === 'ios' ? 0.5 : 0.0000001;

    const totalChildren = Array.isArray(props.children) ? props.children.length || 1 : 0;

    this.state = {
      index: props.index,
      total: totalChildren,
      scrollValue: new Animated.Value(props.index),
      dir: props.horizontal === false ? 'y' : 'x'
    };

    this.state.scrollValue.setOffset(offset);

    if (props.horizontal) {
      this.panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponderH,
        onPanResponderRelease: this.onReleasePanResponderH,
        onPanResponderTerminate: this.onReleasePanResponderH,
        onPanResponderMove: this.onPanResponderMoveH
      });
    } else {
      this.panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponderV,
        onPanResponderRelease: this.onReleasePanResponderV,
        onPanResponderTerminate: this.onReleasePanResponderV,
        onPanResponderMove: this.onPanResponderMoveV
      });
    }
  }

  componentDidMount() {
    this.autoplay();
  }

  onReleasePanResponderH(e, gestureState) {
    const relativeGestureDistance = gestureState.dx / windowWidth;
    const { vx } = gestureState;

    const newIndex = this.updateIndex(this.state.index, vx, relativeGestureDistance);

    this.scrollTo(newIndex);
  }

  onReleasePanResponderV(e, gestureState) {
    const relativeGestureDistance = gestureState.dy / windowHeight;
    const { vy } = gestureState;

    const newIndex = this.updateIndex(this.state.index, vy, relativeGestureDistance);

    this.scrollTo(newIndex);
  }

  onMoveShouldSetPanResponderH(e, gestureState) {
    const { threshold, scrollEnabled } = this.props;

    if (!scrollEnabled) {
      return false;
    }

    if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
      this.props.onScrollBeginDrag();
      return true;
    }

    if (threshold - Math.abs(gestureState.dx) > 0) {
      return false;
    }
    return false;
  }

  onMoveShouldSetPanResponderV(e, gestureState) {
    const { threshold, scrollEnabled } = this.props;

    if (!scrollEnabled) {
      return false;
    }

    if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
      this.props.onScrollBeginDrag();
      return true;
    }

    if (threshold - Math.abs(gestureState.dy) > 0) {
      return false;
    }
    return false;
  }

  onPanResponderMoveH(e, gestureState) {
    const dx = gestureState.dx;
    const offsetX = -dx / this.props.pageWidth + this.state.index;

    if (offsetX >= 0 && offsetX < this.props.children.length - 1) {
      this.state.scrollValue.setValue(offsetX);
    }
  }

  onPanResponderMoveV(e, gestureState) {
    const dy = gestureState.dy;
    const offsetY = -dy / this.props.pageHeight + this.state.index;

    if (offsetY >= 0 && offsetY < this.props.children.length - 1) {
      this.state.scrollValue.setValue(offsetY);
    }
  }

  onScrollEnd(status) {
    this.props.onMomentumScrollEnd(null, status, this);

    setTimeout(() => {
      this.autoplay();
    });
  }

  getScrollPageOffsetH() {
    if (this.props.pageWidth === windowWidth) {
      return 0;
    }
    const offsetWindowRatio = (windowWidth - this.props.pageWidth) / vw / 2 / 100;
    const scaleToPageRatio = windowWidth / this.props.pageWidth;

    return -offsetWindowRatio * scaleToPageRatio;
  }

  getScrollPageOffsetV() {
    if (this.props.pageHeight === windowHeight) {
      return 0;
    }
    const offsetWindowRatio = (windowHeight - this.props.pageHeight) / vh / 2 / 100;
    const scaleToPageRatio = windowHeight / this.props.pageHeight;

    return -offsetWindowRatio * scaleToPageRatio;
  }

  updateIndex(index, vx, relativeGestureDistance) {
    const distanceThreshold = 0.5;

    if (relativeGestureDistance < -distanceThreshold ||
        (relativeGestureDistance < 0 && vx <= -this.vxThreshold)) {
      return index + 1;
    }

    if (relativeGestureDistance > distanceThreshold ||
        (relativeGestureDistance > 0 && vx >= this.vxThreshold)) {
      return index - 1;
    }
    return index;
  }

  scrollTo(pageNumber) {
    //    const newPageNumber = Math.max(0, Math.min(pageNumber, this.props.children.length - 1));
    if (this.props.loop || (pageNumber >= 0 && pageNumber < this.state.total)) {
      const newPageNumber = pageNumber >= 0 ? pageNumber % this.state.total : this.props.children.length - 1;
      this.setState({
        index: newPageNumber
      });

      Animated.timing(this.state.scrollValue,
                      { toValue: newPageNumber, duration: this.props.scrollDurationMs }).start();

      const status = Object.assign({}, this.state, { index: newPageNumber });

      this.onScrollEnd(status);
    }
  }

  scrollBy(indexOffset) {
    this.scrollTo(this.state.index + indexOffset);
  }

  autoplay() {
    if (!Array.isArray(this.props.children) || !this.props.autoplay) {
      return;
    }

    clearTimeout(this.autoplayTimer);

    this.autoplayTimer = setTimeout(() => {
      this.scrollBy(this.props.autoplayDirection ? 1 : -1);
    }, this.props.autoplayTimeout * 1000);
  }

  renderDotPagination() {
    // By default, dots only show when `total` > 2
    if (this.state.total <= 1) {
      return null;
    }

    let dots = [];
    const ActiveDot = this.props.activeDot || <View style={styles.activeDot} />;
    const Dot = this.props.dot || <View style={styles.notActiveDot} />;

    for (let i = 0; i < this.state.total; i++) {
      dots.push(i === this.state.index ? React.cloneElement(ActiveDot, { key: i }) : React.cloneElement(Dot, { key: i })
      );
    }

    return (
      <View
        pointerEvents={'none'}
        style={[styles[`pagination${this.state.dir.toUpperCase()}`],
                this.props.paginationStyle]}
      >
        {dots}
      </View>
    );
  }

  renderPagination() {
    if (!this.props.showsPagination) {
      return null;
    }

    if (this.props.renderPagination) {
      return this.props.renderPagination(this.state.index, this.props.children.length);
    }
    return this.renderDotPagination();
  }

  renderTitle() {
    const child = this.props.children[this.state.index];
    const title = child && child.props && child.props.title;

    return title ? (
      <View style={styles.title}>
        {this.props.children[this.state.index].props.title}
      </View>
    ) : null;
  }

  renderNextButton() {
    let button = null;

    if (this.props.loop || this.state.index !== this.state.total - 1) {
      button = this.props.nextButton || <Text style={styles.buttonText}>›</Text>;
    }

    return (
      <TouchableOpacity onPress={() => button !== null && this.scrollBy.bind(this, 1)}>
        <View>
          {button}
        </View>
      </TouchableOpacity>
    );
  }

  renderPrevButton() {
    let button = null;

    if (this.props.loop || this.state.index !== 0) {
      button = this.props.prevButton || <Text style={styles.buttonText}>‹</Text>;
    }

    return (
      <TouchableOpacity onPress={() => button !== null && this.scrollBy.bind(this, -1)}>
        <View>
          {button}
        </View>
      </TouchableOpacity>
    );
  }

  renderButtons() {
    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.buttonWrapper,
          { width: windowWidth, height: windowHeight },
          this.props.buttonWrapperStyle
        ]}
      >
        {this.renderPrevButton()}
        {this.renderNextButton()}
      </View>
    );
  }

  render() {
    const pageStyle = {
      width: this.props.pageWidth,
      height: this.props.pageHeight,
      backgroundColor: 'transparent'
    };

    const pages = this.props.children.map((page, index) => (
      <View style={pageStyle} key={index}>{page}</View>));

    const translateX = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -this.props.pageWidth]
    });

    const translateY = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -this.props.pageHeight]
    });

    const transform =
    this.props.horizontal ? { transform: [{ translateX }] } : { transform: [{ translateY }] };

    const sceneContainerStyle = {
      flex: 1,
      flexDirection: this.props.horizontal ? 'row' : 'column',
      width: this.props.horizontal ? this.props.pageWidth * this.props.children.length : null,
      height: this.props.horizontal ? null : this.props.pageHeight * this.props.children.length
    };

    return (
      <View
        style={styles.container}
      >
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[sceneContainerStyle, transform]}
        >
          {pages}
        </Animated.View>
        {this.props.showsPagination && this.renderPagination()}
        {this.renderTitle()}
        {this.props.showsButtons && this.renderButtons()}
      </View>
    );
  }

}

Swiper.propTypes = {
  activeDot: React.PropTypes.element,
  autoplay: React.PropTypes.bool,
  autoplayDirection: React.PropTypes.bool,
  autoplayTimeout: React.PropTypes.number,
  buttonWrapperStyle: React.PropTypes.object,
  children: React.PropTypes.node.isRequired,
  dot: React.PropTypes.element,
  horizontal: React.PropTypes.bool,
  index: React.PropTypes.number,
  loop: React.PropTypes.bool,
  nextButton: React.PropTypes.element,
  onMomentumScrollEnd: React.PropTypes.func,
  onScrollBeginDrag: React.PropTypes.func,
  pageHeight: React.PropTypes.number,
  pageWidth: React.PropTypes.number,
  paginationStyle: React.PropTypes.object,
  prevButton: React.PropTypes.element,
  renderPagination: React.PropTypes.func,
  scrollDurationMs: React.PropTypes.number,
  scrollEnabled: React.PropTypes.bool,
  showsButtons: React.PropTypes.bool,
  showsPagination: React.PropTypes.bool,
  threshold: React.PropTypes.number
};

Swiper.defaultProps = {
  index: 0,
  threshold: 25,
  onMomentumScrollEnd: () => {},
  scrollDurationMs: 250,
  renderPagination: null,
  onScrollBeginDrag: () => {},
  scrollEnabled: true,
  pageWidth: windowWidth,
  pageHeight: windowHeight,
  horizontal: true,
  loop: true,
  autoplay: true,
  autoplayDirection: true,
  autoplayTimeout: 2.5,
  buttonWrapperStyle: {},
  prevButton: null,
  nextButton: null,
  showsButtons: true,
  showsPagination: false
};

reactMixin.onClass(Swiper, TimerMixin);

module.exports = Swiper;
