import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ReviewDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [decision, setDecision] = useState('approve')
  const [notes, setNotes] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')

  useEffect(() => {
    fetchReview()
  }, [id])

  const fetchReview = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch review')
      }

      const data = await response.json()
      setReview(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async () => {
    try {
      setProcessing(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/reviews/${id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          decision,
          notes,
          revisionNotes: decision === 'request_revision' ? revisionNotes : ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit decision')
      }

      // Success - refresh and navigate
      await fetchReview()
      setShowDecisionForm(false)
      setNotes('')
      setRevisionNotes('')
      
      // Show success message and redirect after a moment
      setTimeout(() => {
        navigate('/reviews')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'revision_requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const canMakeDecision = review && (review.status === 'pending' || review.status === 'revision_requested')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading review...</p>
        </div>
      </div>
    )
  }

  if (error && !review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => navigate('/reviews')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to Reviews
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/reviews')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Queue
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Details</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {review && ['approved', 'rejected'].includes(review.status) && showDecisionForm === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6"
          >
            <p className="text-green-800 dark:text-green-200">Decision recorded successfully. Redirecting...</p>
          </motion.div>
        )}

        {/* Review Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded ${getPriorityColor(review.priority)}`}>
              {review.priority.toUpperCase()} PRIORITY
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(review.status)}`}>
              {review.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          {/* Type and Title */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {formatType(review.type)}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {review.itemData?.name || `${formatType(review.itemType)} Review`}
            </h2>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reason for Review</h3>
            <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              {review.reason}
            </p>
          </div>

          {/* Policy Rules */}
          {review.policyRules && review.policyRules.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Triggered Policies</h3>
              <div className="flex flex-wrap gap-2">
                {review.policyRules.map((rule) => (
                  <span
                    key={rule}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full"
                  >
                    {formatType(rule)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Item Data */}
          {review.itemData && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Item Details</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(review.itemData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formatDate(review.submittedAt)}</span>
              </div>
              {review.reviewedAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Reviewed:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formatDate(review.reviewedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Notes (if reviewed) */}
          {review.reviewNotes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review Notes</h3>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {review.reviewNotes}
              </p>
            </div>
          )}

          {/* Revision Notes (if revision requested) */}
          {review.revisionNotes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Revision Notes</h3>
              <p className="text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                {review.revisionNotes}
              </p>
            </div>
          )}

          {/* Decision Form */}
          {canMakeDecision && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {!showDecisionForm ? (
                <button
                  onClick={() => setShowDecisionForm(true)}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Make Decision
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Make Your Decision</h3>
                  
                  {/* Decision Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={processing}
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                      <option value="request_revision">Request Revision</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter your review notes..."
                      disabled={processing}
                    />
                  </div>

                  {/* Revision Notes (only show if requesting revision) */}
                  {decision === 'request_revision' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Revision Instructions
                      </label>
                      <textarea
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Specify what changes are needed..."
                        disabled={processing}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDecision}
                      disabled={processing}
                      className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Submit Decision'}
                    </button>
                    <button
                      onClick={() => setShowDecisionForm(false)}
                      disabled={processing}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewDetailPage
