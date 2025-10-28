'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Recommendation {
  id: number;
  form_input: any;
  ai_output: any;
  carbon_score: number;
  created_at: string;
}

export default function HistoryPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetchRecommendations();
    
    // Refresh when component mounts to get latest data (cache-busting)
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchRecommendations = async () => {
    try {
      // Add cache-busting parameter to always get fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/recommendations?_t=${timestamp}`, {
        cache: 'no-store',
      });
      const result = await response.json();
      if (result.success) {
        setRecommendations(result.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Recommendation History</h1>
          <p className="text-gray-600 mt-2">View past recommendations and their impact</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 text-lg">No recommendations yet</p>
            <Link
              href="/recommend"
              className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Recommendation
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(rec)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {rec.form_input.product_category || 'Product'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(rec.created_at)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Recommended Material:</span>
                          <p className="font-medium text-gray-800">
                            {rec.ai_output?.recommended_materials?.join(', ') || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Carbon Score:</span>
                          <p className="font-medium text-gray-800">{rec.carbon_score}/100</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Estimated Cost:</span>
                          <p className="font-medium text-gray-800">
                            ₹{rec.ai_output?.estimated_cost || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          rec.carbon_score <= 20
                            ? 'bg-green-100 text-green-800'
                            : rec.carbon_score <= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Score: {rec.carbon_score}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
              <DetailModal
                recommendation={selectedItem}
                onClose={() => setSelectedItem(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailModal({
  recommendation,
  onClose,
}: {
  recommendation: Recommendation;
  onClose: () => void;
}) {
  const carbonFootprint = recommendation.ai_output?.carbon_footprint;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recommendation Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Carbon Score */}
            {carbonFootprint && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Carbon Footprint</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {carbonFootprint.total_carbon_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CO₂ Emissions</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {carbonFootprint.total_kg_co2} kg
                    </p>
                  </div>
                </div>

                {carbonFootprint.emission_breakdown && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Emission Breakdown
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-sm text-gray-600">Material:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${carbonFootprint.emission_breakdown.material}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-gray-800">
                          {carbonFootprint.emission_breakdown.material}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-sm text-gray-600">Transport:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${carbonFootprint.emission_breakdown.transport}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-gray-800">
                          {carbonFootprint.emission_breakdown.transport}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-sm text-gray-600">Disposal:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${carbonFootprint.emission_breakdown.disposal}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-gray-800">
                          {carbonFootprint.emission_breakdown.disposal}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {carbonFootprint.suggestions && carbonFootprint.suggestions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggestions</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {carbonFootprint.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Materials */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Recommended Materials
              </h3>
              <div className="space-y-2">
                {recommendation.ai_output?.recommended_materials?.map(
                  (material: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded px-4 py-2 inline-block mr-2 mb-2"
                    >
                      {material}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Cost Comparison */}
            {recommendation.ai_output?.cost_comparison && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cost Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plastic Cost</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{recommendation.ai_output.cost_comparison.plastic_cost}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sustainable Cost</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{recommendation.ai_output.cost_comparison.sustainable_cost}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Savings</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {recommendation.ai_output.cost_comparison.cost_difference_percent > 0
                        ? '+'
                        : ''}
                      {recommendation.ai_output.cost_comparison.cost_difference_percent}% (
                      ₹{recommendation.ai_output.cost_comparison.cost_difference_absolute})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Impact */}
            {recommendation.ai_output?.environmental_impact && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Environmental Impact
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">CO₂ Reduction:</span>{' '}
                    <span className="text-gray-600">
                      {recommendation.ai_output.environmental_impact.co2_reduction}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Disposal Method:</span>{' '}
                    <span className="text-gray-600">
                      {recommendation.ai_output.environmental_impact.disposal_method}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Recyclability:</span>{' '}
                    <span className="text-gray-600">
                      {recommendation.ai_output.environmental_impact.recyclability}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Biodegradability:</span>{' '}
                    <span className="text-gray-600">
                      {recommendation.ai_output.environmental_impact.biodegradability}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendation.ai_output?.recommendations && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Recommendations</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {recommendation.ai_output.recommendations}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

