import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Star, Crown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { reviewsAPI } from '../utils/api'
import { useSocket } from '../context/SocketContext'

const STATIC_REVIEWS = [
  { _id:'r1', guestName:'Ramesh Verma',   rating:5, occasion:'Wedding Reception · March 2025',  comment:'We hosted my daughter\'s wedding reception here. The garden was beautifully lit, food was excellent, and the coordination team handled everything flawlessly. Highly recommended.', verified:true },
  { _id:'r2', guestName:'Priya Sharma',   rating:5, occasion:'Room Stay · January 2025',         comment:'Stayed 3 nights while visiting Maheshwar. The room was spotless, staff were incredibly warm, and the food genuinely tasty. This place has a real character to it.', verified:true },
  { _id:'r3', guestName:'Ankit Kulkarni', rating:4, occasion:'Corporate Event · Nov 2024',       comment:'We held our annual function here for 300 people. Great AV setup, good parking, and catering was well organised. Will return for our next event without hesitation.', verified:true },
  { _id:'r4', guestName:'Sunita Patel',   rating:5, occasion:'Birthday Party · Dec 2024',        comment:'Hosted my husband\'s 50th birthday here. Everything was decorated exactly as we discussed and the food was outstanding. The team made us feel so special throughout.', verified:true },
  { _id:'r5', guestName:'Vivek Joshi',    rating:5, occasion:'Wedding · October 2024',           comment:'Our wedding at Yashraj Palace was nothing short of magical. The mandap setup, garden lighting, and catering — all top class. The coordinator was available at every step.', verified:true },
  { _id:'r6', guestName:'Meena Agrawal',  rating:4, occasion:'Room Stay · February 2025',        comment:'Very comfortable stay. The room was clean, AC worked well, and the food was delicious — especially the morning paratha. Close to Maheshwar which made sightseeing easy.', verified:true },
]

const REVIEW_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'Yashraj Palace',
  url: 'https://www.yashrajpalace.com/',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '200',
    bestRating: '5',
    worstRating: '1',
  },
  review: STATIC_REVIEWS.map(r => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.guestName },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: '5' },
    reviewBody: r.comment,
    name: r.occasion,
    publisher: { '@type': 'Organization', name: 'Yashraj Palace' },
  })),
}

function StarRow({ rating, size = 13 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} fill={i < rating ? '#C9A84C' : '#E8E0D8'} className={i < rating ? 'text-gold' : 'text-stone-200'} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { subscribe } = useSocket() || {}

  const loadReviews = useCallback(() => {
    reviewsAPI.getAll()
      .then(r => setReviews(r.data.reviews?.length ? r.data.reviews : STATIC_REVIEWS))
      .catch(() => setReviews(STATIC_REVIEWS))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadReviews() }, [loadReviews])

  // Live update: reload when admin approves/features a review
  useEffect(() => {
    if (!subscribe) return
    return subscribe('content_updated', (data) => {
      if (data?.type === 'reviews') loadReviews()
    })
  }, [subscribe, loadReviews])

  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / (reviews.length || 1)).toFixed(1)

  return (
    <>
      <Helmet>
        <title>Guest Reviews – Yashraj Palace | Hotel &amp; Wedding Venue Maheshwar</title>
        <meta name="description" content="Read genuine guest reviews of Yashraj Palace — rated 4.8/5 by 200+ guests. Wedding reviews, room stay reviews, and event feedback from real guests." />
        <link rel="canonical" href="https://www.yashrajpalace.com/reviews" />
        <meta property="og:title" content="Guest Reviews – Yashraj Palace | 4.8★ Rating" />
        <meta property="og:description" content="Rated 4.8 out of 5 by 200+ real guests. Read reviews for room stays, weddings, and events at Yashraj Palace, Mandleshwar." />
        <meta property="og:url" content="https://www.yashrajpalace.com/reviews" />
        <script type="application/ld+json">{JSON.stringify(REVIEW_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guest Reviews', item: 'https://www.yashrajpalace.com/reviews' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container-palace relative z-10 text-center text-white">
          <span className="eyebrow text-gold">Guest Reviews</span>
          <h1 className="font-serif font-bold text-white mt-3 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            What Our Guests Say
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="h-px bg-gold/50 w-16" />
            <Crown size={14} className="text-gold" />
            <span className="h-px bg-gold/50 w-16" />
          </div>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base">
            200+ guests have shared their experience. Here's what they loved about Yashraj Palace.
          </p>
        </div>
      </div>

      {/* ── RATING SUMMARY ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="container-palace py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
            {/* Big score */}
            <div className="text-center">
              <div className="font-serif text-6xl font-bold text-maroon leading-none">{avgRating}</div>
              <div className="flex justify-center gap-0.5 mt-2 mb-1">
                {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="#C9A84C" className="text-gold" />)}
              </div>
              <div className="text-stone-500 text-xs uppercase tracking-wider">{reviews.length}+ verified reviews</div>
            </div>
            <div className="w-px h-14 bg-gold/25 hidden md:block" />
            {/* Sub-ratings */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-center">
              {[['98%','Would Recommend'],['4.9★','Rooms & Cleanliness'],['4.8★','Food & Catering'],['4.9★','Event Management']].map(([v,l]) => (
                <div key={l}>
                  <div className="font-serif text-xl font-bold text-maroon">{v}</div>
                  <div className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS GRID ── */}
      <section className="section-lg" style={{ background: '#FAF7F2' }}>
        <div className="container-palace">
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {reviews.map(r => (
                <article key={r._id}
                  className="bg-white border border-stone-200 p-6 md:p-7 flex flex-col hover:border-gold/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <StarRow rating={r.rating} />
                  <p className="text-stone-500 text-sm leading-relaxed italic my-5 flex-1">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-maroon shrink-0"
                      style={{ background: '#E8C97A' }}>
                      {(r.guestName || r.name || 'G').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-maroon truncate">{r.guestName || r.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{r.occasion || r.eventType || 'Verified Guest'}</div>
                    </div>
                    {r.verified && (
                      <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider shrink-0">✓ Verified</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WRITE A REVIEW CTA ── */}
      <section className="section-md relative overflow-hidden" style={{ background: '#4A0F1D' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)', backgroundSize: '28px 28px', opacity: 0.06 }} />
        <span className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />
        <div className="relative z-10 container-palace text-center text-white">
          <span className="eyebrow text-gold">Share Your Experience</span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.625rem, 3.5vw, 2.5rem)' }}>
            Stayed or Celebrated with Us?
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8 text-sm md:text-base">
            Your honest feedback helps future guests and motivates our entire team to keep doing better.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://g.page/yashrajpalace/review" target="_blank" rel="noreferrer" className="btn-gold btn-lg">
              Write a Google Review
            </a>
            <Link to="/contact" className="btn-outline-gold btn-lg">Contact Us</Link>
          </div>
          <p className="text-white/30 text-[11px] mt-6 uppercase tracking-wider">
            4.8/5 across 200+ verified reviews · Trusted since 2005
          </p>
        </div>
      </section>
    </>
  )
}
