import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  TestTube, 
  Building2,
  Download,
  RefreshCw,
  Filter,
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import api from '../services/api'

const AdminReports = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [aiInsights, setAiInsights] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedMetric, setSelectedMetric] = useState('all')
  
  // API key constant - fallback for environment variable
  const API_KEY = 'AIzaSyAywhccPmyHxbbK_D5hhM6n7tC8PnX_El0'
  
  // Initialize Google Generative AI with useMemo to prevent recreation on every render
  const genAI = useMemo(() => new GoogleGenerativeAI(API_KEY), [])

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.adminAPI.getAnalytics({
        period: selectedPeriod,
        metric: selectedMetric
      })
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        setError(response.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, selectedMetric])

  // Generate AI insights
  const generateAIInsights = useCallback(async () => {
    if (!analytics) return

    try {
      setAnalyzing(true)
      
      const prompt = `
As a business intelligence AI assistant, analyze the following laboratory management system data and provide comprehensive insights:

LABORATORY ANALYTICS DATA:
${JSON.stringify(analytics, null, 2)}

Please provide:
1. KEY PERFORMANCE INDICATORS: Highlight the most important metrics and trends
2. BUSINESS INSIGHTS: What do these numbers tell us about the business performance?
3. GROWTH OPPORTUNITIES: Identify areas for improvement and expansion
4. OPERATIONAL EFFICIENCY: Analyze lab utilization and staff performance
5. FINANCIAL HEALTH: Assess revenue trends and cost optimization opportunities
6. CUSTOMER SATISFACTION: Evaluate booking patterns and service quality
7. RECOMMENDATIONS: Specific actionable steps for improvement
8. RISK ASSESSMENT: Identify potential issues or concerns

Format your response in a clear, structured manner suitable for executive review. Focus on actionable insights and data-driven recommendations.

IMPORTANT: Format your response as plain text without any markdown formatting, asterisks (*), bold text (**), or other special characters. Use simple bullet points with dashes (-) if needed, and keep the formatting clean and readable.
      `

      let insights = ''
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await model.generateContent(prompt)
        const response = await result.response
        insights = response.text()
      } catch (libraryError) {
        console.warn('GoogleGenerativeAI library failed, trying direct API call:', libraryError.message)
        
        // Fallback to direct API call
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        })
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        insights = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated'
      }

      setAiInsights(insights)
    } catch (error) {
      console.error('AI Analysis error:', error)
      setAiInsights('Sorry, I encountered an error while analyzing the data. Please try again later.')
    } finally {
      setAnalyzing(false)
    }
  }, [analytics, genAI])

  // Load analytics on component mount and when filters change
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-generate AI insights when analytics data changes
  useEffect(() => {
    if (analytics) {
      generateAIInsights()
    }
  }, [analytics, generateAIInsights])

  // Mock data for demonstration (replace with real API calls)
  const mockAnalytics = {
    overview: {
      totalBookings: 1247,
      totalRevenue: 456789,
      activeLabs: 12,
      totalUsers: 3421,
      bookingGrowth: 15.3,
      revenueGrowth: 22.7,
      userGrowth: 8.9
    },
    bookings: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 20
      })),
      byStatus: [
        { status: 'confirmed', count: 456, percentage: 36.6 },
        { status: 'completed', count: 389, percentage: 31.2 },
        { status: 'pending', count: 234, percentage: 18.8 },
        { status: 'cancelled', count: 168, percentage: 13.5 }
      ],
      byLab: [
        { labId: 'lab1', labName: 'Central Lab', count: 234, revenue: 89765 },
        { labId: 'lab2', labName: 'North Lab', count: 198, revenue: 75643 },
        { labId: 'lab3', labName: 'South Lab', count: 176, revenue: 67890 },
        { labId: 'lab4', labName: 'East Lab', count: 145, revenue: 54321 },
        { labId: 'lab5', labName: 'West Lab', count: 123, revenue: 45678 }
      ]
    },
    revenue: {
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
        revenue: Math.floor(Math.random() * 50000) + 30000
      })),
      byPaymentMethod: [
        { method: 'pay_now', count: 567, amount: 234567 },
        { method: 'pay_at_lab', count: 456, amount: 189234 },
        { method: 'insurance', count: 224, amount: 33000 }
      ]
    },
    tests: {
      popular: [
        { testName: 'Complete Blood Count', count: 456, revenue: 45600 },
        { testName: 'Lipid Profile', count: 389, revenue: 38900 },
        { testName: 'Thyroid Function', count: 234, revenue: 23400 },
        { testName: 'Diabetes Panel', count: 198, revenue: 19800 },
        { testName: 'Liver Function', count: 156, revenue: 15600 }
      ],
      categories: [
        { category: 'blood', count: 567, percentage: 45.5 },
        { category: 'urine', count: 234, percentage: 18.8 },
        { category: 'imaging', count: 189, percentage: 15.2 },
        { category: 'cardiology', count: 156, percentage: 12.5 },
        { category: 'pathology', count: 101, percentage: 8.1 }
      ]
    },
    users: {
      newRegistrations: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      })),
      activeUsers: 2847,
      retentionRate: 78.5
    },
    performance: {
      averageBookingTime: 24.5,
      labUtilization: 82.3,
      customerSatisfaction: 4.6,
      reportDeliveryTime: 18.7
    }
  }

  // Use mock data if API fails
  const displayAnalytics = analytics || mockAnalytics

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into laboratory operations and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={formatNumber(displayAnalytics.overview.totalBookings)}
          change={displayAnalytics.overview.bookingGrowth}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(displayAnalytics.overview.totalRevenue)}
          change={displayAnalytics.overview.revenueGrowth}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Labs"
          value={displayAnalytics.overview.activeLabs}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Total Users"
          value={formatNumber(displayAnalytics.overview.totalUsers)}
          change={displayAnalytics.overview.userGrowth}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Chart visualization would be implemented here</p>
              <p className="text-sm">Daily bookings: {displayAnalytics.bookings.daily.length} days</p>
            </div>
          </div>
        </div>

        {/* Revenue by Lab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Lab</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {displayAnalytics.bookings.byLab.map((lab, index) => (
              <div key={lab.labId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 bg-${['blue', 'green', 'purple', 'orange', 'red'][index % 5]}-500`}></div>
                  <span className="text-sm font-medium text-gray-700">{lab.labName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(lab.revenue)}</p>
                  <p className="text-xs text-gray-500">{lab.count} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Tests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Tests</h3>
            <TestTube className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {displayAnalytics.tests.popular.map((test, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{test.testName}</p>
                  <p className="text-xs text-gray-500">{test.count} tests</p>
                </div>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(test.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {displayAnalytics.bookings.byStatus.map((status, index) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status.status === 'confirmed' ? 'bg-green-500' :
                    status.status === 'completed' ? 'bg-blue-500' :
                    status.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{status.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{status.count}</p>
                  <p className="text-xs text-gray-500">{status.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lab Utilization</span>
              <span className="text-sm font-semibold text-gray-900">{displayAnalytics.performance.labUtilization}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Booking Time</span>
              <span className="text-sm font-semibold text-gray-900">{displayAnalytics.performance.averageBookingTime}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Report Delivery</span>
              <span className="text-sm font-semibold text-gray-900">{displayAnalytics.performance.reportDeliveryTime}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-semibold text-gray-900">{displayAnalytics.performance.customerSatisfaction}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Business Insights</h3>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={analyzing || !analytics}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
        
        {aiInsights ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {aiInsights}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>AI insights will appear here once analysis is complete</p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-600">⚠️</div>
            <div className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> AI insights are generated based on available data and should be used as guidance. Always verify important business decisions with additional analysis and expert consultation.
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
          <Download className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            PDF Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Excel Export
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            CSV Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
