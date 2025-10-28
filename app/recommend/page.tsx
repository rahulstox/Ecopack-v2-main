'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecommendPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_weight: '',
    product_category: '',
    dimensions: { length: '', width: '', height: '' },
    fragility_level: '',
    shipping_distance: '',
    monthly_shipping_volume: '',
    current_material_used: '',
    budget_per_unit: '',
    sustainability_priority: '',
    moisture_temp_sensitive: false,
    regulatory_compliance: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: value },
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Navigate to history page with cache-busting parameter
        const timestamp = new Date().getTime();
        router.push(`/history?id=${result.id}&_t=${timestamp}`);
        router.refresh();
      } else {
        const errorMsg = result.error || 'Failed to generate recommendation';
        const details = result.details || '';
        alert(`Error: ${errorMsg}${details ? '\n' + details : ''}`);
        console.error('Full error response:', result);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Get Recommendation</h1>
            <p className="text-gray-600 mt-2">
              Enter your product details for AI-powered sustainable packaging recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Weight (g/kg)
              </label>
              <input
                type="text"
                name="product_weight"
                value={formData.product_weight}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 500g"
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <input
                type="text"
                name="product_category"
                value={formData.product_category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Electronics, Food, Cosmetics"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (L x W x H in cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Length"
                />
                <input
                  type="text"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Width"
                />
                <input
                  type="text"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Height"
                />
              </div>
            </div>

            {/* Fragility Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fragility Level
              </label>
              <select
                name="fragility_level"
                value={formData.fragility_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Shipping Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Distance
              </label>
              <select
                name="shipping_distance"
                value={formData.shipping_distance}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select distance</option>
                <option value="local">Local</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>

            {/* Monthly Shipping Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Shipping Volume
              </label>
              <input
                type="text"
                name="monthly_shipping_volume"
                value={formData.monthly_shipping_volume}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 1000"
              />
            </div>

            {/* Current Material Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Material Used
              </label>
              <input
                type="text"
                name="current_material_used"
                value={formData.current_material_used}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Plastic, Cardboard"
              />
            </div>

            {/* Budget Per Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Per Unit (INR)
              </label>
              <input
                type="text"
                name="budget_per_unit"
                value={formData.budget_per_unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 50"
              />
            </div>

            {/* Sustainability Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sustainability Priority (0-5)
              </label>
              <select
                name="sustainability_priority"
                value={formData.sustainability_priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select priority</option>
                <option value="1">1 - Low</option>
                <option value="2">2</option>
                <option value="3">3 - Medium</option>
                <option value="4">4</option>
                <option value="5">5 - High</option>
              </select>
            </div>

            {/* Moisture/Temp Sensitivity */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="moisture_temp_sensitive"
                  checked={formData.moisture_temp_sensitive}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Moisture/Temperature Sensitive
                </span>
              </label>
            </div>

            {/* Regulatory Compliance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regulatory/Compliance Requirements (Optional)
              </label>
              <textarea
                name="regulatory_compliance"
                value={formData.regulatory_compliance}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., FDA approved, food-grade safe"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Generating Recommendation...' : 'Get Recommendation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

