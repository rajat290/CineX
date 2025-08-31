import React, { useState } from 'react'
import { Calendar, MapPin, Clock, Download, ArrowLeft, QrCode } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Booking {
  _id: string
  bookingId: string
  movie: {
    title: string
    poster: string
  }
  theatre: {
    name: string
    address: string | {
      street: string
      area: string
      city: string
      state: string
      pincode: string
    }
  }
  show: {
    date: string
    showTime: string
    language: string | object
    format: string | object
  }
  seats: Array<{
    seatNumber: string
    seatType: string
    price: number
  }>
  totalAmount: number
  convenienceFee: number
  tax: number
  finalAmount: number
  status: string
  showDate: string
  showTime: string
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

interface BookingDetailProps {
  booking: Booking
  onBack: () => void
}

const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onBack }) => {
  const [downloading, setDownloading] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const generatePDF = async () => {
    setDownloading(true)
    try {
      const ticketElement = document.getElementById('ticket-content')
      if (!ticketElement) return

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`CineX-Ticket-${booking.bookingId}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'expired':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Bookings</span>
        </button>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </div>
      </div>

      {/* Ticket Content for PDF */}
      <div id="ticket-content" className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">CineX</h1>
              <p className="text-red-100">Movie Ticket</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">Booking ID</p>
              <p className="text-lg font-bold">{booking.bookingId}</p>
            </div>
          </div>
        </div>

        {/* Movie Details */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              {booking.movie?.poster ? (
                <img
                  src={booking.movie.poster}
                  alt={booking.movie.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">No Image</div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{booking.movie?.title}</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.theatre?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Address:</span>
                  <span>
                    {typeof booking.theatre?.address === 'string'
                      ? booking.theatre.address
                      : typeof booking.theatre?.address === 'object'
                      ? `${booking.theatre.address.street || ''}, ${booking.theatre.address.area || ''}, ${booking.theatre.address.city || ''}, ${booking.theatre.address.state || ''} ${booking.theatre.address.pincode || ''}`.trim()
                      : 'Address not available'
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(booking.showDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(booking.showTime)}</span>
                </div>
                {booking.show?.language && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Language:</span>
                    <span>{typeof booking.show.language === 'string' ? booking.show.language : JSON.stringify(booking.show.language)}</span>
                  </div>
                )}
                {booking.show?.format && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Format:</span>
                    <span>{typeof booking.show.format === 'string' ? booking.show.format : JSON.stringify(booking.show.format)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seat Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seat Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.seats.map((seat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Seat {seat.seatNumber}</span>
                  <span className="text-sm text-gray-600">{seat.seatType}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">₹{seat.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Amount:</span>
              <span className="font-medium">₹{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Convenience Fee:</span>
              <span className="font-medium">₹{booking.convenienceFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">₹{booking.tax}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
              <span>Total Amount:</span>
              <span>₹{booking.finalAmount}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-6 text-center">
          <div className="inline-block bg-gray-100 p-4 rounded-lg mb-4">
            <QrCode className="w-24 h-24 text-gray-800 mx-auto" />
          </div>
          <p className="text-sm text-gray-600">Scan this QR code at the theatre entrance</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-600">
          <p>Show this ticket at the theatre entrance. Keep it safe until the show ends.</p>
          <p className="mt-1">For support, contact us at support@cinemabooker.com</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={generatePDF}
          disabled={downloading}
          className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Important Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Please arrive at the theatre 30 minutes before show time</li>
          <li>• Carry a valid ID proof along with this ticket</li>
          <li>• No outside food or beverages allowed</li>
          <li>• Tickets are non-transferable and non-refundable</li>
        </ul>
      </div>
    </div>
  )
}

export default BookingDetail
