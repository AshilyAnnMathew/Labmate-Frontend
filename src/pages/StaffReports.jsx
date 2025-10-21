import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  TestTube, 
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileImage,
  Printer
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const StaffReports = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Fetch reports for the assigned lab
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError('')
        
        if (!user?.assignedLab) {
          setError('No lab assigned to view reports')
          return
        }

        // Fetch all bookings with reports for the assigned lab
        const response = await api.bookingAPI.getLabReports(user.assignedLab, 'all', 1, 1000)
        
        if (response?.success && response.data) {
          setReports(response.data)
          setFilteredReports(response.data)
        } else {
          setReports([])
          setFilteredReports([])
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch reports')
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [user])

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = [...reports]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report._id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setDate(now.getDate() - 30)
          break
        default:
          break
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(report => 
          new Date(report.reportUploadDate || report.updatedAt) >= startDate
        )
      }
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, dateFilter])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      sample_collected: { color: 'bg-purple-100 text-purple-800', label: 'Sample Collected' },
      report_uploaded: { color: 'bg-green-100 text-green-800', label: 'Report Uploaded' },
      result_published: { color: 'bg-green-100 text-green-800', label: 'Result Published' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const viewReportDetails = (report) => {
    setSelectedReport(report)
    setShowDetailsModal(true)
  }

  const downloadReport = async (report) => {
    try {
      if (report.reportFile) {
        // Create download link
        const link = document.createElement('a')
        link.href = report.reportFile.startsWith('http') 
          ? report.reportFile 
          : `http://localhost:5000/${report.reportFile}`
        link.download = `report-${report._id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('No report file available for download')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    }
  }

  const printReport = (report) => {
    // Open report in new window for printing
    if (report.reportFile) {
      const reportUrl = report.reportFile.startsWith('http') 
        ? report.reportFile 
        : `http://localhost:5000/${report.reportFile}`
      window.open(reportUrl, '_blank')
    }
  }

  const refreshReports = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.bookingAPI.getLabReports(user.assignedLab, 'all', 1, 1000)
      
      if (response?.success && response.data) {
        setReports(response.data)
        setFilteredReports(response.data)
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uploaded Reports</h1>
          <p className="text-gray-600">View and manage all uploaded laboratory reports</p>
        </div>
        <button
          onClick={refreshReports}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="report_uploaded">Report Uploaded</option>
            <option value="result_published">Result Published</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            {filteredReports.length} reports found
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No reports found</p>
            <p className="text-sm">No reports match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.userId?.firstName} {report.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{report.userId?.email}</div>
                          <div className="text-sm text-gray-500">{report.userId?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(report.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {report.appointmentTime}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {report._id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <TestTube className="h-4 w-4 mr-1 text-gray-400" />
                          {(report.selectedTests || []).length + (report.selectedPackages || []).length} items
                        </div>
                        <div className="text-sm font-semibold text-primary-600 mt-1">
                          {formatCurrency(report.totalAmount)}
                        </div>
                        <div className="mt-1">
                          {getPaymentStatusBadge(report.paymentStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.reportFile ? (
                          <div className="flex items-center text-green-600">
                            <FileImage className="h-4 w-4 mr-1" />
                            File Available
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <FileText className="h-4 w-4 mr-1" />
                            No File
                          </div>
                        )}
                        {report.testResults?.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {report.testResults.length} test results
                          </div>
                        )}
                        {report.reportUploadDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Uploaded: {formatDate(report.reportUploadDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewReportDetails(report)}
                          className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md text-xs flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        {report.reportFile && (
                          <>
                            <button
                              onClick={() => downloadReport(report)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs flex items-center"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                            <button
                              onClick={() => printReport(report)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs flex items-center"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Print
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Report Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">
                        {selectedReport.userId?.firstName} {selectedReport.userId?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedReport.userId?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedReport.userId?.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Age & Gender</label>
                      <p className="text-sm text-gray-900">
                        {selectedReport.userId?.age ? `${selectedReport.userId.age} years` : 'N/A'} • {selectedReport.userId?.gender || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Booking Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedReport._id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Appointment Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedReport.appointmentDate).toLocaleDateString()} at {selectedReport.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Lab</label>
                      <p className="text-sm text-gray-900">{selectedReport.labId?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Status</label>
                      <div className="mt-1">{getPaymentStatusBadge(selectedReport.paymentStatus)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedReport.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Tests */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Selected Tests & Packages</h4>
                  <div className="space-y-3">
                    {selectedReport.selectedTests?.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{test.testName}</p>
                          <p className="text-xs text-gray-500">Test</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(test.price)}</p>
                      </div>
                    ))}
                    {selectedReport.selectedPackages?.map((pkg, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pkg.packageName}</p>
                          <p className="text-xs text-gray-500">Package</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(pkg.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Results */}
                {selectedReport.testResults?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Test Results</h4>
                    <div className="space-y-4">
                      {selectedReport.testResults.map((result, index) => (
                        <div key={index} className="bg-white rounded border p-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Test Result #{index + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {result.values?.map((value, valueIndex) => (
                              <div key={valueIndex} className="border rounded p-2">
                                <label className="text-xs font-medium text-gray-700">{value.label}</label>
                                <p className="text-sm text-gray-900">
                                  {value.value} {value.unit}
                                </p>
                                {value.referenceRange && (
                                  <p className="text-xs text-gray-500">Range: {value.referenceRange}</p>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Submitted: {formatDate(result.submittedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report File */}
                {selectedReport.reportFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Report File</h4>
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <FileImage className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm text-gray-900">Report file available</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadReport(selectedReport)}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                        <button
                          onClick={() => printReport(selectedReport)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs flex items-center"
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </button>
                      </div>
                    </div>
                    {selectedReport.reportUploadDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Uploaded: {formatDate(selectedReport.reportUploadDate)}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedReport.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                    <p className="text-sm text-gray-900 bg-white rounded border p-3">
                      {selectedReport.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffReports
