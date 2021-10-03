/** REACT NATIVE **/
import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

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
          key={`${value}`}
          onPress={handleTimeOnChange}
          time={value}
          selected={value === selectedTime}
        />
      )
    })
  }

  return (
    <View>
      {/* Pickup Location */}
      <Label
        text={'Pickup Location'}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          marginTop: Metrics.basePadding
        }}
      />
      <View>{locationListRenderStack}</View>

      {/* Pickup Date */}
      <Label
        text={'Pickup Date'}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          marginTop: Metrics.basePadding
        }}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{dateListRenderStack}</View>

      {/* Pickup Time */}
      <Label
        text={'Pickup Time'}
        style={{
          color: Colors.primary,
          fontSize: Fonts.size.h6,
          marginTop: Metrics.basePadding
        }}
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
  )
}
export default PickUpFragment

function PickUpLocation(props) {
  const { branch_id, code, address, onPress, disabled = false, style, selected } = props
  const fontWeight = selected ? 'bold' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.primary : Colors.border_line
  return (
    <TouchableOpacity
      key={`${branch_id}`}
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: 10,
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
  const fontWeight = selected ? 'bold' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.primary : Colors.border_line
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
  const fontWeight = selected ? 'bold' : 'normal'
  const borderWidth = selected ? 2 : 1
  const borderColor = selected ? Colors.primary : Colors.border_line
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