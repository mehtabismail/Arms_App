/** REACT NATIVE **/
import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'


import {tailwind} from '../../../../../../tailwind';


/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
} from '../../../../../Services/LibLinking'
import { CurrencyPrefix } from '../constants'

function DeliveryFragment(props) {
  const { courierList, preSelectedCourier, onChange } = props
  const [selectedCourier, setSelectedCourier] = useState(preSelectedCourier || null)
  const handleCourierOnChange = useCallback((index) => {
    setSelectedCourier(courierList[index])
  }, [])

  useEffect(() => {
    onChange({
      shipping_fee: selectedCourier.shipment_price,
      service_id: selectedCourier.service_id,
      courier_name: selectedCourier.courier_name,
    })
  }, [selectedCourier])

  const courierListRenderStack = []
  for (let i = 0; i < courierList.length; i++) {
    courierListRenderStack.push(
      <Courier
        key={`${i}`}
        index={i}
        onPress={handleCourierOnChange}
        selected={courierList[i].service_id === selectedCourier.service_id}
        {...courierList[i]}
      />
    )
  }

  return (
    <View style={tailwind("mt-5")}>
      {/* Delivery Service */}
      <Label
        text={'Choose courier service'}
        style={tailwind("text-primary text-xl font-bold ")}
      />
      <View style={tailwind("mt-3")}>{courierListRenderStack}</View>
    </View>
  )
}
export default DeliveryFragment

function Courier(props) {
  const {
    index,
    service_id,
    delivery,
    shipment_price,
    courier_name,
    onPress,
    style,
    selected
  } = props
  const fontWeight = selected ? 'normal' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.button_background : Colors.border_line
  return (
    <TouchableOpacity
      key={`${service_id}`}
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 10,
        paddingHorizontal: Metrics.basePadding,
        paddingVertical: Metrics.smallPadding,
        marginVertical: Metrics.smallPadding,
        ...style
      }}
      onPress={() => { onPress(index) }}
    >
      <Label
        text={courier_name}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          fontWeight: 'bold'
        }}
      />
      <Label
        text={`Delivery: ${delivery}`}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.large,
          fontWeight: fontWeight
        }}
      />
      <Label
        text={`Shipment Fee: ${CurrencyPrefix} ${shipment_price}`}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.large,
          fontWeight: fontWeight
        }}
      />
    </TouchableOpacity>
  )
}