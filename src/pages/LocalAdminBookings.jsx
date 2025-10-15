import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, MapPin, Filter, Search, Eye, TestTube, Package } from 'lucide-react'
import api from '../services/api'

const LocalAdminBookings = ({ assignedLab }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateFilter, setDateFilter] = useState('all') // all, today, week, month, custom
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const limit = 10

  // Fetch bookings for the assigned lab
  useEffect(() => {
    if (assignedLab && assignedLab._id) {
      fetchBookings()
    }
  }, [assignedLab, filterStatus, currentPage, dateFilter, startDate, endDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // Fetch all bookings first, then apply client-side filtering
      const response = await api.localAdminAPI.getLabBookings(
        assignedLab._id,
        'all', // Get all bookings
        1,
        1000 // Get more bookings to allow for client-side filtering
      )
      
      if (response.success) {
        let allBookings = response.data || []
        
        // Apply status filter
        if (filterStatus !== 'all') {
          allBookings = allBookings.filter(booking => booking.status === filterStatus)
        }
        
        // Apply date filter
        allBookings = applyDateFilter(allBookings)
        
        // Sort by date and time
        allBookings.sort((a, b) => {
          const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime || '00:00'}`)
          const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime || '00:00'}`)
          return dateB - dateA // Most recent first
        })
        
        // Apply pagination
        const startIndex = (currentPage - 1) * limit
        const endIndex = startIndex + limit
        const paginatedBookings = allBookings.slice(startIndex, endIndex)
        
        setBookings(paginatedBookings)
        setTotalPages(Math.ceil(allBookings.length / limit))
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDateFilter = (bookings) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return bookings.filter(booking => {
      const appointmentDate = new Date(booking.appointmentDate)
      
      switch (dateFilter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString()
        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          return appointmentDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today)
          monthAgo.setMonth(today.getMonth() - 1)
          return appointmentDate >= monthAgo
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999) // Include the entire end date
            return appointmentDate >= start && appointmentDate <= end
          }
          return true
        default: // 'all'
          return true
      }
    })
  }

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value)
    setCurrentPage(1)
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
    setCurrentPage(1)
  }

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.userId.firstName.toLowerCase().includes(searchLower) ||
      booking.userId.lastName.toLowerCase().includes(searchLower) ||
      booking.userId.email.toLowerCase().includes(searchLower) ||
      booking.userId.phone.includes(searchLower)
    )
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString || 'Not specified'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'sample_collected':
        return 'bg-indigo-100 text-indigo-800'
      case 'result_published':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lab Bookings</h2>
          <p className="text-gray-600">Manage bookings for {assignedLab?.name}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="result_published">Result Published</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No bookings match your search criteria.' : 'No bookings available for this lab.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests/Packages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    {/* Patient Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.userId.firstName} {booking.userId.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{booking.userId.email}</div>
                          <div className="text-sm text-gray-500">{booking.userId.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Appointment Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(booking.appointmentDate)}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {formatTime(booking.appointmentTime)}
                        </div>
                      </div>
                    </td>

                    {/* Tests/Packages */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.selectedTests && booking.selectedTests.length > 0 && (
                          <div className="flex items-center mb-1">
                            <TestTube className="h-4 w-4 mr-1" />
                            <span className="font-medium">{booking.selectedTests.length} tests</span>
                          </div>
                        )}
                        {booking.selectedPackages && booking.selectedPackages.length > 0 && (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            <span className="font-medium">{booking.selectedPackages.length} packages</span>
                          </div>
                        )}
                        {(!booking.selectedTests?.length && !booking.selectedPackages?.length) && (
                          <span className="text-gray-500">No tests/packages</span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.totalAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocalAdminBookings