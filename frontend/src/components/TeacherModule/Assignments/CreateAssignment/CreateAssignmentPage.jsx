
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft as ChevronLeft } from 'react-icons/fi';
import ContentSelector from './ContentSelector';
import RecipientSelector from './RecipientSelector';
import AssignmentDetailsForm from './AssignmentDetailsForm';
import AssignmentReview from './AssignmentReview';
import teacherAssignmentService from '../../../../services/teacherAssignmentService';

const CreateAssignmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Try to pre-populate if coming from Library
  const initialContentType = queryParams.get('contentType');
  const initialContentId = queryParams.get('contentId');
  
  const [step, setStep] = useState(initialContentId ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [assignmentData, setAssignmentData] = useState({
    content_type: initialContentType || '',
    content_id: initialContentId ? parseInt(initialContentId) : null,
    content_title: queryParams.get('contentTitle') || '',
    
    target_type: 'classroom',
    classroom_id: null,
    classroom_name: '',
    student_ids: [],
    
    title: queryParams.get('contentTitle') || '',
    instructions: '',
    start_date: '',
    due_date: ''
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleUpdateData = (newData) => {
    setAssignmentData(prev => ({ ...prev, ...newData }));
  };

  const handleSaveDraft = async () => {
    await submitAssignment(false);
  };

  const handlePublish = async () => {
    await submitAssignment(true);
  };

  const submitAssignment = async (publish) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const dataToSubmit = { ...assignmentData, publish };
      
      await teacherAssignmentService.createAssignment(dataToSubmit);
      
      navigate('/teacher/assignments');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to save assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => step === 1 ? navigate(-1) : prevStep()}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {step === 1 ? 'Back' : 'Previous Step'}
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Assignment</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Step {step} of 4</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        {step === 1 && (
          <ContentSelector 
            data={assignmentData} 
            updateData={handleUpdateData} 
            onNext={nextStep} 
          />
        )}
        
        {step === 2 && (
          <RecipientSelector 
            data={assignmentData} 
            updateData={handleUpdateData} 
            onNext={nextStep} 
          />
        )}
        
        {step === 3 && (
          <AssignmentDetailsForm 
            data={assignmentData} 
            updateData={handleUpdateData} 
            onNext={nextStep} 
          />
        )}
        
        {step === 4 && (
          <AssignmentReview 
            data={assignmentData} 
            isSubmitting={isSubmitting}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
