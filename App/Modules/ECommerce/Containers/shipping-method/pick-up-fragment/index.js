/** REACT NATIVE **/
import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import {tailwind} from '../../../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
} from '../../../../../Services/LibLinking'

function PickUpFragment(props) {
  const {
    address: locationList,
    date: dateList,
    time: timeList,
    preSelectedLocation,
    preSelectedDate,
    preSelectedTime,
    onChange
  } = props
  const [selectedLocation, setSelectedLocation] = useState(preSelectedLocation || { branch_id: null, address: null })
  const [selectedDate, setSelectedDate] = useState(preSelectedDate || null)
  const [selectedTime, setSelectedTime] = useState(preSelectedTime || null)
  const handleLocationOnChange = useCallback((data) => {
    setSelectedLocation(data)
    setSelectedDate(null)
    setSelectedTime(null)
  }, [])
  const handleDateOnChange = useCallback((_selectedDate) => {
    setSelectedDate(_selectedDate)
    setSelectedTime(null)
  }, [])
  const handleTimeOnChange = useCallback((_selectedTime) => {
    setSelectedTime(_selectedTime)
  }, [])

  useEffect(() => {
    onChange({
      pickup_address: selectedLocation.address,
      pickup_address_id: selectedLocation.branch_id,
      pickup_date: selectedDate,
      pickup_time: selectedTime,
    })
  }, [selectedLocation, selectedDate, selectedTime])

  const locationListRenderStack = []
  for (let i = 0; i < locationList.length; i++) {
    locationListRenderStack.push(
      <PickUpLocation
        style={tailwind("mt-3")}
        key={`${i}`}
        onPress={handleLocationOnChange}
        selected={locationList[i].branch_id === selectedLocation.branch_id}
        {...locationList[i]}
      />
    )
  }

  const dateListRenderStack = []
  for (let i = 0; i < dateList.length; i++) {
    dateListRenderStack.push(
      <PickUpDate
        style={tailwind("mt-3")}
        key={`${i}`}
        onPress={handleDateOnChange}
        date={dateList[i]}
        selected={dateList[i] === selectedDate}
      />
    )
  }

  const timeListRenderStack = []
  if (timeList[selectedDate] && timeList[selectedDate].length > 0) {
    timeList[selectedDate].map((value) => {
      timeListRenderStack.push(
        <PickUpTime
        style={tailwind("mt-3")}
          key={`${value}`}
          onPress={handleTimeOnChange}
          time={value}
          selected={value === selectedTime}
        />
      )
    })
  }

  return (
    <View style={tailwind("mt-5")}>
      <View >
        {/* Pickup Location */}
        <Label
          text={'Pickup Location'}
          style={tailwind("text-primary text-xl font-bold ")}
        />
        <View>{locationListRenderStack}</View>
      </View>

      <View style={tailwind("mt-5")}>
        {/* Pickup Date */}
        <Label
          text={'Pickup Date'}
          style={tailwind("text-primary text-xl font-bold")}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{dateListRenderStack}</View>

      </View>
      <View style={tailwind("mt-5")}>
        {/* Pickup Time */}
        <Label
          text={'Pickup Time'}
          style={tailwind("text-primary text-xl font-bold ")}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {
            timeListRenderStack.length > 0
              ? timeListRenderStack
              : <Label
                text={'-- No Available --'}
                style={{
                  color: Colors.primary,
                  fontSize: Fonts.size.regular,
                  marginTop: Metrics.smallMargin
                }}
              />
          }
        </View>
      </View>

    </View>
  )
}
export default PickUpFragment

function PickUpLocation(props) {
  const { branch_id, code, address, onPress, disabled = false, style, selected } = props
  const fontWeight = selected ? 'normal' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.button_background : Colors.border_line
  return (
    <TouchableOpacity
      key={`${branch_id}`}
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 20,
        paddingHorizontal: Metrics.basePadding,
        paddingVertical: Metrics.smallPadding,
        marginVertical: Metrics.smallPadding,
        ...style
      }}
      onPress={() => { onPress({ branch_id, address }) }}
      disabled={disabled}
    >
      <Label
        text={code}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          fontWeight: 'bold'
        }}
      />
      <Label
        text={address}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.large,
          fontWeight: fontWeight
        }}
      />
    </TouchableOpacity>
  )
}

function PickUpDate(props) {
  const { date, onPress, disabled = false, style, selected } = props
  const fontWeight = selected ? 'normal' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.button_background : Colors.border_line
  return (
    <TouchableOpacity
      key={`${date}`}
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 10,
        paddingHorizontal: Metrics.basePadding,
        paddingVertical: Metrics.smallPadding,
        margin: Metrics.smallPadding,
        ...style
      }}
      onPress={() => { onPress(date) }}
      disabled={disabled}
    >
      <Label
        text={date}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          fontWeight: fontWeight
        }}
      />
    </TouchableOpacity>
  )
}

function PickUpTime(props) {
  const { time, onPress, disabled = false, style, selected } = props
  const fontWeight = selected ? 'normal' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.button_background : Colors.border_line
  return (
    <TouchableOpacity
      key={`${time}`}
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 10,
        paddingHorizontal: Metrics.basePadding,
        paddingVertical: Metrics.smallPadding,
        margin: Metrics.smallPadding,
        ...style
      }}
      onPress={() => { onPress(time) }}
      disabled={disabled}
    >
      <Label
        text={time}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          fontWeight: fontWeight
        }}
      />
    </TouchableOpacity>
  )
}