// screens/BiizzedResubscribeScreen.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { useSubscribeMutation } from '../slices/subscribeApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedResubscribeScreen = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [subscribe, { isLoading }] = useSubscribeMutation();
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('No email address provided.');
      return;
    }

    const doResubscribe = async () => {
      setStatus('loading');
      try {
        await subscribe({
          email,
          preferences: { magazines: true, articles: true, weeklyDigest: true },
        }).unwrap();
        setStatus('success');
        setMessage('You have been resubscribed! You will receive the weekly digest again.');
      } catch (error) {
        setStatus('error');
        setMessage(error?.data?.message || 'Failed to resubscribe. Please try again manually.');
      }
    };

    doResubscribe();
  }, [email, subscribe]);

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="flex justify-center py-20 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <FaSpinner className="animate-spin text-4xl text-[#1B3766] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Resubscribing...</h2>
              <p className="text-gray-500 text-sm">Please wait</p>
            </>
          )}
          {status === 'success' && (
            <>
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Done!</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <Link
                to="/biizzed/feed"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-full font-medium hover:bg-[#142952] transition-colors"
              >
                Back to Feed
                <FaArrowRight className="text-xs" />
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Oops</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <Link
                to="/biizzed/feed"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
              >
                Go to Feed
              </Link>
            </>
          )}
        </div>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedResubscribeScreen;