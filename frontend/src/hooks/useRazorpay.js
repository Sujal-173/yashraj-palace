import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { paymentsAPI } from '../utils/api'

export const useRazorpay = () => {
  const initiatePayment = useCallback(async ({
    bookingId,
    bookingType,
    guestName,
    guestEmail,
    guestPhone,
    onSuccess,
    onFailure,
  }) => {
    try {
      // amount is NOT sent — backend computes it from the booking record (security fix)
      const { data } = await paymentsAPI.createOrder({ bookingId, bookingType })

      const options = {
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Yashraj Palace',
        description: bookingType === 'room' ? 'Room Booking Advance (30%)' : 'Event Token Payment',
        order_id:    data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentsAPI.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId,
              bookingType,
            })
            toast.success('Payment successful! Your booking is confirmed.')
            onSuccess?.(verifyRes.data)
          } catch (err) {
            toast.error('Payment verification failed. Please contact us on WhatsApp.')
            onFailure?.(err)
          }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        notes:   { bookingId, hotelName: 'Yashraj Palace' },
        theme:   { color: '#6B1A2B' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your booking is held for 20 minutes — complete payment to confirm.', { icon: 'ℹ️' })
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`)
        onFailure?.(response.error)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
      onFailure?.(err)
    }
  }, [])

  return { initiatePayment }
}
