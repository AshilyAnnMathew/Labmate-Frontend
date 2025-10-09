import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Beaker, 
  Users, 
  FileText, 
  BarChart3, 
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Beaker className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">LabMate360</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">
                About
              </a>
              <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors">
                Services
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </a>
              <Link 
                to="/signup" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign Up
              </Link>
              <Link 
                to="/login" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              LabMate360
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-primary-600 font-semibold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              AI-Powered Smart Clinical Laboratory Software
            </motion.p>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Seamlessly manage diagnostic bookings, reports, and lab operations with our 
              intelligent platform designed for modern healthcare professionals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link 
                to="/login" 
                className="inline-flex items-center bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive laboratory management solutions powered by artificial intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FileText className="h-12 w-12 text-primary-600" />,
                title: "Smart Bookings",
                description: "AI-powered appointment scheduling and management system"
              },
              {
                icon: <BarChart3 className="h-12 w-12 text-primary-600" />,
                title: "Analytics & Reports",
                description: "Comprehensive insights and automated report generation"
              },
              {
                icon: <Users className="h-12 w-12 text-primary-600" />,
                title: "User Management",
                description: "Multi-role access control for staff, patients, and administrators"
              },
              {
                icon: <Beaker className="h-12 w-12 text-primary-600" />,
                title: "Lab Operations",
                description: "Streamlined workflow management for laboratory processes"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About LabMate360</h2>
              <p className="text-lg text-gray-600 mb-6">
                LabMate360 revolutionizes clinical laboratory management with cutting-edge AI technology. 
                Our platform streamlines operations, enhances accuracy, and improves patient care through 
                intelligent automation and comprehensive analytics.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Automated test result processing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Real-time inventory management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Secure patient data handling</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Multi-location lab support</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-primary-600 rounded-2xl p-8 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">Why Choose LabMate360?</h3>
              <p className="text-primary-100 mb-6">
                Our AI-powered platform reduces operational costs by 30% and improves 
                turnaround times by 40% while maintaining the highest standards of accuracy.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm text-primary-200">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm text-primary-200">Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Beaker className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-bold">LabMate360</span>
              </div>
              <p className="text-gray-400">
                AI-powered smart clinical laboratory software for modern healthcare.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-400" />
                  <span className="text-gray-400">info@labmate360.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                  <span className="text-gray-400">123 Healthcare Ave, Medical City</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <a href="#about" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </a>
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">
                  Services
                </a>
                <Link to="/signup" className="block text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
                <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 LabMate360. All rights reserved. Powered by AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
