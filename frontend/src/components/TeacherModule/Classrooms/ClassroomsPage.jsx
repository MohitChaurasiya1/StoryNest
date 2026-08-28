import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserPlus, FaSearch, FaChalkboardTeacher, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';
import ClassroomCard from './ClassroomCard';
import CreateClassroomModal from './CreateClassroomModal';
import CreateStudentModal from './CreateStudentModal';

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
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

  const handleStudentCreated = () => {
    fetchClassrooms();
    setIsCreateStudentModalOpen(false);
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
            Manage your classrooms, student rosters, and learning environments.
          </p>
        </div>
        <div className="parent-header-right flex flex-wrap items-center gap-3">
          <button 
            className="btn btn-secondary"
            onClick={() => setIsCreateStudentModalOpen(true)}
          >
            <FaUserPlus /> Create Student
          </button>
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
          <p>Loading your classrooms...</p>
        </div>
      ) : error ? (
        <div className="card error-banner">
          <FaExclamationTriangle className="error-icon" />
          <div>
            <h4>Could not load classrooms</h4>
            <p>{error}</p>
          </div>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="card text-center py-12">
          <FaChalkboardTeacher className="text-4xl text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No classrooms found</h3>
          <p className="text-muted mb-6">
            {searchQuery ? "No classrooms match your search." : "You don't have any classrooms in this view yet."}
          </p>
          {!searchQuery && activeTab === 'active' && (
            <div className="flex justify-center gap-3">
              <button className="btn btn-secondary" onClick={() => setIsCreateStudentModalOpen(true)}>
                <FaUserPlus /> Create Student
              </button>
              <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Create Classroom
              </button>
            </div>
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

      {isCreateStudentModalOpen && (
        <CreateStudentModal 
          onClose={() => setIsCreateStudentModalOpen(false)}
          onSuccess={handleStudentCreated}
        />
      )}
    </div>
  );
};

export default ClassroomsPage;
