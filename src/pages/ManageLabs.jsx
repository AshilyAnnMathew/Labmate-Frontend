import { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'
import Swal from 'sweetalert2'
import api from '../services/api'

const { labAPI, testAPI, packageAPI } = api

const ManageLabs = () => {
  const [labs, setLabs] = useState([])
  const [tests, setTests] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  
  // Modal states
  const [showAddLabModal, setShowAddLabModal] = useState(false)
  const [showEditLabModal, setShowEditLabModal] = useState(false)
  const [selectedLab, setSelectedLab] = useState(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Lab form state
  const [newLab, setNewLab] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    contact: '', // This might be the main contact number or a combined contact field
    operatingHours: {
      start: '',
      end: ''
    },
    availableTests: [],
    availablePackages: [],
    status: 'active'
  })

  // Fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchLabs()
      fetchTests()
      fetchPackages()
    } else {
      setError('Please log in to access this page')
    }
  }, [])

  const fetchLabs = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Fetching labs...')
      const response = await labAPI.getLabs()
      console.log('Labs API response:', response)
      const labsData = response.data || []
      console.log('Fetched labs data:', labsData)
      // Debug: Log status of each lab
      labsData.forEach(lab => {
        console.log(`Lab "${lab.name}" - isActive: ${lab.isActive}`)
      })
      setLabs(labsData)
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch labs'
      setError(errorMessage)
      console.error('Error fetching labs:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTests = async () => {
    try {
      const response = await testAPI.getTests()
      const testsData = response.data || []
      console.log('Fetched tests data:', testsData)
      setTests(testsData)
    } catch (err) {
      console.error('Error fetching tests:', err)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getPackages()
      const packagesData = response.data || []
      console.log('Fetched packages data:', packagesData)
      setPackages(packagesData)
    } catch (err) {
      console.error('Error fetching packages:', err)
    }
  }

  // Handle add lab
  const handleAddLab = async () => {
    try {
      setLoading(true)
      setError('')
      setFieldErrors({})
      
      // Validate required fields
      const errors = {}
      if (!newLab.name) errors.name = 'Lab name is required'
      if (!newLab.address) errors.address = 'Address is required'
      if (!newLab.city) errors.city = 'City is required'
      if (!newLab.state) errors.state = 'State is required'
      if (!newLab.pincode) errors.pincode = 'Pincode is required'
      if (!newLab.phone) errors.phone = 'Phone number is required'
      if (!newLab.email) errors.email = 'Email is required'
      if (!newLab.operatingHours.start) errors.operatingHours = 'Operating hours are required'
      if (!newLab.operatingHours.end) errors.operatingHours = 'Operating hours are required'
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setLoading(false)
        return
      }

      // Prepare lab data with required fields (backend expects JSON strings for certain fields)
      const labData = {
        name: newLab.name,
        description: newLab.description || 'Laboratory services and facilities',
        address: JSON.stringify({
          street: newLab.address,
          city: newLab.city,
          state: newLab.state,
          zipCode: newLab.pincode, // Backend expects zipCode, not pincode
          country: 'India'
        }),
        contact: JSON.stringify({
          phone: newLab.phone,
          email: newLab.email,
          website: '' // Add website field as expected by backend
        }),
        operatingHours: JSON.stringify({
          monday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          tuesday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          wednesday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          thursday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          friday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          saturday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          sunday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: false }
        }),
        availableTests: JSON.stringify(newLab.availableTests),
        availablePackages: JSON.stringify(newLab.availablePackages),
        isActive: newLab.status === 'active'
      }

      // Log the data being sent for debugging
      console.log('Sending lab data:', labData)

      // Create lab
      const response = await labAPI.createLab(labData)
      
      // Refresh labs list
      await fetchLabs()
      
      // Close modal and reset form
      setShowAddLabModal(false)
      setNewLab({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        contact: '',
        operatingHours: {
          start: '',
          end: ''
        },
        availableTests: [],
        availablePackages: [],
        status: 'active'
      })
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Lab created successfully!',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK'
      })
      
    } catch (err) {
      let errorMessage = 'Failed to create lab'
      if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Error creating lab:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle update lab
  const handleUpdateLab = async () => {
    try {
      setLoading(true)
      setError('')
      setFieldErrors({})
      
      // Validate required fields
      const errors = {}
      if (!newLab.name) errors.name = 'Lab name is required'
      if (!newLab.address) errors.address = 'Address is required'
      if (!newLab.city) errors.city = 'City is required'
      if (!newLab.state) errors.state = 'State is required'
      if (!newLab.pincode) errors.pincode = 'Pincode is required'
      if (!newLab.phone) errors.phone = 'Phone number is required'
      if (!newLab.email) errors.email = 'Email is required'
      if (!newLab.operatingHours.start) errors.operatingHours = 'Operating hours are required'
      if (!newLab.operatingHours.end) errors.operatingHours = 'Operating hours are required'
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setLoading(false)
        return
      }

      // Prepare lab data with required fields (backend expects JSON strings for certain fields)
      const labData = {
        name: newLab.name,
        description: newLab.description || 'Laboratory services and facilities',
        address: JSON.stringify({
          street: newLab.address,
          city: newLab.city,
          state: newLab.state,
          zipCode: newLab.pincode, // Backend expects zipCode, not pincode
          country: 'India'
        }),
        contact: JSON.stringify({
          phone: newLab.phone,
          email: newLab.email,
          website: '' // Add website field as expected by backend
        }),
        operatingHours: JSON.stringify({
          monday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          tuesday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          wednesday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          thursday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          friday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          saturday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: true },
          sunday: { open: newLab.operatingHours.start, close: newLab.operatingHours.end, isOpen: false }
        }),
        availableTests: JSON.stringify(newLab.availableTests),
        availablePackages: JSON.stringify(newLab.availablePackages),
        isActive: newLab.status === 'active'
      }

      // Log the data being sent for debugging
      console.log('Updating lab with data:', labData)

      // Update lab
      const response = await labAPI.updateLab(selectedLab._id, labData)
      
      console.log('Update response:', response)
      
      // Refresh labs list
      await fetchLabs()
      
      // Close modal and reset form
      setShowEditLabModal(false)
      setSelectedLab(null)
      setNewLab({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        contact: '',
        operatingHours: {
          start: '',
          end: ''
        },
        availableTests: [],
        availablePackages: [],
        status: 'active'
      })
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Lab updated successfully!',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK'
      })
      
    } catch (err) {
      let errorMessage = 'Failed to update lab'
      if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Error updating lab:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete lab
  const handleDeleteLab = async (lab) => {
    const result = await Swal.fire({
      title: 'Delete Lab?',
      text: `Are you sure you want to delete "${lab.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    })
    
    if (result.isConfirmed) {
      try {
        await labAPI.deleteLab(lab._id)
        await fetchLabs()
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Lab deleted successfully!',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'OK'
        })
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete lab',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK'
        })
      }
    }
  }

  // Toggle test selection
  const toggleTestSelection = (testId) => {
    setNewLab(prev => ({
      ...prev,
      availableTests: prev.availableTests.includes(testId)
        ? prev.availableTests.filter(id => id !== testId)
        : [...prev.availableTests, testId]
    }))
  }

  // Toggle package selection
  const togglePackageSelection = (packageId) => {
    setNewLab(prev => ({
      ...prev,
      availablePackages: prev.availablePackages.includes(packageId)
        ? prev.availablePackages.filter(id => id !== packageId)
        : [...prev.availablePackages, packageId]
    }))
  }

  // Filter labs
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Convert isActive boolean to status string for filtering
    const labStatus = lab.isActive === true ? 'active' : 'inactive'
    const matchesStatus = filterStatus === 'all' || labStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Labs</h1>
        <p className="text-gray-600">Configure laboratory locations and operational settings</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search labs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => {
              setNewLab({
                name: '',
                description: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                phone: '',
                email: '',
                contact: '',
                operatingHours: {
                  start: '',
                  end: ''
                },
                availableTests: [],
                availablePackages: [],
                status: 'active'
              })
              setFieldErrors({})
              setError('')
              setShowAddLabModal(true)
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lab
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin mr-3" />
            Loading labs...
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No labs found
          </div>
        ) : (
          filteredLabs.map((lab) => (
            <div key={lab._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lab.isActive === true
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {lab.isActive === true ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedLab(lab)
                        
                        // Parse address if it's a string
                        let parsedAddress = lab.address
                        if (typeof lab.address === 'string') {
                          try {
                            parsedAddress = JSON.parse(lab.address)
                          } catch (e) {
                            parsedAddress = { street: lab.address, city: '', state: '', pincode: '' }
                          }
                        }
                        
                        // Parse contact if it's a string
                        let parsedContact = lab.contact
                        if (typeof lab.contact === 'string') {
                          try {
                            parsedContact = JSON.parse(lab.contact)
                          } catch (e) {
                            parsedContact = { phone: lab.contact, email: '', website: '' }
                          }
                        }
                        
                        // Parse operating hours if it's a string
                        let parsedOperatingHours = lab.operatingHours
                        if (typeof lab.operatingHours === 'string') {
                          try {
                            parsedOperatingHours = JSON.parse(lab.operatingHours)
                          } catch (e) {
                            parsedOperatingHours = { monday: { open: '09:00', close: '18:00', isOpen: true } }
                          }
                        }
                        
                        // Extract start and end times from operating hours (use Monday as default)
                        const startTime = parsedOperatingHours?.monday?.open || '09:00'
                        const endTime = parsedOperatingHours?.monday?.close || '18:00'
                        
                        // Parse availableTests and availablePackages if they are strings
                        let parsedAvailableTests = lab.availableTests || []
                        let parsedAvailablePackages = lab.availablePackages || []
                        
                        if (typeof lab.availableTests === 'string') {
                          try {
                            parsedAvailableTests = JSON.parse(lab.availableTests)
                          } catch (e) {
                            parsedAvailableTests = []
                          }
                        }
                        
                        if (typeof lab.availablePackages === 'string') {
                          try {
                            parsedAvailablePackages = JSON.parse(lab.availablePackages)
                          } catch (e) {
                            parsedAvailablePackages = []
                          }
                        }

                        // Extract test IDs from test objects (if they're objects with _id) or keep as-is (if they're already IDs)
                        const testIds = parsedAvailableTests.map(test => {
                          if (typeof test === 'object' && test._id) {
                            return test._id
                          }
                          return test
                        })

                        // Extract package IDs from package objects (if they're objects with _id) or keep as-is (if they're already IDs)
                        const packageIds = parsedAvailablePackages.map(pkg => {
                          if (typeof pkg === 'object' && pkg._id) {
                            return pkg._id
                          }
                          return pkg
                        })

                        console.log('Setting form data - Test IDs:', testIds, 'Package IDs:', packageIds, 'isActive:', lab.isActive, 'Mapped Status:', lab.isActive === true ? 'active' : 'inactive')

                        setNewLab({
                          name: lab.name,
                          description: lab.description || '',
                          address: parsedAddress.street || '',
                          city: parsedAddress.city || '',
                          state: parsedAddress.state || '',
                          pincode: parsedAddress.zipCode || parsedAddress.pincode || '',
                          phone: parsedContact.phone || '',
                          email: parsedContact.email || '',
                          contact: parsedContact.phone || '',
                          operatingHours: { start: startTime, end: endTime },
                          availableTests: testIds,
                          availablePackages: packageIds,
                          status: lab.isActive === true ? 'active' : 'inactive'
                        })
                        setFieldErrors({})
                        setError('')
                        setShowEditLabModal(true)
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLab(lab)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {typeof lab.address === 'string' ? 
                        (() => {
                          try {
                            const addr = JSON.parse(lab.address)
                            return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode || addr.pincode}`
                          } catch (e) {
                            return lab.address
                          }
                        })() : 
                        `${lab.address.street}, ${lab.address.city}, ${lab.address.state} - ${lab.address.zipCode || lab.address.pincode}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>
                      {typeof lab.contact === 'string' ? 
                        (() => {
                          try {
                            const contact = JSON.parse(lab.contact)
                            return contact.phone
                          } catch (e) {
                            return lab.contact
                          }
                        })() : 
                        lab.contact.phone
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>
                      {typeof lab.contact === 'string' ? 
                        (() => {
                          try {
                            const contact = JSON.parse(lab.contact)
                            return contact.email
                          } catch (e) {
                            return ''
                          }
                        })() : 
                        lab.contact.email
                      }
                    </span>
                  </div>
                  {lab.operatingHours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {typeof lab.operatingHours === 'string' ? 
                          (() => {
                            try {
                              const hours = JSON.parse(lab.operatingHours)
                              return `${hours.monday?.open || '09:00'} - ${hours.monday?.close || '18:00'}`
                            } catch (e) {
                              return lab.operatingHours
                            }
                          })() : 
                          `${lab.operatingHours.monday?.open || '09:00'} - ${lab.operatingHours.monday?.close || '18:00'}`
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      Tests: {(() => {
                        let count = lab.availableTests?.length || 0
                        if (typeof lab.availableTests === 'string') {
                          try {
                            const parsed = JSON.parse(lab.availableTests)
                            count = parsed.length
                          } catch (e) {
                            count = 0
                          }
                        }
                        return count
                      })()}
                    </span>
                    <span className="text-gray-500">
                      Packages: {(() => {
                        let count = lab.availablePackages?.length || 0
                        if (typeof lab.availablePackages === 'string') {
                          try {
                            const parsed = JSON.parse(lab.availablePackages)
                            count = parsed.length
                          } catch (e) {
                            count = 0
                          }
                        }
                        return count
                      })()}
                    </span>
                  </div>
                  
                  {/* Show selected tests and packages */}
                  {(() => {
                    // Parse availableTests if it's a string
                    let parsedTests = lab.availableTests || []
                    if (typeof lab.availableTests === 'string') {
                      try {
                        parsedTests = JSON.parse(lab.availableTests)
                      } catch (e) {
                        parsedTests = []
                      }
                    }
                    
                    // Parse availablePackages if it's a string
                    let parsedPackages = lab.availablePackages || []
                    if (typeof lab.availablePackages === 'string') {
                      try {
                        parsedPackages = JSON.parse(lab.availablePackages)
                      } catch (e) {
                        parsedPackages = []
                      }
                    }
                    
                    // Debug logging
                    console.log('Lab:', lab.name, 'Tests:', parsedTests, 'Packages:', parsedPackages)
                    console.log('Available tests array:', tests.length, 'Available packages array:', packages.length)
                    
                    // Debug: Log the structure of first test and package objects
                    if (parsedTests.length > 0) {
                      console.log('First test object structure:', parsedTests[0])
                    }
                    if (parsedPackages.length > 0) {
                      console.log('First package object structure:', parsedPackages[0])
                    }
                    
                    // Get test names - handle both cases: objects with names or IDs to lookup
                    const testNames = parsedTests
                      .map(test => {
                        // If test is an object with a name property, use it directly
                        if (typeof test === 'object' && test.name) {
                          return test.name
                        }
                        // If test is an ID string, look it up in the tests array
                        if (typeof test === 'string') {
                          const foundTest = tests.find(t => t._id === test)
                          return foundTest ? foundTest.name : null
                        }
                        return null
                      })
                      .filter(name => name !== null)
                      .slice(0, 3) // Show only first 3
                    
                    // Get package names - handle both cases: objects with names or IDs to lookup
                    const packageNames = parsedPackages
                      .map(pkg => {
                        // If package is an object with a name property, use it directly
                        if (typeof pkg === 'object' && pkg.name) {
                          return pkg.name
                        }
                        // If package is an ID string, look it up in the packages array
                        if (typeof pkg === 'string') {
                          const foundPackage = packages.find(p => p._id === pkg)
                          return foundPackage ? foundPackage.name : null
                        }
                        return null
                      })
                      .filter(name => name !== null)
                      .slice(0, 3) // Show only first 3
                    
                    console.log('Test names found:', testNames, 'Package names found:', packageNames)
                    
                    return (parsedTests.length > 0 || parsedPackages.length > 0) && (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          {testNames.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-400">Tests: </span>
                              <span className="text-xs text-gray-600">
                                {testNames.join(', ')}
                                {parsedTests.length > 3 && ` +${parsedTests.length - 3} more`}
                              </span>
                            </div>
                          )}
                          {packageNames.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-400">Packages: </span>
                              <span className="text-xs text-gray-600">
                                {packageNames.join(', ')}
                                {parsedPackages.length > 3 && ` +${parsedPackages.length - 3} more`}
                              </span>
                            </div>
                          )}
                          {testNames.length === 0 && packageNames.length === 0 && (parsedTests.length > 0 || parsedPackages.length > 0) && (
                            <div className="text-xs text-gray-400">
                              Tests/Packages selected but names not found in database
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Lab Modal */}
      {showAddLabModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Lab</h3>
                <button
                  onClick={() => setShowAddLabModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                      <input
                        type="text"
                        value={newLab.name}
                        onChange={(e) => {
                          setNewLab({...newLab, name: e.target.value})
                          if (fieldErrors.name) {
                            setFieldErrors(prev => ({...prev, name: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newLab.status}
                        onChange={(e) => setNewLab({...newLab, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newLab.description}
                      onChange={(e) => {
                        setNewLab({...newLab, description: e.target.value})
                        if (fieldErrors.description) {
                          setFieldErrors(prev => ({...prev, description: ''}))
                        }
                      }}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        fieldErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Describe the lab services and facilities"
                    />
                    {fieldErrors.description && (
                      <p className="text-red-600 text-xs mt-1">{fieldErrors.description}</p>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Address Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={newLab.address}
                        onChange={(e) => {
                          setNewLab({...newLab, address: e.target.value})
                          if (fieldErrors.address) {
                            setFieldErrors(prev => ({...prev, address: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.address && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={newLab.city}
                          onChange={(e) => {
                            setNewLab({...newLab, city: e.target.value})
                            if (fieldErrors.city) {
                              setFieldErrors(prev => ({...prev, city: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.city && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={newLab.state}
                          onChange={(e) => {
                            setNewLab({...newLab, state: e.target.value})
                            if (fieldErrors.state) {
                              setFieldErrors(prev => ({...prev, state: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.state && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={newLab.pincode}
                          onChange={(e) => {
                            setNewLab({...newLab, pincode: e.target.value})
                            if (fieldErrors.pincode) {
                              setFieldErrors(prev => ({...prev, pincode: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.pincode && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newLab.phone}
                        onChange={(e) => {
                          setNewLab({...newLab, phone: e.target.value})
                          if (fieldErrors.phone) {
                            setFieldErrors(prev => ({...prev, phone: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 09496268372"
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newLab.email}
                        onChange={(e) => {
                          setNewLab({...newLab, email: e.target.value})
                          if (fieldErrors.email) {
                            setFieldErrors(prev => ({...prev, email: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Operating Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newLab.operatingHours.start}
                        onChange={(e) => {
                          setNewLab(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, start: e.target.value }
                          }))
                          if (fieldErrors.operatingHours) {
                            setFieldErrors(prev => ({...prev, operatingHours: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.operatingHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={newLab.operatingHours.end}
                        onChange={(e) => {
                          setNewLab(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, end: e.target.value }
                          }))
                          if (fieldErrors.operatingHours) {
                            setFieldErrors(prev => ({...prev, operatingHours: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.operatingHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  {fieldErrors.operatingHours && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.operatingHours}</p>
                  )}
                </div>

                {/* Available Tests */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Tests</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {tests.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tests available. Please add tests first.</p>
                    ) : (
                      tests.map((test) => (
                        <label key={test._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newLab.availableTests.includes(test._id)}
                            onChange={() => toggleTestSelection(test._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{test.name}</div>
                            <div className="text-xs text-gray-500">₹{test.price} • {test.category}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Packages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Packages</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {packages.length === 0 ? (
                      <p className="text-gray-500 text-sm">No packages available. Please add packages first.</p>
                    ) : (
                      packages.map((packageItem) => (
                        <label key={packageItem._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newLab.availablePackages.includes(packageItem._id)}
                            onChange={() => togglePackageSelection(packageItem._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{packageItem.name}</div>
                            <div className="text-xs text-gray-500">₹{packageItem.price} • {packageItem.selectedTests?.length || 0} tests</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddLabModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLab}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Lab'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lab Modal */}
      {showEditLabModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Lab</h3>
                <button
                  onClick={() => setShowEditLabModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                      <input
                        type="text"
                        value={newLab.name}
                        onChange={(e) => {
                          setNewLab({...newLab, name: e.target.value})
                          if (fieldErrors.name) {
                            setFieldErrors(prev => ({...prev, name: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newLab.status}
                        onChange={(e) => setNewLab({...newLab, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newLab.description}
                      onChange={(e) => {
                        setNewLab({...newLab, description: e.target.value})
                        if (fieldErrors.description) {
                          setFieldErrors(prev => ({...prev, description: ''}))
                        }
                      }}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        fieldErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Describe the lab services and facilities"
                    />
                    {fieldErrors.description && (
                      <p className="text-red-600 text-xs mt-1">{fieldErrors.description}</p>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Address Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={newLab.address}
                        onChange={(e) => {
                          setNewLab({...newLab, address: e.target.value})
                          if (fieldErrors.address) {
                            setFieldErrors(prev => ({...prev, address: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.address && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={newLab.city}
                          onChange={(e) => {
                            setNewLab({...newLab, city: e.target.value})
                            if (fieldErrors.city) {
                              setFieldErrors(prev => ({...prev, city: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.city && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={newLab.state}
                          onChange={(e) => {
                            setNewLab({...newLab, state: e.target.value})
                            if (fieldErrors.state) {
                              setFieldErrors(prev => ({...prev, state: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.state && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={newLab.pincode}
                          onChange={(e) => {
                            setNewLab({...newLab, pincode: e.target.value})
                            if (fieldErrors.pincode) {
                              setFieldErrors(prev => ({...prev, pincode: ''}))
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {fieldErrors.pincode && (
                          <p className="text-red-600 text-xs mt-1">{fieldErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newLab.phone}
                        onChange={(e) => {
                          setNewLab({...newLab, phone: e.target.value})
                          if (fieldErrors.phone) {
                            setFieldErrors(prev => ({...prev, phone: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 09496268372"
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newLab.email}
                        onChange={(e) => {
                          setNewLab({...newLab, email: e.target.value})
                          if (fieldErrors.email) {
                            setFieldErrors(prev => ({...prev, email: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Operating Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newLab.operatingHours.start}
                        onChange={(e) => {
                          setNewLab(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, start: e.target.value }
                          }))
                          if (fieldErrors.operatingHours) {
                            setFieldErrors(prev => ({...prev, operatingHours: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.operatingHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={newLab.operatingHours.end}
                        onChange={(e) => {
                          setNewLab(prev => ({
                            ...prev,
                            operatingHours: { ...prev.operatingHours, end: e.target.value }
                          }))
                          if (fieldErrors.operatingHours) {
                            setFieldErrors(prev => ({...prev, operatingHours: ''}))
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.operatingHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  {fieldErrors.operatingHours && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.operatingHours}</p>
                  )}
                </div>

                {/* Available Tests */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Tests</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {tests.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tests available. Please add tests first.</p>
                    ) : (
                      tests.map((test) => (
                        <label key={test._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newLab.availableTests.includes(test._id)}
                            onChange={() => toggleTestSelection(test._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{test.name}</div>
                            <div className="text-xs text-gray-500">₹{test.price} • {test.category}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Packages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Packages</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {packages.length === 0 ? (
                      <p className="text-gray-500 text-sm">No packages available. Please add packages first.</p>
                    ) : (
                      packages.map((packageItem) => (
                        <label key={packageItem._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newLab.availablePackages.includes(packageItem._id)}
                            onChange={() => togglePackageSelection(packageItem._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{packageItem.name}</div>
                            <div className="text-xs text-gray-500">₹{packageItem.price} • {packageItem.selectedTests?.length || 0} tests</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditLabModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLab}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Lab'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageLabs