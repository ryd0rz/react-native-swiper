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

    this.vxThreshold = Platform.os === 'ios' ? 0.5 : 0.03;

    const totalChildren = Array.isArray(props.children) ? props.children.length || 1 : 0;

    this.state = {
      index: props.index,
      total: totalChildren,
      scrollValue: new Animated.Value(props.index),
      dir: props.horizontal === false ? 'y' : 'x'
    };

    this.state.scrollValue.setOffset(offset);

    let prevScrollResponder = null;
    this.state.scrollValue
      .addListener((scrollResponder) => {
        if (prevScrollResponder === null || prevScrollResponder.value !== scrollResponder.value) {
          if (scrollResponder.value === this.state.index) {
            this.onScrollEnd(this.state);
          }
        }
        prevScrollResponder = JSON.parse(JSON.stringify(scrollResponder));
      });

    if (props.horizontal) {
      this.panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponderH,
        onPanResponderRelease: this.onReleasePanResponderH,
        onPanResponderTerminate: this.onReleasePanResponderH,
        onPanResponderMove: this.onPanResponderMoveH
      });
    } else {
      this.panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponderV.bind(this),
        onPanResponderRelease: this.onReleasePanResponderV.bind(this),
        onPanResponderTerminate: this.onPanResponderTerminateV.bind(this),
        onPanResponderMove: this.onPanResponderMoveV.bind(this)
      });
    }
  }

  componentDidMount() {
    this.autoplay();
  }

  componentWillReceiveProps(nextProps, nextState) {
    const totalChildren = Array.isArray(nextProps.children) ? nextProps.children.length || 1 : 0;
    this.setState({ total: totalChildren }, () => {
      if (this.props.index !== nextProps.index && nextProps.index !== this.state.index) {
        this.scrollTo(nextProps.index, false);
      }
    });
  }

  componentWillUnmount() {
    this.state.scrollValue.removeAllListeners();
  }

  onReleasePanResponderH(e, gestureState) {
    const relativeGestureDistance = gestureState.dx / windowWidth;
    const { vx } = gestureState;

    const newIndex = this.updateIndex(this.state.index, vx, relativeGestureDistance);
    
    this.scrollTo(newIndex, false);
  }

  onReleasePanResponderV(e, gestureState) {
    const relativeGestureDistance = gestureState.dy / windowHeight;
    const { vy } = gestureState;

    const newIndex = this.updateIndex(this.state.index, vy, relativeGestureDistance);

    this.scrollTo(newIndex, false);
  }

  onPanResponderTerminateV(e, gestureState) {
    const relativeGestureDistance = gestureState.dy / windowHeight;
    const { vy } = gestureState;

    const newIndex = this.updateIndex(this.state.index, vy, relativeGestureDistance);

    this.scrollTo(newIndex, false);
  }

  onMoveShouldSetPanResponderH(e, gestureState) {
    const { threshold, scrollEnabled, responderTaken } = this.props;

    if (!scrollEnabled || responderTaken()) {
      return false;
    }

    if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
      if ((gestureState.dx < 0 && !this.props.disableLeftSwipe) || gestureState.dx > 0 && !this.props.disableRightSwipe) {
        this.props.onScrollBeginDrag();
        return true;
      }
    }

    return false;
  }

  onMoveShouldSetPanResponderV(e, gestureState) {
    const { threshold, scrollEnabled, responderTaken } = this.props;

    if (!scrollEnabled || responderTaken()) {
      return false;
    }

    if (threshold - Math.abs(gestureState.dy) > 0) {
      return false;
    }

    if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
      this.props.onScrollBeginDrag();
      return true;
    }

    return false;
  }

  onPanResponderMoveH(e, gestureState) {
    const dx = gestureState.dx;
    const offsetX = -dx / this.props.pageWidth + this.state.index;
    if ((gestureState.dx < 0 && this.props.disableLeftSwipe !== true) || gestureState.dx > 0 && this.props.disableRightSwipe !== true) {
      if (offsetX >= 0 && offsetX < this.props.children.length - 1) {
        this.state.scrollValue.setValue(offsetX);
      }
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
  }

  onTouchEnd(status) {
    this.props.onMomentumTouchEnd(null, status, this);
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
      if (!this.props.disableLeftSwipe) {
        if (!this.shouldDisableLeftNavigation(index)) {
          return index + 1;
        } else if (this.props.shakeSwipedDisabledNavigation) {
          // TODO: callback for spring animation
        }
      }
    }

    if (relativeGestureDistance > distanceThreshold ||
        (relativeGestureDistance > 0 && vx >= this.vxThreshold)) {
      if (!this.props.disableRightSwipe) {
        if (!this.props.disableRightNavigation) {
          return index - 1;
        } else if (this.props.shakeSwipedDisabledNavigation) {
          // TODO: callback for spring animation
        }
      }
    }
    return index;
  }

  scrollTo(pageNumber, forceScroll) {
    // const newPageNumber = Math.max(0, Math.min(pageNumber, this.props.children.length - 1));
    if (this.props.loop || (pageNumber >= 0 && pageNumber < this.state.total) || forceScroll) {
      const newPageNumber = pageNumber >= 0 ? pageNumber % this.state.total : this.props.children.length - 1;
      const oldPageNumber = this.state.index;
      this.setState({ index: newPageNumber }, () => {
        if (!forceScroll && this.shouldDisableLeftNavigation(oldPageNumber) && oldPageNumber < newPageNumber) {
          setTimeout(() => {
            this.scrollTo(oldPageNumber, true);
          }, (this.props.scrollDurationMs / 2));
        } else if (!forceScroll && this.props.disableRightNavigation && oldPageNumber < newPageNumber) {
          setTimeout(() => {
            this.scrollTo(oldPageNumber, true);
          }, (this.props.scrollDurationMs / 2));
        }
      });

      Animated.timing(this.state.scrollValue, { toValue: newPageNumber, duration: this.props.scrollDurationMs }).start();

      const status = Object.assign({}, this.state, { index: newPageNumber });

      this.onTouchEnd(status);
    }
  }

  scrollBy(indexOffset) {
    this.scrollTo((this.state.index + indexOffset), false);
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

  shouldDisableLeftNavigation(index) {
    if (typeof this.props.disableLeftNavigation === 'boolean') {
      return this.props.disableLeftNavigation;
    }
    if (this.props.disableLeftNavigation && Array.isArray(this.props.disableLeftNavigation)) {
      if (this.props.disableLeftNavigation[index]) {
        return this.props.disableLeftNavigation[index];
      }
      return false;
    }
    return false;
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

    if (this.props.loop || (this.state.index !== (this.state.total - 1) && !this.props.disableLeftSwipe)) {
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

    if (this.props.loop || (this.state.index !== 0 && !this.props.disableRightSwipe)) {
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
  disableLeftNavigation: React.PropTypes.any,
  disableRightNavigation: React.PropTypes.bool,
  disableLeftSwipe: React.PropTypes.bool,
  disableRightSwipe: React.PropTypes.bool,
  dot: React.PropTypes.element,
  horizontal: React.PropTypes.bool,
  index: React.PropTypes.number,
  loop: React.PropTypes.bool,
  nextButton: React.PropTypes.element,
  onMomentumScrollEnd: React.PropTypes.func,
  onMomentumTouchEnd: React.PropTypes.func,
  onScrollBeginDrag: React.PropTypes.func,
  pageHeight: React.PropTypes.number,
  pageWidth: React.PropTypes.number,
  paginationStyle: React.PropTypes.object,
  prevButton: React.PropTypes.element,
  renderPagination: React.PropTypes.func,
  responderTaken: React.PropTypes.func,
  scrollDurationMs: React.PropTypes.number,
  scrollEnabled: React.PropTypes.bool,
  shakeSwipedDisabledNavigation: React.PropTypes.bool,
  showsButtons: React.PropTypes.bool,
  showsPagination: React.PropTypes.bool,
  threshold: React.PropTypes.number
};

Swiper.defaultProps = {
  disableLeftSwipe: false,
  disableRightSwipe: false,
  disableLeftNavigation: false,
  disableRightNavigation: false,
  shakeSwipedDisabledNavigation: false,
  index: 0,
  threshold: 65,
  onMomentumScrollEnd: () => {},
  onMomentumTouchEnd: () => {},
  scrollDurationMs: 250,
  renderPagination: null,
  onScrollBeginDrag: () => {},
  scrollEnabled: true,
  responderTaken: () => { return false; },
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
