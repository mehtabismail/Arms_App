import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Starter = () => {
    return (
        <View>
            <Text>Hello world   </Text>
            <View style={{ width: "95%", alignSelf: "center" }}>
          {/* Total Items Amount */}
          <View style={{
            flexDirection: 'row',
            paddingVertical: Metrics.smallPadding,
            justifyContent: 'space-between',
          }}>
            <Label
              text={`Total Items Amount: `}
              style={{
                fontSize: Fonts.size.large,
                color: Colors.primary
              }}
            />

            <Label
              text={`${this.state.currency_symbol} ${this.state.total_amount}`}
              style={{
                fontSize: Fonts.size.large,
                color: Colors.primary,
              }}
            />
          </View>

          {/* Shipping Fee */}
          <View style={{
            flexDirection: 'row',
            paddingVertical: Metrics.smallPadding,
            justifyContent: 'space-between'
          }}>
            <Label
              text={`Shipping Fee: `}
              style={{
                fontSize: Fonts.size.large,
                color: Colors.primary
              }}
            />

            <Label
              text={`${this.state.currency_symbol} ${parseFloat(this.state.shipping_fee).toFixed(2)}`}
              style={{
                fontSize: Fonts.size.large,
                color: Colors.primary,
              }}
            />
          </View>
          <View>

          </View>

          {/* Total Amount */}
          <View style={{
            flexDirection: 'row',
            paddingVertical: Metrics.smallPadding,
            marginBottom: Metrics.smallMargin,
            justifyContent: 'space-between'
          }}>
            <Label
              text={`Total Payment: `}
              style={{
                fontSize: Fonts.size.h6,
                fontWeight: 'bold',
                color: Colors.primary
              }}
            />

            <Label
              text={`${this.state.currency_symbol} ${this.state.total_item_amount}`}
              style={{
                fontSize: Fonts.size.h6,
                fontWeight: 'bold',
                color: Colors.primary,
              }}
            />
          </View>

        </View>
        </View>
    )
}

export default Starter

const styles = StyleSheet.create({})
