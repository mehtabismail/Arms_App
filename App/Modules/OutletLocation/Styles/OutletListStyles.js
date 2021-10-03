import React, {Component} from 'react';
import { Dimensions, Platform } from 'react-native';
import {Metrics, Colors, Fonts, ApplicationStyles} from '../../../Themes';

const { width, height } = Dimensions.get("window");

const OutletListContainer = {
  header: {
    width: '100%',
    backgroundColor: Colors.primary, 
    padding: Metrics.smallPadding, 
    paddingHorizontal: Metrics.basePadding
  },
  body: {
    margin: Metrics.doubleBaseMargin, 
    alignItems: 'center', 
    padding: Metrics.basePadding, 
    justifyContent: 'space-between',
    backgroundColor: Colors.body,
    /** Shadow Effect Settings **/
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  mapContainer: {
    resizeMode: 'contain',
    height: height,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    height: height,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    height: height,
    width: width
  },
  scrollView: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    paddingVertical: Metrics.regularPadding,
  },
  card: {
    // height: CARD_HEIGHT,
    width: '100%',
    // padding: Metrics.regularPadding,
    overflow: "hidden",
    /** Shadow Effect Settings **/
    // backgroundColor: Colors.body,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 5},
    // shadowOpacity: 0.58,
    // shadowRadius: 5,
    // elevation: 24,
  },
  cardImage: {
    width: "100%",
    // height: (height > 700)?Metrics.images.xxLarge:Metrics.images.xLarge,
    alignSelf: "center",
    borderColor: Colors.border, borderWidth: 1
  },
  textContent: {
    flex: 1,
    paddingBottom: Metrics.basePadding
  },
  cardTitle: {
    fontSize: Fonts.size.large,
    color: Colors.text_color_1,
  },
  cardDescription: {
    fontSize: Fonts.size.regular,
    color: Colors.text_color_1,
    fontWeight: 'bold',
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: (Platform.OS === 'ios')?8:10,
    height: (Platform.OS === 'ios')?8:10,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
  ring: { 
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)",
  },
};

export default OutletListContainer;