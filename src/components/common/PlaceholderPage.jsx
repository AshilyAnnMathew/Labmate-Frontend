import { motion } from 'framer-motion'
import { Clock, FileText, Users, BarChart3, Settings, Upload, MessageSquare, MapPin, HelpCircle } from 'lucide-react'

const PlaceholderPage = ({ title, description, icon, features = [] }) => {
  // icon is now a component, not a string
  const IconComponent = icon || FileText

  return (
    <div className="p-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <IconComponent className="h-10 w-10 text-primary-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {features.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            This feature is currently under development. We're working hard to bring you 
            the best laboratory management experience.
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold">
            <Clock className="h-5 w-5 mr-2" />
            Development in Progress
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PlaceholderPage
