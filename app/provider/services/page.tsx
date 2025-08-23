"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Star, 
  MapPin, 
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Package,
  Loader2,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Types
interface Service {
  id: number
  type: string
  title: string
  description: string
  location: string
  price: number
  rating: number
  features: Record<string, any>
  is_available: boolean
  created_at: string
}

interface UpdateServiceData {
  type: string
  title: string
  description: string
  rating: number
  location: string
  price: number
  features: Record<string, any>
  is_available: boolean
}

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

// Custom Confirmation Dialog Component
function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-0 max-w-xs sm:max-w-md w-full">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12 disabled:opacity-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProviderServicesPage() {
  const router = useRouter()
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, put, delete:deleteApi, loading: apiLoading, error: apiError } = useApi() // ✅ CHANGED: deleteApi instead of del
  
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // ✅ NEW: Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    serviceId: null as number | null
  })

  // Fetch services using new API system
  const fetchServices = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[SERVICES] Fetching provider services')
      
      const data = await get<Service[]>('/me/services/list')
      setServices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[SERVICES] Error fetching services:', err)
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  // Update service using new API system
  const updateService = async (serviceId: number, updateData: UpdateServiceData) => {
    try {
      setUpdatingId(serviceId)
      console.log('[SERVICES] Updating service:', serviceId, updateData)
      
      await put(`/me/services/${serviceId}`, updateData)
      
      // Refresh services list
      await fetchServices()
      setEditingService(null)
      toast.success('Service updated successfully!')
    } catch (err) {
      console.error('[SERVICES] Error updating service:', err)
      toast.error('Failed to update service')
      setError(err instanceof Error ? err.message : 'Failed to update service')
    } finally {
      setUpdatingId(null)
    }
  }

  // ✅ UPDATED: Show confirmation dialog instead of window.confirm
  const showDeleteConfirmation = (serviceId: number, serviceTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Service',
      message: `Are you sure you want to delete "${serviceTitle}"? This action cannot be undone and will permanently remove the service from your offerings.`,
      serviceId
    })
  }

  // ✅ UPDATED: Delete service using deleteApi instead of del
  const confirmDeleteService = async () => {
    if (!confirmDialog.serviceId) return

    try {
      setDeletingId(confirmDialog.serviceId)
      console.log('[SERVICES] Deleting service:', confirmDialog.serviceId)
      
      await deleteApi(`/me/services/${confirmDialog.serviceId}`) // ✅ CHANGED: deleteApi instead of del
      
      // Remove from local state
      setServices(prev => prev.filter(service => service.id !== confirmDialog.serviceId))
      toast.success('Service deleted successfully!')
      
      // Close confirmation dialog
      setConfirmDialog({ isOpen: false, title: '', message: '', serviceId: null })
    } catch (err) {
      console.error('[SERVICES] Error deleting service:', err)
      toast.error('Failed to delete service')
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    } finally {
      setDeletingId(null)
    }
  }

  // ✅ NEW: Cancel delete confirmation
  const cancelDeleteConfirmation = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', serviceId: null })
  }

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'available' && service.is_available) ||
                         (filterType === 'unavailable' && !service.is_available) ||
                         service.type.toLowerCase() === filterType.toLowerCase()

    return matchesSearch && matchesFilter
  })

  // Get unique service types for filter
  const serviceTypes = Array.from(new Set(services.map(s => s.type)))

  useEffect(() => {
    if (user && user.role === 'provider') {
      fetchServices()
    }
  }, [user])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Button
                  onClick={() => router.push('/provider')}
                  variant="outline"
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 w-10 h-10 sm:w-12 sm:h-12"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight flex items-center">
                    <Package className="mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8" />
                    My Services
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-lg opacity-90">
                    Manage and monitor your service offerings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-white flex-1 sm:flex-none">
                  <span className="text-xs sm:text-sm opacity-75">Total Services</span>
                  <p className="text-lg sm:text-2xl font-bold">{services.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg sm:rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{error}</span>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 p-1"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {/* Filter and Refresh */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-8 h-10 sm:h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Services</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={fetchServices}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-10 sm:h-12 px-4 sm:px-6"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Add Service Button */}
          <Button
            onClick={() => router.push('/provider/create-service')}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 h-10 sm:h-12"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Services Display */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border-0">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {services.length === 0 ? 'No Services Found' : 'No Matching Services'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
              {services.length === 0 
                ? 'Start by creating your first service offering' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            <Button 
              onClick={() => router.push('/provider/create-service')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add New Service
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Service</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Type</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Location</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Price</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Rating</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Status</th>
                      <th className="text-left p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <ServiceRow
                        key={service.id}
                        service={service}
                        onEdit={(service) => setEditingService(service)}
                        onDelete={(id, title) => showDeleteConfirmation(id, title)} // ✅ UPDATED: Pass title for confirmation
                        isUpdating={updatingId === service.id}
                        isDeleting={deletingId === service.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={(service) => setEditingService(service)}
                  onDelete={(id, title) => showDeleteConfirmation(id, title)} // ✅ UPDATED: Pass title for confirmation
                  isUpdating={updatingId === service.id}
                  isDeleting={deletingId === service.id}
                />
              ))}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editingService && (
          <EditServiceModal
            service={editingService}
            onSave={(data) => updateService(editingService.id, data)}
            onCancel={() => setEditingService(null)}
            isUpdating={updatingId === editingService.id}
          />
        )}

        {/* ✅ NEW: Custom Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDeleteService}
          onCancel={cancelDeleteConfirmation}
          isLoading={deletingId === confirmDialog.serviceId}
          confirmText="Delete Service"
          cancelText="Keep Service"
        />
      </div>
    </div>
  )
}

// ✅ UPDATED: Service Row Component for Desktop - Updated onDelete signature
function ServiceRow({ 
  service, 
  onEdit, 
  onDelete, 
  isUpdating, 
  isDeleting 
}: {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (id: number, title: string) => void // ✅ UPDATED: Added title parameter
  isUpdating: boolean
  isDeleting: boolean
}) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200">
      <td className="p-4 sm:p-6">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">{service.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{service.description}</p>
          {Object.keys(service.features).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.keys(service.features).slice(0, 3).map((key) => (
                <span key={key} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  {key}
                </span>
              ))}
              {Object.keys(service.features).length > 3 && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                  +{Object.keys(service.features).length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="p-4 sm:p-6">
        <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0">
          {service.type}
        </Badge>
      </td>
      <td className="p-4 sm:p-6">
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm">{service.location}</span>
        </div>
      </td>
      <td className="p-4 sm:p-6">
        <div className="flex items-center text-slate-900 dark:text-white font-semibold">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-sm sm:text-base">{service.price}</span>
        </div>
      </td>
      <td className="p-4 sm:p-6">
        <div className="flex items-center">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1 fill-current" />
          <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{service.rating}</span>
        </div>
      </td>
      <td className="p-4 sm:p-6">
        <div className="flex items-center">
          {service.is_available ? (
            <>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />
              <span className="text-green-700 dark:text-green-400 font-medium text-xs sm:text-sm">Available</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400 font-medium text-xs sm:text-sm">Unavailable</span>
            </>
          )}
        </div>
      </td>
      <td className="p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onEdit(service)}
            disabled={isUpdating || isDeleting}
            variant="ghost"
            size="sm"
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => onDelete(service.id, service.title)} // ✅ UPDATED: Pass title
            disabled={isUpdating || isDeleting}
            variant="ghost"
            size="sm"
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ✅ UPDATED: Service Card Component for Mobile - Updated onDelete signature
function ServiceCard({ 
  service, 
  onEdit, 
  onDelete, 
  isUpdating, 
  isDeleting 
}: {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (id: number, title: string) => void // ✅ UPDATED: Added title parameter
  isUpdating: boolean
  isDeleting: boolean
}) {
  return (
    <Card className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-base">{service.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{service.description}</p>
        </div>
        <div className="flex gap-2 ml-3">
          <Button
            onClick={() => onEdit(service)}
            disabled={isUpdating || isDeleting}
            variant="ghost"
            size="sm"
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 w-8 h-8"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => onDelete(service.id, service.title)} // ✅ UPDATED: Pass title
            disabled={isUpdating || isDeleting}
            variant="ghost"
            size="sm"
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 w-8 h-8"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Type:</span>
          <Badge className="ml-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 text-xs">
            {service.type}
          </Badge>
        </div>
        <div className="flex items-center">
          <span className="text-slate-500 dark:text-slate-400 mr-2">Status:</span>
          {service.is_available ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 text-slate-400 mr-1" />
          <span className="text-slate-600 dark:text-slate-400 truncate">{service.location}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
          <span className="text-slate-900 dark:text-white font-semibold">{service.price}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">{service.rating}</span>
        </div>
        {Object.keys(service.features).length > 0 && (
          <div className="flex gap-1">
            {Object.keys(service.features).slice(0, 2).map((key) => (
              <span key={key} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                {key}
              </span>
            ))}
            {Object.keys(service.features).length > 2 && (
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                +{Object.keys(service.features).length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

// Edit Service Modal Component (unchanged)
function EditServiceModal({
  service,
  onSave,
  onCancel,
  isUpdating
}: {
  service: Service
  onSave: (data: UpdateServiceData) => void
  onCancel: () => void
  isUpdating: boolean
}) {
  const [formData, setFormData] = useState<UpdateServiceData>({
    type: service.type,
    title: service.title,
    description: service.description,
    rating: service.rating,
    location: service.location,
    price: service.price,
    features: service.features,
    is_available: service.is_available
  })

  const [featuresJson, setFeaturesJson] = useState(
    JSON.stringify(service.features, null, 2)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsedFeatures = JSON.parse(featuresJson)
      onSave({ ...formData, features: parsedFeatures })
    } catch (err) {
      toast.error('Invalid JSON in features field')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-0 max-w-xs sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Edit Service</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Service Type
              </label>
              <Input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Service Title
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Price
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rating
              </label>
              <Input
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Features (JSON)
            </label>
            <Textarea
              value={featuresJson}
              onChange={(e) => setFeaturesJson(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
              placeholder='{"feature1": "value1", "feature2": "value2"}'
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Service Available
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isUpdating}
              variant="outline"
              className="w-full sm:w-auto bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm border-gray-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 h-10 sm:h-12 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Loading Skeleton (unchanged)
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-indigo-950/20 p-4 sm:p-6">
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl sm:rounded-2xl"></div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="h-10 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="flex gap-3">
            <div className="flex-1 h-10 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="w-24 sm:w-32 h-10 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 h-12 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="w-16 sm:w-20 h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
