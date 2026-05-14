// screens/EventDashboardWallet.jsx - No manual withdraw, auto-settlement via Paystack
import React, { useState } from 'react';
import {
  FaWallet,
  FaMoneyBillWave,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaPlus,
  FaUniversity,
  FaExchangeAlt,
  FaInfoCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import {
  useGetWalletInfoQuery,
  useSetupWalletMutation,
  useGetBanksQuery,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardWallet = () => {
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletInfoQuery();
  const { data: banksData, isLoading: banksLoading } = useGetBanksQuery();
  const [setupWallet, { isLoading: isSettingUp }] = useSetupWalletMutation();

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [setupForm, setSetupForm] = useState({
    accountNumber: '',
    bankCode: '',
    businessName: '',
  });

  const wallet = walletData || {};
  const banks = banksData?.filter(bank => bank.type === 'nuban') || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleSetupChange = (e) => {
    setSetupForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getBankName = (code) => {
    const bank = banks.find(b => b.code === code);
    return bank ? bank.name : code;
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    
    if (!setupForm.accountNumber || !setupForm.bankCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (setupForm.accountNumber.length < 10) {
      toast.error('Please enter a valid account number (10 digits)');
      return;
    }

    try {
      await setupWallet({
        accountNumber: setupForm.accountNumber,
        bankCode: setupForm.bankCode,
        businessName: setupForm.businessName || undefined,
      }).unwrap();
      
      toast.success('Wallet set up successfully!');
      setShowSetupModal(false);
      setSetupForm({ accountNumber: '', bankCode: '', businessName: '' });
      setBankSearch('');
      refetchWallet();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to set up wallet');
    }
  };

  if (walletLoading) {
    return (
      <EventDashboardSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </EventDashboardSidebar>
    );
  }

  // No wallet set up
  if (!wallet.hasWallet) {
    return (
      <EventDashboardSidebar>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-500 mb-8 text-sm">Set up your payment wallet to receive earnings from paid events</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaWallet className="text-3xl text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Set Up Your Payment Wallet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Connect your bank account to receive earnings from paid events. You keep 94% of every ticket sale.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <FaInfoCircle /> What you need:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-6">
                <li>• Your bank account number</li>
                <li>• Bank name</li>
                <li>• Secure & powered by Paystack</li>
              </ul>
            </div>

            <button
              onClick={() => setShowSetupModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all shadow-md"
            >
              <FaPlus /> Set Up Wallet
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <FaMoneyBillWave className="text-2xl text-[#1B3766] mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">94% Earnings</p>
              <p className="text-xs text-gray-500 mt-1">You keep 94% of ticket sales</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <FaExchangeAlt className="text-2xl text-[#1B3766] mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Auto Settlement</p>
              <p className="text-xs text-gray-500 mt-1">Paystack settles to your bank</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <FaUniversity className="text-2xl text-[#1B3766] mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Direct to Bank</p>
              <p className="text-xs text-gray-500 mt-1">No manual withdrawal needed</p>
            </div>
          </div>
        </div>

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSetupModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Set Up Payment Wallet</h3>
              </div>
              
              <form onSubmit={handleSetupSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={setupForm.accountNumber}
                    onChange={handleSetupChange}
                    placeholder="10-digit NUBAN account number"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank *</label>
                  {banksLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                      <FaSpinner className="animate-spin" /> Loading banks...
                    </div>
                  ) : !setupForm.bankCode ? (
                    <>
                      <input
                        type="text"
                        placeholder="Search for your bank..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredBanks.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            {bankSearch ? 'No banks found' : 'Type to search banks'}
                          </p>
                        ) : (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setSetupForm(prev => ({ ...prev, bankCode: bank.code }));
                                setBankSearch(bank.name);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-[#1B3766] transition-colors border-b border-gray-50 last:border-0"
                            >
                              <span className="font-medium">{bank.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-[#1B3766]">{getBankName(setupForm.bankCode)}</span>
                      <button type="button" onClick={() => { setSetupForm(prev => ({ ...prev, bankCode: '' })); setBankSearch(''); }}
                        className="text-red-500 hover:text-red-600"><FaTimesCircle /></button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name (Optional)</label>
                  <input type="text" name="businessName" value={setupForm.businessName} onChange={handleSetupChange}
                    placeholder="Your business or brand name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                  Your bank details are securely stored with Paystack. Earnings are automatically settled to your account.
                </div>
              </form>

              <div className="p-6 border-t border-gray-100 space-y-2">
                <button type="submit" onClick={handleSetupSubmit} disabled={isSettingUp}
                  className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all disabled:opacity-50">
                  {isSettingUp ? 'Setting up...' : 'Set Up Wallet'}
                </button>
                <button type="button" onClick={() => setShowSetupModal(false)}
                  className="w-full py-2 text-gray-500 text-sm hover:text-gray-700">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </EventDashboardSidebar>
    );
  }

  // Wallet IS set up
  return (
    <EventDashboardSidebar>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
        <p className="text-gray-500 mb-8 text-sm">Your earnings are automatically settled to your bank account by Paystack</p>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#1B3766] via-[#1B3766] to-blue-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaWallet className="text-xl" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Lifetime Earnings</p>
                <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(wallet.totalEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-xs">Total Settled</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(wallet.totalWithdrawn || 0)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-xs">Pending Settlement</p>
              <p className="text-xl font-bold mt-1">{formatCurrency((wallet.totalEarnings || 0) - (wallet.totalWithdrawn || 0))}</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <p className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <FaInfoCircle /> How settlements work
            </p>
            <p className="text-white/60 text-xs leading-relaxed">
              Paystack automatically settles your earnings to your bank account. 
              Once settled, transactions will show as "Settled" below. 
              Settlement typically takes 1-3 business days depending on your bank.
            </p>
          </div>
        </div>

        {/* Bank Details */}
        {wallet.walletDetails?.accountDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUniversity className="text-[#1B3766]" /> Bank Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <p className="font-semibold text-gray-900">{wallet.walletDetails.accountDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bank</p>
                <p className="font-semibold text-gray-900">{getBankName(wallet.walletDetails.accountDetails.bankCode)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Name</p>
                <p className="font-semibold text-gray-900">{wallet.walletDetails.accountDetails.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Split</p>
                <p className="font-semibold text-green-600">94% to you • 6% platform fee</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaExchangeAlt className="text-[#1B3766]" /> Transaction History
          </h2>

          {(!wallet.transactions || wallet.transactions.length === 0) ? (
            <div className="text-center py-8">
              <FaExchangeAlt className="text-3xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No transactions yet</p>
              <p className="text-gray-400 text-xs mt-1">Earnings from paid events will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallet.transactions.slice(0, 20).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.withdrawn ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {tx.withdrawn ? (
                        <FaCheckCircle className="text-green-600 text-sm" />
                      ) : (
                        <FaClock className="text-blue-600 text-sm" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {tx.event?.title || 'Event Earnings'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${tx.withdrawn ? 'text-green-600' : 'text-blue-600'}`}>
                      +{formatCurrency(tx.creatorShare || tx.totalAmount)}
                    </p>
                    <p className={`text-xs ${tx.withdrawn ? 'text-green-500' : 'text-blue-500'}`}>
                      {tx.withdrawn ? 'Settled' : 'Pending Settlement'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EventDashboardSidebar>
  );
};

export default EventDashboardWallet;