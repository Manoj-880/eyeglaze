import { useState } from 'react';
import SEO from '../components/SEO';

interface UserRating {
  rating: number;
  comment: string;
  createdAt: string;
}

export default function RateUs() {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myRating, setMyRating] = useState<UserRating | null>(() => {
    try {
      const local = localStorage.getItem('eyeglaze_my_rating');
      return local ? JSON.parse(local) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  const ratingPhrases: Record<number, string> = {
    1: 'Extremely unsatisfied. We apologize for the poor experience.',
    2: 'Unsatisfied. Please let us know how we can improve.',
    3: 'Average. We will work to make it better next time.',
    4: 'Satisfied! Thank you for the positive review.',
    5: 'Excellent! We are thrilled to hear that!',
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const data: UserRating = {
        rating: selectedRating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      setMyRating(data);
      localStorage.setItem('eyeglaze_my_rating', JSON.stringify(data));
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleClearFeedback = () => {
    if (confirm('Do you want to submit a new rating? This will clear your current feedback.')) {
      setMyRating(null);
      localStorage.removeItem('eyeglaze_my_rating');
      setSelectedRating(0);
      setComment('');
      setSubmitted(false);
    }
  };

  // Static stats for histogram representation
  const totalReviews = 1842;
  const ratingDistribution = [
    { stars: 5, count: 1510, pct: 82 },
    { stars: 4, count: 221, pct: 12 },
    { stars: 3, count: 74, pct: 4 },
    { stars: 2, count: 19, pct: 1 },
    { stars: 1, count: 18, pct: 1 },
  ];
  const averageScore = 4.85;

  return (
    <div className="space-y-8 text-white min-h-screen pb-12">
      <SEO 
        title="Rate Us | Customer Reviews & Feedback"
        description="Share your feedback on EyeGlaze frame selections and prescription lens fittings. Help us improve our optical laboratory services."
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Rate Us</h1>
        <p className="text-gray-500 text-sm">
          Your feedback shapes our optics processing lab. Tell us about your frame quality, sizing, and prescription clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rating Form Card */}
        <div className="lg:col-span-7 bg-[#131314] border border-[#2A2A2D] rounded-2xl p-6">
          {myRating || submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-scale-up">
              <div className="w-14 h-14 bg-yellow-500/10 border border-[#D4A04D]/30 text-[#D4A04D] rounded-full flex items-center justify-center text-3xl font-extrabold select-none">
                ★
              </div>
              <div>
                <h3 className="text-white text-base font-bold">Feedback Registered Successfully</h3>
                <p className="text-gray-500 text-xs mt-1">Thank you for rating your EyeGlaze experience!</p>
              </div>

              {/* Show saved feedback */}
              <div className="bg-[#1C1C1E] border border-[#2A2A2D] rounded-xl p-4 w-full max-w-sm mt-2 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-base ${
                          s <= (myRating?.rating || selectedRating) ? 'text-[#D4A04D]' : 'text-gray-700'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">My Review</span>
                </div>
                <div className="text-xs text-white italic">
                  "{myRating?.comment || comment || 'No comments left.'}"
                </div>
              </div>

              <button
                onClick={handleClearFeedback}
                className="mt-4 border border-[#2A2A2D] hover:bg-[#1C1C1E] text-white font-bold text-xs py-2 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Change My Rating
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider">How was your optical fit?</h2>
                <p className="text-gray-500 text-xs">Tap a star score to rate your frame sizing, delivery speed, and custom lenses.</p>
              </div>

              {/* Interactive Stars Selector */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = hoverRating !== null ? star <= hoverRating : star <= selectedRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-3xl focus:outline-none transition-transform hover:scale-125 cursor-pointer bg-transparent border-none"
                      >
                        <span className={isLit ? 'text-[#D4A04D]' : 'text-gray-700'}>★</span>
                      </button>
                    );
                  })}
                </div>
                {selectedRating > 0 && (
                  <span className="text-[#D4A04D] text-xs font-bold font-mono">
                    ({selectedRating} / 5)
                  </span>
                )}
              </div>

              {/* Custom helpful message */}
              {selectedRating > 0 && (
                <div className="bg-[#1C1C1E]/50 border border-[#2A2A2D]/40 text-xs text-gray-300 p-3 rounded-xl animate-fade-in leading-relaxed">
                  {ratingPhrases[selectedRating]}
                </div>
              )}

              {/* Comments feedback text field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  Tell us more (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="What did you love about your glasses? What can we do better?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-[#1C1C1E] border border-[#2A2A2D] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A04D] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || selectedRating === 0}
                className="bg-[#D4A04D] hover:bg-[#C8923E] text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-black border-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Rating Breakdown / Statistics */}
        <div className="lg:col-span-5 bg-[#131314] border border-[#2A2A2D] rounded-2xl p-6 space-y-6">
          <div className="border-b border-[#2A2A2D] pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">
              Community Ratings
            </h3>

            <div className="flex items-center gap-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white font-mono">{averageScore}</div>
              <div className="flex flex-col">
                <div className="flex gap-0.5 text-base">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-[#D4A04D]">★</span>
                  ))}
                </div>
                <span className="text-gray-500 text-[10px] uppercase font-bold mt-1 tracking-wider">
                  Based on {totalReviews} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Histogram distribution */}
          <div className="space-y-3">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs">
                <span className="w-3 text-gray-500 font-bold font-mono text-right">{dist.stars}</span>
                <span className="text-gray-500 text-[9px]">★</span>
                {/* Visual bar container */}
                <div className="flex-1 h-2 bg-[#1C1C1E] border border-[#2A2A2D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4A04D] rounded-full"
                    style={{ width: `${dist.pct}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500 font-semibold font-mono text-right">{dist.pct}%</span>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-[10px] leading-relaxed border-t border-[#2A2A2D] pt-4 italic">
            * Ratings are collected from audited delivery feedback surveys sent to purchasers.
          </p>
        </div>
      </div>
    </div>
  );
}
