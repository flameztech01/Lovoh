// screens/CustomFormDetail.jsx - Updated with renamed imports
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaEdit, FaCopy, FaTrashAlt, FaEye, FaShare,
  FaSpinner, FaLink, FaCheck, FaPlay, FaPause,
  FaClipboardList, FaChartBar,
} from 'react-icons/fa';
import {
  useGetCustomFormByIdQuery,
  useDeleteCustomFormMutation,
  useDuplicateCustomFormMutation,
  useUpdateCustomFormMutation,
} from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const CustomFormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: form, isLoading, error, refetch } = useGetCustomFormByIdQuery(id);
  const [deleteForm] = useDeleteCustomFormMutation();
  const [duplicateForm] = useDuplicateCustomFormMutation();
  const [updateForm] = useUpdateCustomFormMutation();

  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/form/${form?.slug}`;

  const handleDelete = async () => {
    if (!confirm('Delete this form and all its submissions?')) return;
    try { await deleteForm(id).unwrap(); toast.success('Form deleted'); navigate('/custom-form/dashboard'); } 
    catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async () => {
    try { const result = await duplicateForm(id).unwrap(); toast.success('Form duplicated'); navigate(`/custom-form/${result._id}`); } 
    catch { toast.error('Failed to duplicate'); }
  };

  const handleStatusToggle = async () => {
    const newStatus = form.status === 'published' ? 'closed' : 'published';
    try { await updateForm({ id, data: { status: newStatus } }).unwrap(); toast.success(`Form ${newStatus === 'published' ? 'published' : 'closed'}`); refetch(); } 
    catch { toast.error('Failed'); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl); setCopied(true); toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50"><CustomFormSidebar /><div className="lg:ml-[280px] flex justify-center items-center h-96"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div></div>;
  if (error || !form) return <div className="min-h-screen bg-gray-50"><CustomFormSidebar /><div className="lg:ml-[280px] flex flex-col items-center justify-center h-96"><h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2><Link to="/custom-form/dashboard" className="text-[#1B3766] hover:underline">Back to Dashboard</Link></div></div>;

  const conversionRate = form.views > 0 ? Math.round((form.submissions / form.views) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />
      <div className="lg:ml-[280px] p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/custom-form/dashboard')} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"><FaArrowLeft className="text-sm" /></button>
            <div><h1 className="text-xl font-bold text-gray-900">{form.title}</h1><p className="text-sm text-gray-500">{form.type} • {formatDate(form.createdAt)}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              {copied ? <FaCheck className="text-green-500 text-xs" /> : <FaLink className="text-xs" />}{copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={handleStatusToggle} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${form.status === 'published' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {form.status === 'published' ? <><FaPause className="text-xs" /> Close</> : <><FaPlay className="text-xs" /> Publish</>}
            </button>
            <Link to={`/custom-form/${form._id}/edit`} className="flex items-center gap-1.5 px-3 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium"><FaEdit className="text-xs" /> Edit</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[{label:'Submissions',value:form.submissions||0,icon:FaClipboardList,color:'text-purple-500'},
            {label:'Views',value:form.views||0,icon:FaEye,color:'text-blue-500'},
            {label:'Conversion',value:`${conversionRate}%`,icon:FaChartBar,color:'text-green-500'},
            {label:'Status',value:form.status,isStatus:true,color:form.status==='published'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}]
            .map((stat,i)=>(
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                {stat.isStatus ? <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${stat.color}`}>{stat.value}</span>
                : <p className="text-2xl font-bold text-gray-900">{stat.value}</p>}
                {stat.icon && <stat.icon className={`${stat.color} text-lg`}/>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[{label:'Submissions',icon:FaClipboardList,color:'text-purple-500',path:`/custom-form/${form._id}/submissions`,desc:`${form.submissions||0} responses`},
            {label:'Analytics',icon:FaChartBar,color:'text-blue-500',path:`/custom-form/${form._id}/analytics`,desc:`${form.views||0} views`},
            {label:'Share',icon:FaShare,color:'text-green-500',path:null,desc:'Copy public link',onClick:handleCopyLink},
            {label:'Duplicate',icon:FaCopy,color:'text-orange-500',path:null,desc:'Create a copy',onClick:handleDuplicate}]
            .map((action,i)=>(
            action.path ? (
              <Link key={i} to={action.path} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center group">
                <action.icon className={`text-2xl ${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform`}/>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </Link>
            ) : (
              <button key={i} onClick={action.onClick} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center group">
                <action.icon className={`text-2xl ${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform`}/>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </button>
            )
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Form Preview</h2>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B3766] font-medium hover:underline"><FaEye className="inline mr-1"/>Open public form</a>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{form.title}</h3>
              {form.description && <p className="text-sm text-gray-500 mb-4">{form.description}</p>}
              <div className="space-y-3">
                {form.fields?.map(field=>(
                  <div key={field.id}>
                    {field.type==='heading'?<h4 className="text-base font-semibold text-gray-900 mt-4">{field.label}</h4>
                    :field.type==='paragraph'?<p className="text-sm text-gray-600">{field.label}</p>
                    :field.type==='divider'?<hr className="border-gray-200 my-3"/>
                    :<div><label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.required&&<span className="text-red-500 ml-1">*</span>}</label>
                    <input type={field.type} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled placeholder={field.placeholder}/></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Form Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-700 capitalize">{form.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fields</span><span className="font-medium text-gray-700">{form.fields?.length||0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium text-gray-700 text-xs">{formatDate(form.createdAt)}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Public URL</h3>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 break-all">{publicUrl}</p></div>
              <button onClick={handleCopyLink} className="w-full mt-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{copied?'Copied!':'Copy Link'}</button>
            </div>
            <button onClick={handleDelete} className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"><FaTrashAlt className="inline mr-1"/>Delete Form</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFormDetail;