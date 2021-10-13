/** REACT NATIVE **/
import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { tailwind } from '../../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
} from '../../../../Services/LibLinking'
import { ShippingMethodType } from './constants'
import PickUpFragment from './pick-up-fragment'
import DeliveryFragment from './delivery-fragment'

function ShippingMethod(props) {
  const { data, preSelectedData, onChange } = props
  const { pickup, easyparcel } = data
  const {
    type,
    pickup_address = null,
    pickup_address_id = null,
    pickup_date = null,
    pickup_time = null,
    service_id = null,
    shipping_fee = null,
    courier_name = null,
  } = preSelectedData
  const [selectedMethod, setSelectedMethod] = useState(type || null)
  const [pickupData, setPickupData] = useState({
    pickup_address,
    pickup_address_id,
    pickup_date,
    pickup_time,
  })
  const [deliveryData, setDeliveryData] = useState({
    service_id,
    shipping_fee,
    courier_name,
  })
  const onChangeSelectedMethod = useCallback((data) => {
    setSelectedMethod(data)
  }, [])
  const onChangePickUpData = useCallback((data) => {
    setPickupData(data)
  }, [])
  const onChangeDeliveryData = useCallback((data) => {
    setDeliveryData(data)
  }, [])

  // Data On Change
  useEffect(() => {
    const shippingData = (() => {
      if (selectedMethod === ShippingMethodType.PICKUP) {
        return pickupData
      }
      if (selectedMethod === ShippingMethodType.DELIVERY) {
        return deliveryData
      }
      return {}
    })()

    onChange({
      type: selectedMethod,
      ...shippingData
    })
  }, [selectedMethod, pickupData, deliveryData])

  return (
    <View>
      <View
        style={tailwind("flex-col ")}
      >
        <View style={tailwind("mb-3")}>
          <ShippingMethodButton
            text={'Pick Up'}
            onPress={() => { onChangeSelectedMethod(ShippingMethodType.PICKUP) }}
            // style={{ marginRight: Metrics.smallMargin }}
            selected={selectedMethod === ShippingMethodType.PICKUP}
            disabled={!pickup}
          />
        </View>
        <View>
          <ShippingMethodButton
            text={'Delivery'}
            onPress={() => { onChangeSelectedMethod(ShippingMethodType.DELIVERY) }}
            selected={selectedMethod === ShippingMethodType.DELIVERY}
            disabled={!easyparcel}
          />
        </View>

      </View>

      {/* Pickup Fragment */}
      {
        selectedMethod === ShippingMethodType.PICKUP
          ? <PickUpFragment
            address={pickup.address}
            date={pickup.date}
            time={pickup.time}
            preSelectedLocation={{
              branch_id: pickup_address_id,
              address: pickup_address
            }}
            preSelectedDate={pickup_date}
            preSelectedTime={pickup_time}
            onChange={onChangePickUpData}
          />
          : null
      }

      {/* Pickup Fragment */}
      {
        selectedMethod === ShippingMethodType.DELIVERY
          ? <DeliveryFragment
            courierList={easyparcel}
            preSelectedCourier={{
              ...deliveryData,
              shipment_price: deliveryData.shipping_fee
            }}
            onChange={onChangeDeliveryData}
          />
          : null
      }
    </View>
  )
}
export default ShippingMethod

function ShippingMethodButton(props) {
  const { text, onPress, disabled = false, style, selected } = props
  const fontWeight = selected ? 'normal' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.button_background : Colors.border_line
  // const color = disabled ? Colors.border_line : Colors.button_background
  const color = selected ? Colors.button_background_disabled : Colors.button_background_disabled
  const disabledText = disabled ? ' (Not Available)' : ''
  return (
    <TouchableOpacity
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 10,
        padding: Metrics.basePadding,
        ...style
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Label
        text={`${text}${disabledText}`}
        style={{
          color: color,
          fontSize: Fonts.size.large,
          fontWeight: fontWeight
        }}
      />
    </TouchableOpacity>
  )
}