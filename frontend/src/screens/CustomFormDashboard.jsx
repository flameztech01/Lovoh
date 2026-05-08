// screens/CustomFormDashboard.jsx - Updated with renamed imports & links
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlusCircle, FaClipboardList, FaUsers, FaChartBar,
  FaEye, FaEdit, FaTrashAlt, FaCopy, FaSpinner,
  FaStar, FaFolderOpen, FaCheckCircle,
} from 'react-icons/fa';
import { useGetMyCustomFormsQuery, useDeleteCustomFormMutation, useDuplicateCustomFormMutation } from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const CustomFormDashboard = () => {
  const { data: formsData, isLoading } = useGetMyCustomFormsQuery({ sort: '-updatedAt', limit: 20 });
  const [deleteForm] = useDeleteCustomFormMutation();
  const [duplicateForm] = useDuplicateCustomFormMutation();

  const forms = formsData?.forms || [];
  const total = formsData?.total || 0;
  const publishedForms = forms.filter(f => f.status === 'published').length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissions || 0), 0);
  const totalViews = forms.reduce((sum, f) => sum + (f.views || 0), 0);

  const handleDelete = async (id) => {
    if (!confirm('Delete this form and all its submissions?')) return;
    try { await deleteForm(id).unwrap(); toast.success('Form deleted'); } catch { toast.error('Failed'); }
  };

  const handleDuplicate = async (id) => {
    try { await duplicateForm(id).unwrap(); toast.success('Form duplicated'); } catch { toast.error('Failed'); }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const s = { published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600', closed: 'bg-red-100 text-red-600', archived: 'bg-yellow-100 text-yellow-700' };
    return { label: status.charAt(0).toUpperCase()+status.slice(1), color: s[status] || s.draft };
  };

  const getTypeIcon = (type) => ({ form: FaClipboardList, quiz: FaStar, survey: FaChartBar, registration: FaUsers })[type] || FaClipboardList;

  if (isLoading) return <div className="min-h-screen bg-gray-50"><CustomFormSidebar /><div className="lg:ml-[280px] flex justify-center items-center h-96"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin"/></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />
      <div className="lg:ml-[280px] p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-900">Forms Dashboard</h1><p className="text-gray-500 text-sm mt-1">Create and manage your custom forms</p></div>
          <Link to="/custom-form/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952]"><FaPlusCircle/> Create New Form</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[{label:'Total Forms',value:total,icon:FaFolderOpen,color:'bg-blue-50 text-blue-600'},
            {label:'Published',value:publishedForms,icon:FaCheckCircle,color:'bg-green-50 text-green-600'},
            {label:'Submissions',value:totalSubmissions,icon:FaClipboardList,color:'bg-purple-50 text-purple-600'},
            {label:'Total Views',value:totalViews,icon:FaEye,color:'bg-orange-50 text-orange-600'}]
            .map((s,i)=>(
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}><s.icon/></div>
              </div>
            </div>
          ))}
        </div>

        {forms.length===0?(
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaClipboardList className="text-2xl text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-500 mb-4">Create your first form to get started</p>
            <Link to="/custom-form/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium"><FaPlusCircle/> Create Form</Link>
          </div>
        ):(
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Form</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Subs</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Views</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forms.map((form)=>{
                    const sb=getStatusBadge(form.status);
                    const Ti=getTypeIcon(form.type);
                    return(
                      <tr key={form._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#1B3766]/10 rounded-lg flex items-center justify-center"><Ti className="text-[#1B3766] text-sm"/></div>
                            <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{form.title}</p><p className="text-xs text-gray-500">{formatDate(form.updatedAt)}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell"><span className="text-xs capitalize text-gray-700">{form.type}</span></td>
                        <td className="px-5 py-4 text-center hidden sm:table-cell"><span className="text-sm font-semibold text-gray-900">{form.submissions||0}</span></td>
                        <td className="px-5 py-4 text-center hidden lg:table-cell"><span className="text-sm text-gray-600">{form.views||0}</span></td>
                        <td className="px-5 py-4 hidden md:table-cell"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${sb.color}`}>{sb.label}</span></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/custom-form/${form._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEye className="text-sm"/></Link>
                            <Link to={`/custom-form/${form._id}/edit`} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><FaEdit className="text-sm"/></Link>
                            <Link to={`/custom-form/${form._id}/submissions`} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><FaClipboardList className="text-sm"/></Link>
                            <button onClick={()=>handleDuplicate(form._id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><FaCopy className="text-sm"/></button>
                            <button onClick={()=>handleDelete(form._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FaTrashAlt className="text-sm"/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFormDashboard;