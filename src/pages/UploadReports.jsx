import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  Calendar, 
  User, 
  TestTube,
  Package,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const UploadReports = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedLab, setAssignedLab] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [useResultsEntry, setUseResultsEntry] = useState(false)
  const [resultEntries, setResultEntries] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  console.log('UploadReports component loaded')

  // Helper function to transform bookings to show individual tests that still need results
  const transformBookingsToIndividualTests = (bookingsData) => {
    const transformedBookings = []
    bookingsData.forEach(booking => {
      // Get existing test results for this booking
      const existingResults = booking.testResults || []
      const resultTestIds = new Set(existingResults.map(r => r.testId?._id || r.testId))
      
      // Add direct tests that don't have results yet
      if (booking.selectedTests && booking.selectedTests.length > 0) {
        booking.selectedTests.forEach(test => {
          const testId = test.testId?._id || test.testId
          if (!resultTestIds.has(testId)) {
            transformedBookings.push({
              ...booking,
              testInfo: {
                id: testId,
                name: test.testId?.name || test.testName,
                type: 'direct',
                resultFields: test.testId?.resultFields || []
              }
            })
          }
        })
      }
      
      // Add tests from packages that don't have results yet
      if (booking.selectedPackages && booking.selectedPackages.length > 0) {
        booking.selectedPackages.forEach(pkg => {
          if (pkg.packageId?.selectedTests && pkg.packageId.selectedTests.length > 0) {
            pkg.packageId.selectedTests.forEach(test => {
              const testId = test._id
              if (!resultTestIds.has(testId)) {
                transformedBookings.push({
                  ...booking,
                  testInfo: {
                    id: testId,
                    name: test.name,
                    type: 'package',
                    packageName: pkg.packageId?.name || pkg.packageName,
                    resultFields: test.resultFields || []
                  }
                })
              }
            })
          }
        })
      }
    })
    return transformedBookings
  }

  // Fetch assigned lab information
  useEffect(() => {
    const fetchAssignedLab = async () => {
      try {
        if (user?.assignedLab) {
          const response = await api.labAPI.getLab(user.assignedLab)
          setAssignedLab(response.data)
        }
      } catch (error) {
        console.error('Error fetching assigned lab:', error)
      }
    }

    if (user) {
      fetchAssignedLab()
    }
  }, [user])

  // Fetch bookings with sample_collected status
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (assignedLab && assignedLab._id) {
          const response = await api.localAdminAPI.getLabBookings(assignedLab._id, 'sample_collected', 1, 100)
          if (response.success) {
            setBookings(transformBookingsToIndividualTests(response.data))
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (assignedLab) {
      fetchBookings()
    } else {
      setLoading(false)
    }
  }, [assignedLab])

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, JPEG, or PNG file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  // Handle report upload
  const handleUploadReport = async () => {
    if (!selectedFile || !selectedBooking) {
      alert('Please select a file and booking')
      return
    }

    try {
      setUploading(true)
      const response = await api.bookingAPI.uploadReport(selectedBooking._id, selectedFile)
      
      if (response.success) {
        alert('Report uploaded successfully!')
        setShowUploadModal(false)
        setSelectedFile(null)
        setSelectedBooking(null)
        
        // Refresh bookings list
        if (assignedLab && assignedLab._id) {
          const updatedResponse = await api.localAdminAPI.getLabBookings(assignedLab._id, 'sample_collected', 1, 100)
          if (updatedResponse.success) {
            setBookings(transformBookingsToIndividualTests(updatedResponse.data))
          }
        }
      }
    } catch (error) {
      console.error('Error uploading report:', error)
      alert('Error uploading report: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'sample_collected': return 'bg-indigo-100 text-indigo-800'
      case 'report_uploaded': return 'bg-green-100 text-green-800'
      case 'result_published': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (timeString) => {
    return timeString
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
          <h2 className="text-2xl font-bold text-gray-900">Upload Reports</h2>
          <p className="text-gray-600">Upload test reports for {assignedLab?.name}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports to upload</h3>
            <p className="text-gray-600">
              No bookings with "Sample Collected" status found.
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
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
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
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.userId?.firstName} {booking.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{booking.userId?.email}</div>
                        <div className="text-sm text-gray-500">{booking.userId?.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(booking.appointmentDate)}</div>
                      <div className="text-sm text-gray-500">{formatTime(booking.appointmentTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <TestTube className="h-4 w-4 mr-1" />
                          <div>
                            <div className="font-medium">{booking.testInfo.name}</div>
                            {booking.testInfo.type === 'package' && (
                              <div className="text-xs text-indigo-600">
                                From: {booking.testInfo.packageName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            // Initialize results structure for this specific test
                            const initial = {}
                            if (booking.testInfo && Array.isArray(booking.testInfo.resultFields)) {
                              initial[booking.testInfo.id] = booking.testInfo.resultFields.map(f => ({
                                label: f.label || '',
                                unit: f.unit || '',
                                referenceRange: f.referenceRange || '',
                                type: f.type || 'text',
                                required: !!f.required,
                                value: f.type === 'boolean' ? false : ''
                              }))
                            }
                            setResultEntries(initial)
                            setUseResultsEntry(false)
                            setShowUploadModal(true)
                          }}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                          title="Upload Report or Enter Results"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Add Report/Results
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload/Results Modal */}
      {showUploadModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Report / Enter Results</h3>
            
            {/* Booking Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Patient:</div>
              <div className="font-medium text-gray-900">
                {selectedBooking.userId?.firstName} {selectedBooking.userId?.lastName}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {formatDate(selectedBooking.appointmentDate)} at {formatTime(selectedBooking.appointmentTime)}
              </div>
              <div className="text-sm text-gray-700 mt-2">
                <strong>Test:</strong> {selectedBooking.testInfo?.name}
                {selectedBooking.testInfo?.type === 'package' && (
                  <div className="text-xs text-indigo-600 mt-1">
                    From Package: {selectedBooking.testInfo.packageName}
                  </div>
                )}
              </div>
            </div>

            {/* Toggle */}
            <div className="mb-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setUseResultsEntry(false)}
                className={`px-3 py-1 rounded text-sm ${!useResultsEntry ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Upload Report
              </button>
              <button
                type="button"
                onClick={() => setUseResultsEntry(true)}
                className={`px-3 py-1 rounded text-sm ${useResultsEntry ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Enter Results
              </button>
            </div>

            {!useResultsEntry && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, JPG, JPEG, PNG (Max 10MB)
                </p>
              </div>
            )}

            {useResultsEntry && (
              <div className="mb-4 space-y-4">
                {/* Single test result entry */}
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {selectedBooking.testInfo?.name}
                    {selectedBooking.testInfo?.type === 'package' && (
                      <span className="text-xs text-indigo-600 ml-2">(From: {selectedBooking.testInfo.packageName})</span>
                    )}
                  </div>
                  {Array.isArray(resultEntries[selectedBooking.testInfo?.id]) && resultEntries[selectedBooking.testInfo?.id].length > 0 ? (
                    <div className="space-y-2">
                      {resultEntries[selectedBooking.testInfo?.id].map((field, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-700 mb-1">{field.label || 'Field'}</label>
                            {field.type === 'boolean' ? (
                              <select
                                value={field.value ? 'true' : 'false'}
                                onChange={(e) => {
                                  const tid = selectedBooking.testInfo?.id
                                  const updated = [...resultEntries[tid]]
                                  updated[idx] = { ...updated[idx], value: e.target.value === 'true' }
                                  setResultEntries(prev => ({ ...prev, [tid]: updated }))
                                }}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                              </select>
                            ) : (
                              <input
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={field.value}
                                onChange={(e) => {
                                  const tid = selectedBooking.testInfo?.id
                                  const updated = [...resultEntries[tid]]
                                  updated[idx] = { ...updated[idx], value: field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }
                                  setResultEntries(prev => ({ ...prev, [tid]: updated }))
                                }}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md"
                                placeholder={field.referenceRange ? `Ref: ${field.referenceRange}` : ''}
                              />
                            )}
                          </div>
                          <div className="col-span-4 text-xs text-gray-500">
                            {field.unit && <div>Unit: {field.unit}</div>}
                            {field.referenceRange && <div>Ref: {field.referenceRange}</div>}
                            {field.required && <div className="text-red-600">Required</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No predefined fields for this test.</div>
                  )}
                </div>
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-green-800">{selectedFile.name}</div>
                    <div className="text-xs text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setSelectedBooking(null)
                  setUseResultsEntry(false)
                  setResultEntries({})
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              {!useResultsEntry && (
                <button
                  onClick={handleUploadReport}
                  disabled={!selectedFile || uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Report
                    </>
                  )}
                </button>
              )}
              {useResultsEntry && (
                <button
                  onClick={async () => {
                    if (!selectedBooking) return
                    // Build payload for single test
                    const testId = selectedBooking.testInfo?.id
                    if (!testId || !resultEntries[testId]) {
                      alert('No results to submit')
                      return
                    }
                    const testResults = [{
                      testId: testId,
                      values: resultEntries[testId].map(f => ({
                        label: f.label,
                        value: f.value,
                        unit: f.unit,
                        referenceRange: f.referenceRange,
                        type: f.type,
                        required: f.required
                      }))
                    }]
                    try {
                      setUploading(true)
                      const res = await api.resultsAPI.submitResults(selectedBooking._id, testResults)
                      if (res.success) {
                        alert('Results submitted successfully!')
                        setShowUploadModal(false)
                        setSelectedFile(null)
                        setSelectedBooking(null)
                        setUseResultsEntry(false)
                        setResultEntries({})
                        // Refresh bookings list
                        if (assignedLab && assignedLab._id) {
                          const response = await api.localAdminAPI.getLabBookings(assignedLab._id, 'sample_collected', 1, 100)
                          if (response.success) {
                            setBookings(transformBookingsToIndividualTests(response.data))
                          }
                        }
                      }
                    } catch (err) {
                      console.error('Error submitting results:', err)
                      alert('Error submitting results: ' + err.message)
                    } finally {
                      setUploading(false)
                    }
                  }}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Submitting...' : 'Submit Results'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadReports
