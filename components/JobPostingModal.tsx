'use client'

import { useState } from 'react'
import { X, Plus, XCircle } from 'lucide-react'
import { JobPostingFormData } from '@/types'

interface JobPostingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function JobPostingModal({ isOpen, onClose, onSuccess }: JobPostingModalProps) {
  const [formData, setFormData] = useState<JobPostingFormData>({
    job_title: '',
    company_name: '',
    company_linkedin_url: '',
    workplace_type: 'Remote',
    job_location: '',
    employment_type: 'Full-time',
    job_description: '',
    skills: [],
    industry: '',
    job_function: '',
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: 'USD',
    expiry_date: undefined,
  })

  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!isOpen) return null

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return true // Optional field
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\/(company|in|pub)\/.+/
    return pattern.test(url)
  }

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
      setSkillInput('')
      if (errors.skills) {
        const newErrors = { ...errors }
        delete newErrors.skills
        setErrors(newErrors)
      }
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value === '' ? undefined : parseFloat(value),
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required'
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required'
    }

    if (!formData.job_location.trim()) {
      newErrors.job_location = 'Job location is required'
    }

    if (!formData.job_description.trim()) {
      newErrors.job_description = 'Job description is required'
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required'
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }

    if (!formData.job_function.trim()) {
      newErrors.job_function = 'Job function is required'
    }

    if (formData.company_linkedin_url && !validateLinkedInUrl(formData.company_linkedin_url)) {
      newErrors.company_linkedin_url = 'Invalid LinkedIn URL format'
    }

    if (
      formData.salary_min !== undefined &&
      formData.salary_max !== undefined &&
      formData.salary_min > formData.salary_max
    ) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum salary'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          company_linkedin_url: formData.company_linkedin_url || undefined,
          expiry_date: formData.expiry_date || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post job')
      }

      // Reset form
      setFormData({
        job_title: '',
        company_name: '',
        company_linkedin_url: '',
        workplace_type: 'Remote',
        job_location: '',
        employment_type: 'Full-time',
        job_description: '',
        skills: [],
        industry: '',
        job_function: '',
        salary_min: undefined,
        salary_max: undefined,
        salary_currency: 'USD',
        expiry_date: undefined,
      })
      setSkillInput('')
      setErrors({})

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Error posting job:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        job_title: '',
        company_name: '',
        company_linkedin_url: '',
        workplace_type: 'Remote',
        job_location: '',
        employment_type: 'Full-time',
        job_description: '',
        skills: [],
        industry: '',
        job_function: '',
        salary_min: undefined,
        salary_max: undefined,
        salary_currency: 'USD',
        expiry_date: undefined,
      })
      setSkillInput('')
      setErrors({})
      setSubmitError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Post New Job</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.job_title ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.job_title && (
              <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.company_name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="e.g., Tech Corp Inc."
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
            )}
          </div>

          {/* Company LinkedIn Page */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company LinkedIn Page (Optional)
            </label>
            <input
              type="url"
              name="company_linkedin_url"
              value={formData.company_linkedin_url}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.company_linkedin_url ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="https://www.linkedin.com/company/your-company"
            />
            {errors.company_linkedin_url && (
              <p className="mt-1 text-sm text-red-600">{errors.company_linkedin_url}</p>
            )}
          </div>

          {/* Workplace Type and Job Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Workplace Type <span className="text-red-500">*</span>
              </label>
              <select
                name="workplace_type"
                value={formData.workplace_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_location"
                value={formData.job_location}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.job_location ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="e.g., San Francisco, CA"
              />
              {errors.job_location && (
                <p className="mt-1 text-sm text-red-600">{errors.job_location}</p>
              )}
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.job_description ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Describe the role, responsibilities, and requirements..."
            />
            {errors.job_description && (
              <p className="mt-1 text-sm text-red-600">{errors.job_description}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a skill and press Enter or click Add"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-green-900"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>

          {/* Industry and Job Function */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.industry ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="e.g., Technology, Healthcare"
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Function <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_function"
                value={formData.job_function}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.job_function ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="e.g., Engineering, Product"
              />
              {errors.job_function && (
                <p className="mt-1 text-sm text-red-600">{errors.job_function}</p>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date || ''}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-slate-500">
              If not specified, the job will expire 30 days from posting date
            </p>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Salary Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min || ''}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Min"
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max || ''}
                  onChange={handleNumberChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.salary_max ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Max"
                  min="0"
                />
                {errors.salary_max && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary_max}</p>
                )}
              </div>
              <div>
                <select
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
