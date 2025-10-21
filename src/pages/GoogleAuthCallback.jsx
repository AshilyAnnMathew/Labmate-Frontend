import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google OAuth Error:', error);
          // Redirect to login with error
          navigate('/login?error=' + encodeURIComponent(error));
          return;
        }

        if (token && userParam) {
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Login user using AuthContext
          login(userData, token);
          
          // Show success message
          console.log('Google OAuth Login successful');
          
          // Role-based redirect
          const userRole = userData.role;
          
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (['staff', 'lab_technician', 'xray_technician'].includes(userRole)) {
            navigate('/staff/dashboard');
          } else if (userRole === 'local_admin') {
            navigate('/localadmin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          console.error('Missing token or user data');
          navigate('/login?error=' + encodeURIComponent('Authentication failed'));
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        navigate('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
