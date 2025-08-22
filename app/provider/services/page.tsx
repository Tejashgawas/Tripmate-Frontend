'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Calendar,
  Package
} from 'lucide-react';
import { BASE_URL, fetchWithRetry } from '@/lib/auth';

// Types
interface Service {
  id: number;
  type: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  features: Record<string, any>;
  is_available: boolean;
  created_at: string;
}

interface UpdateServiceData {
  type: string;
  title: string;
  description: string;
  rating: number;
  location: string;
  price: number;
  features: Record<string, any>;
  is_available: boolean;
}

export default function ProviderServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithRetry(`${BASE_URL}me/services/list`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json() as Service[];
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Update service
  const updateService = async (serviceId: number, updateData: UpdateServiceData) => {
    try {
      setUpdatingId(serviceId);
      
      const response = await fetchWithRetry(`${BASE_URL}me/services/${serviceId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update service: ${response.status}`);
      }

      // Refresh services list
      await fetchServices();
      setEditingService(null);
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete service
  const deleteService = async (serviceId: number) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(serviceId);
      
      const response = await fetchWithRetry(`${BASE_URL}me/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete service: ${response.status}`);
      }

      // Remove from local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'available' && service.is_available) ||
                         (filterType === 'unavailable' && !service.is_available) ||
                         service.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Get unique service types for filter
  const serviceTypes = Array.from(new Set(services.map(s => s.type)));

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/provider')}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center">
                  <Package className="mr-3 w-8 h-8" />
                  My Services
                </h1>
                <p className="text-blue-100 text-lg opacity-90">
                  Manage and monitor your service offerings
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <span className="text-sm opacity-75">Total Services</span>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-12 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer min-w-48"
          >
            <option value="all">All Services</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchServices}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Services Table */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {services.length === 0 ? 'No Services Found' : 'No Matching Services'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {services.length === 0 
              ? 'Start by creating your first service offering' 
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="w-5 h-5" />
            <span>Add New Service</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Service</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Type</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Location</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Price</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Rating</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    onEdit={(service) => setEditingService(service)}
                    onDelete={(id) => deleteService(id)}
                    isUpdating={updatingId === service.id}
                    isDeleting={deletingId === service.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    </div>
  );
}

// Service Row Component
function ServiceRow({ 
  service, 
  onEdit, 
  onDelete, 
  isUpdating, 
  isDeleting 
}: {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200">
      <td className="p-6">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{service.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{service.description}</p>
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
      <td className="p-6">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">
          {service.type}
        </span>
      </td>
      <td className="p-6">
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{service.location}</span>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center text-slate-900 dark:text-white font-semibold">
          <DollarSign className="w-4 h-4 mr-1" />
          <span>{service.price}</span>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">{service.rating}</span>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center">
          {service.is_available ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 dark:text-green-400 font-medium">Available</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400 font-medium">Unavailable</span>
            </>
          )}
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(service)}
            disabled={isUpdating || isDeleting}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit service"
          >
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(service.id)}
            disabled={isUpdating || isDeleting}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete service"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

// Edit Service Modal Component
function EditServiceModal({
  service,
  onSave,
  onCancel,
  isUpdating
}: {
  service: Service;
  onSave: (data: UpdateServiceData) => void;
  onCancel: () => void;
  isUpdating: boolean;
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
  });

  const [featuresJson, setFeaturesJson] = useState(
    JSON.stringify(service.features, null, 2)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedFeatures = JSON.parse(featuresJson);
      onSave({ ...formData, features: parsedFeatures });
    } catch (err) {
      alert('Invalid JSON in features field');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Service</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Service Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rating
              </label>
              <input
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <textarea
              value={featuresJson}
              onChange={(e) => setFeaturesJson(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
              placeholder='{"feature1": "value1", "feature2": "value2"}'
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Service Available
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUpdating}
              className="px-6 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-indigo-950/20">
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl"></div>
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="w-48 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="w-32 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}