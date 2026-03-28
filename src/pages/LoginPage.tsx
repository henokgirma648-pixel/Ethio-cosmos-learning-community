import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle, sendEmailLink, completeEmailSignIn, isAdmin, isNewUser, completeRegistration } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Handle email sign-in link
    completeEmailSignIn().catch(console.error);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      // Prioritize admin redirect
      if (isAdmin) {
        console.log('Admin detected, navigating to /admin');
        navigate('/admin', { replace: true });
        return;
      }
      
      // If not admin and registration is complete, go home
      if (!isNewUser) {
        console.log('Regular user with completed registration, navigating to /');
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, isNewUser, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in error:', error);
      setActionLoading(false); // Only reset on error, as success will redirect
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setActionLoading(true);
    try {
      await sendEmailLink(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Email link error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center pt-16"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 16, 0.8), rgba(10, 14, 26, 0.95)), url(/images/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isNewUser ? 'Complete Your Profile' : 'Welcome to Ethio-cosmos-learning-community'}
          </h1>
          <p className="text-gray-400">
            {isNewUser ? 'One last step to join the community' : 'Sign in to continue your cosmic journey'}
          </p>
        </div>

        {isNewUser ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-gray-400 mb-8">
              Click the button below to finish your registration and start your cosmic journey.
            </p>
            <Button 
              onClick={async () => {
                setActionLoading(true);
                try {
                  await completeRegistration();
                } catch (error) {
                  console.error('Registration error:', error);
                } finally {
                  setActionLoading(false);
                }
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Complete Registration'}
            </Button>
          </div>
        ) : emailSent ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400">
              We have sent a sign-in link to {email}. Click the link to sign in.
            </p>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <Button 
              variant="outline" 
              className="w-full bg-white text-gray-900 hover:bg-gray-100 border-0 mb-6"
              onClick={handleGoogleSignIn}
              disabled={actionLoading || authLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <Separator className="bg-white/20" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-gray-400 text-sm">
                or
              </span>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border-white/20 text-white placeholder:text-gray-500 mb-4"
                required
              />
              <Button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={actionLoading || authLoading}
              >
                {actionLoading ? 'Sending...' : 'Continue'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
