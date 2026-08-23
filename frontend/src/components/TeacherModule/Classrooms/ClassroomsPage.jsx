import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaChalkboardTeacher, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';
import ClassroomCard from './ClassroomCard';
import CreateClassroomModal from './CreateClassroomModal';

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, archived

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const data = await teacherClassroomService.getClassrooms({ status: activeTab });
      setClassrooms(data);
    } catch (err) {
      setError(err.message || 'Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [activeTab]);

  const handleClassroomCreated = () => {
    fetchClassrooms();
    setIsCreateModalOpen(false);
  };

  const filteredClassrooms = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left">
          <h2 className="serif-heading text-white">My Classrooms</h2>
          <p className="text-white/85 mt-2" style={{ fontSize: '0.95rem' }}>
            Manage your classrooms and the students inside.
          </p>
        </div>
        <div className="parent-header-right">
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus /> Create Classroom
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 border-b border-[var(--border-color)] w-full sm:w-auto">
            <button 
              className={`pb-3 px-2 font-bold transition-colors border-b-2 ${activeTab === 'active' ? 'border-[var(--coral)] text-[var(--coral)]' : 'border-transparent text-muted hover:text-[var(--text-primary)]'}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button 
              className={`pb-3 px-2 font-bold transition-colors border-b-2 ${activeTab === 'archived' ? 'border-[var(--coral)] text-[var(--coral)]' : 'border-transparent text-muted hover:text-[var(--text-primary)]'}`}
              onClick={() => setActiveTab('archived')}
            >
              Archived
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search classrooms..." 
              className="form-control pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading-state">
          <FaSpinner className="spinner-icon" />
          <p>Loading classrooms...</p>
        </div>
      ) : error ? (
        <div className="card error-banner">
          <FaExclamationTriangle className="error-icon" />
          <div>
            <h4>Oops! Could not load classrooms</h4>
            <p>{error}</p>
            <button onClick={fetchClassrooms} className="btn btn-secondary mt-2">Retry</button>
          </div>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="empty-card bg-white dark:bg-slate-800 border-2 border-dashed border-[var(--border-color)]">
          <FaChalkboardTeacher className="empty-icon text-5xl mb-4 opacity-50" />
          <h4 className="font-bold text-lg mb-2">
            {searchQuery ? 'No classrooms found' : activeTab === 'active' ? 'Your classroom journey starts here' : 'No archived classrooms'}
          </h4>
          <p className="text-muted mb-6">
            {searchQuery 
              ? 'Try a different search term.' 
              : activeTab === 'active' 
                ? 'Create your first classroom and start managing your students.' 
                : 'Archived classrooms will appear here.'}
          </p>
          {activeTab === 'active' && !searchQuery && (
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <FaPlus /> Create Classroom
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredClassrooms.map(classroom => (
            <ClassroomCard 
              key={classroom.id} 
              classroom={classroom} 
              onUpdate={fetchClassrooms}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateClassroomModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleClassroomCreated}
        />
      )}
    </div>
  );
};

export default ClassroomsPage;
