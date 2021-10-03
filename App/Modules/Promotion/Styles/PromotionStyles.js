import React, {Component} from 'react';
import { Dimensions } from 'react-native';
import {Metrics, Colors, Fonts} from '../../../Themes';

const PromotionContainer = {
  shadow: {
    borderRadius: Metrics.containerRadius,
    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  branchPriceContainer: {
    borderRadius: Metrics.containerRadius,
    marginVertical: Metrics.baseMargin,
    padding: Metrics.smallPadding, 
    backgroundColor: Colors.body,
    borderColor: Colors.borderLight,
    borderWidth: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: Metrics.doubleBaseMargin,
    paddingVertical: Metrics.basePadding,
    alignItems: 'center',
  },
  flatlistHeaderContainer: {
    justifyContent: 'space-between', 
    flexDirection: 'row',
    margin: Metrics.smallMargin,
    paddingHorizontal: Metrics.smallPadding,
    paddingVertical: Metrics.basePadding,
  },
  dateHeaderContainer: {
    justifyContent: 'space-between', 
    flexDirection: 'row',
    margin: Metrics.smallMargin,
    paddingHorizontal: Metrics.smallPadding,
    paddingTop: Metrics.basePadding,
  },
  productContainer: {
    backgroundColor: Colors.body,
    width: '40%',
    justifyContent: 'flex-end',
  },
  descriptionContainer: {
    backgroundColor: Colors.body,
    justifyContent: 'flex-start',
    width: '60%',
    padding: Metrics.basePadding,
  },
  descriptionRowContainer: {
    paddingVertical: Metrics.smallPadding,
  },
  textStyle: {
    color : Colors.discount_con_label, 
    fontWeight: 'bold', 
    fontSize: Fonts.size.h5,
    textAlign: 'center',
  },
  textStyleSpecial: {
    color : Colors.discount_con_label, 
    fontWeight: 'bold', 
    fontSize: Fonts.size.input,
    textAlign: 'center',
  },
  flagBottom: {
    borderBottomWidth: 30,
    borderBottomColor: 'transparent',
    borderLeftWidth: 30,
    borderLeftColor: Colors.discount_con_background,
    borderRightWidth: 30,
    borderRightColor: Colors.discount_con_background,
  },
  flagBottomSpecial: {
    borderBottomWidth: 20,
    borderBottomColor: 'transparent',
    borderLeftWidth: 20,
    borderLeftColor: Colors.discount_con_background,
    borderRightWidth: 20,
    borderRightColor: Colors.discount_con_background,
  },
  specialForYouContainer: {
    flex: 1, 
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: Colors.body, 
    marginHorizontal: 10, 
    marginVertical: 30, 
    borderWidth: 0.5, 
    borderColor: '#dddddd',     
    borderRadius: Metrics.containerRadius,

    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  }
}

export default PromotionContainer;