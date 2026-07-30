import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import { parentRatingsApi } from '../../services/api';
import ToastNotification from './ToastNotification';

export default function StoryFeedback({ storyId }) {
  const [ratings, setRatings] = useState([]);
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchRatings = async () => {
    try {
      const data = await parentRatingsApi.getRatings(storyId);
      const list = Array.isArray(data) ? data : data?.results || [];
      setRatings(list);
      if (list.length > 0) {
        setUserRating(list[0]);
        setRatingVal(list[0].rating);
        setComment(list[0].comment);
      }
    } catch (err) {
      console.warn("Could not load story ratings", err);
    }
  };

  useEffect(() => {
    if (storyId) fetchRatings();
  }, [storyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userRating) {
        await parentRatingsApi.updateRating(userRating.id, { rating: ratingVal, comment });
        setToast({ type: 'success', message: 'Rating updated!' });
      } else {
        await parentRatingsApi.createRating({ story: storyId, rating: ratingVal, comment });
        setToast({ type: 'success', message: 'Rating submitted!' });
      }
      fetchRatings();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to submit rating' });
    }
  };

  const handleDelete = async () => {
    if (!userRating) return;
    try {
      await parentRatingsApi.deleteRating(userRating.id);
      setUserRating(null);
      setComment('');
      setRatingVal(5);
      setToast({ type: 'success', message: 'Rating removed' });
      fetchRatings();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to remove rating' });
    }
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : '5.0';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FaStar className="text-amber-400" /> Parent Feedback & Rating
        </h3>
        <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          Average: {avgRating} ⭐ ({ratings.length} reviews)
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Picker */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Your Rating</label>
          <div className="flex gap-2 text-2xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                onClick={() => setRatingVal(star)}
                className={`transition ${star <= ratingVal ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Feedback Comment</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share feedback on story quality, vocabulary, or moral lesson..."
            className="w-full rounded-2xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          {userRating ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
            >
              <FaTrash /> Remove Rating
            </button>
          ) : <span />}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md hover:scale-105 transition"
          >
            {userRating ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
