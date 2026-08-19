import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaSearch, FaFilter, FaTasks } from "react-icons/fa";

function TeacherStoryLibrary() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stories/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to load stories');
      const data = await res.json();
      setStories(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Unable to load story library. Displaying sample stories for preview.");
      // Fallback sample data
      setStories([
        { id: 1, title_en: "The Brave Little Acorn", language: "English", grade_level: "Grade 2", description: "A story about courage and growth." },
        { id: 2, title_en: "Ocean Friends", language: "Bilingual", grade_level: "Grade 3", description: "Explore the coral reef with aquatic friends." },
        { id: 3, title_en: "Leo and the Golden Tree", language: "English", grade_level: "Grade 2", description: "A magical adventure in the forest." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story => 
    story.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    story.title_hi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaBookOpen className="text-blue-500" /> Story Library
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Browse stories to assign to your classrooms</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search stories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl transition">
            <FaFilter /> Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <div key={story.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full group">
              <div className="h-40 bg-slate-100 dark:bg-slate-700 relative flex items-center justify-center overflow-hidden">
                {story.cover_image ? (
                  <img src={story.cover_image} alt={story.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <FaBookOpen className="text-5xl text-slate-300 dark:text-slate-500 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 shadow-sm">
                    {story.language || 'English'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-2 leading-tight">
                    {story.title_en}
                  </h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                  {story.description || 'No description available for this story. A wonderful adventure awaits!'}
                </p>
                
                <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                    {story.grade_level || 'Grade 2'}
                  </span>
                  
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <FaTasks /> Assign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherStoryLibrary;
