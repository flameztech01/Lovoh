// components/CustomFormSidebar.jsx - Mobile Friendly with Real Data
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaThLarge, FaPlusCircle, FaClipboardList, FaChartBar,
  FaCog, FaUsers, FaFolderOpen, FaStar, FaArchive,
  FaQuestionCircle, FaClipboardCheck, FaBars, FaTimes,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useGetMyCustomFormsQuery } from '../slices/customFormApiSlice';

const CustomFormSidebar = () => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: formsData } = useGetMyCustomFormsQuery({ sort: '-updatedAt', limit: 5 });
  const forms = formsData?.forms || [];
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissions || 0), 0);

  const menuItems = [
    {
      section: 'Main',
      items: [
        { name: 'Dashboard', icon: FaThLarge, path: '/custom-form/dashboard' },
        { name: 'My Forms', icon: FaFolderOpen, path: '/custom-form/my-forms' },
        { name: 'Create Form', icon: FaPlusCircle, path: '/custom-form/create' },
      ],
    },
    {
      section: 'Manage',
      items: [
        { name: 'Submissions', icon: FaClipboardList, path: '/custom-form/submissions', badge: totalSubmissions || null },
        { name: 'Analytics', icon: FaChartBar, path: '/custom-form/analytics' },
        { name: 'Templates', icon: FaClipboardCheck, path: '/custom-form/templates' },
      ],
    },
    {
      section: 'Organization',
      items: [
        { name: 'Team', icon: FaUsers, path: '/custom-form/team' },
        { name: 'Settings', icon: FaCog, path: '/custom-form/settings' },
      ],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-gray-400';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz': return FaStar;
      case 'survey': return FaChartBar;
      case 'registration': return FaUsers;
      default: return FaClipboardList;
    }
  };

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B3766] rounded-xl flex items-center justify-center">
            <FaClipboardList className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FormFlow</h1>
            <p className="text-[10px] text-gray-500">Form Builder Pro</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <NavLink to="/custom-form/create" onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors">
          <FaPlusCircle className="text-xs" /> Create New Form
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">{section.section}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.name} to={item.path} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#1B3766]/10 text-[#1B3766]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <item.icon className={`text-sm ${isActive ? 'text-[#1B3766]' : 'text-gray-400'}`} />{item.name}
                    {item.badge && item.badge > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {forms.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Recent Forms</p>
            <div className="space-y-1">
              {forms.slice(0, 4).map((form) => {
                const TypeIcon = getTypeIcon(form.type);
                return (
                  <NavLink key={form._id} to={`/custom-form/${form._id}`} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors group">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(form.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><TypeIcon className="text-[10px] text-gray-400" /><p className="text-xs font-medium text-gray-700 truncate group-hover:text-[#1B3766]">{form.title}</p></div>
                      <p className="text-[10px] text-gray-400">{form.submissions || 0} submissions • {form.type}</p>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-4">
        <NavLink to="/custom-form/help" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <FaQuestionCircle className="text-gray-400 text-sm" /> Help & Support
        </NavLink>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {userInfo?.profile ? <img src={userInfo.profile} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold">{(userInfo?.name || 'U')[0].toUpperCase()}</div>}
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{userInfo?.name || 'User'}</p><p className="text-[10px] text-gray-500 truncate">{userInfo?.email || 'user@email.com'}</p></div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"><FaBars className="text-gray-700 text-lg" /></button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl animate-slideIn">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><FaTimes className="text-gray-600 text-sm" /></button>
            <div className="h-full flex flex-col"><NavContent /></div>
          </div>
        </div>
      )}
      <div className="hidden lg:flex lg:flex-col lg:w-[280px] lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-200 z-40"><NavContent /></div>
      <div className="lg:hidden h-4"></div>
      <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } } .animate-slideIn { animation: slideIn 0.3s ease-out; }`}</style>
    </>
  );
};

export default CustomFormSidebar;