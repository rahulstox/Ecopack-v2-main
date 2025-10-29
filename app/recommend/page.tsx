'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/nextjs';
import jsPDF from 'jspdf';

// Autocomplete suggestions
const productCategories = [
  'Electronics', 'Food & Beverages', 'Cosmetics', 'Clothing & Fashion',
  'Pharmaceuticals', 'Toys', 'Books', 'Home & Kitchen', 'Sports Equipment',
  'Pet Products', 'Automotive Parts', 'Stationery', 'Medical Devices'
];

const materialTypes = [
  'Plastic', 'Cardboard', 'Corrugated Box', 'Bubble Wrap',
  'Foam', 'Glass', 'Metal', 'Paper', 'Biodegradable Plastic',
  'Molded Pulp', 'Recycled Cardboard', 'Kraft Paper'
];

const quickFillTemplates: Record<string, any> = {
  'Smartphone': {
    product_weight: '200g',
    product_category: 'Electronics',
    dimensions: { length: '15', width: '8', height: '1' },
    fragility_level: 'High',
    current_material_used: 'Bubble Wrap',
    sustainability_priority: '5'
  },
  'Laptop': {
    product_weight: '2000g',
    product_category: 'Electronics',
    dimensions: { length: '35', width: '25', height: '5' },
    fragility_level: 'High',
    current_material_used: 'Foam',
    sustainability_priority: '4'
  },
  'Snack Food': {
    product_weight: '100g',
    product_category: 'Food & Beverages',
    dimensions: { length: '10', width: '10', height: '3' },
    fragility_level: 'Medium',
    current_material_used: 'Plastic',
    sustainability_priority: '5'
  },
  'Cosmetic Product': {
    product_weight: '150g',
    product_category: 'Cosmetics',
    dimensions: { length: '8', width: '8', height: '12' },
    fragility_level: 'Low',
    current_material_used: 'Cardboard',
    sustainability_priority: '5'
  }
};

function RecommendPageContent() {
  const { theme } = useTheme();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const viewId = searchParams?.get('view');

  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showMaterialSuggestions, setShowMaterialSuggestions] = useState(false);
  const [co2eSaved, setCo2eSaved] = useState(0);

  // Fetch CO2e saved data
  useEffect(() => {
    const fetchCo2e = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();
        if (data.success && data.thisMonthCo2e) {
          setCo2eSaved(data.thisMonthCo2e);
        }
      } catch (error) {
        console.error('Error fetching CO2e:', error);
      }
    };
    fetchCo2e();
  }, []);

  // Load recommendation if viewId is provided
  useEffect(() => {
    if (viewId) {
      const loadRecommendation = async () => {
        try {
          const response = await fetch(`/api/recommendations/${viewId}`);
          const data = await response.json();

          if (data.success && data.data) {
            setRecommendationData({
              formInput: data.data.form_input,
              aiOutput: data.data.ai_output,
              id: data.data.id
            });
            setShowResults(true);
          }
        } catch (error) {
          console.error('Error loading recommendation:', error);
          alert('Error loading recommendation');
        }
      };

      loadRecommendation();
    }
  }, [viewId]);
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

  const inputClass = (theme === 'dark'
    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
    : 'border-gray-300'
  );

  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-gray-800';

  // Auto-detect weight unit
  const getDefaultShippingDistance = (category: string) => {
    if (['Electronics', 'Pharmaceuticals', 'Medical Devices'].includes(category)) {
      return 'international';
    }
    return 'national';
  };

  const getDefaultFragility = (category: string) => {
    if (['Electronics', 'Medical Devices', 'Glass', 'Cosmetics'].includes(category)) {
      return 'High';
    } else if (['Clothing & Fashion', 'Books', 'Home & Kitchen'].includes(category)) {
      return 'Low';
    }
    return 'Medium';
  };

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
        // Store the complete response including input data and AI output
        setRecommendationData({
          formInput: formData,
          aiOutput: result.data,
          id: result.id
        });
        setShowResults(true);
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

  // Share functionality - generates and shares PDF
  const handleShare = async () => {
    if (!recommendationData) return;

    try {
      // Generate PDF blob
      const data = recommendationData;
      const doc = new jsPDF();

      let yPosition = 25;

      const addText = (text: string, x: number, y: number, options: any = {}) => {
        doc.setTextColor(options.color || 0, 0, 0);
        doc.setFontSize(options.size || 10);
        doc.setFont(options.font || 'helvetica', options.style || 'normal');

        const maxWidth = options.maxWidth || 180;
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, x, y);

        return y + (splitText.length * (options.size || 10) * 0.5);
      };

      // Create minimal PDF with key info
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('EcoPack AI', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sustainability Recommendation', 105, 28, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      yPosition = addText('Product Details', 15, yPosition + 5, { size: 11 });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPosition = addText(`Category: ${formData.product_category}`, 15, yPosition + 4);
      yPosition = addText(`Weight: ${formData.product_weight}`, 15, yPosition);
      yPosition = addText(`Dimensions: ${formData.dimensions.length}×${formData.dimensions.width}×${formData.dimensions.height} cm`, 15, yPosition);

      yPosition += 10;

      const materials = data?.aiOutput?.recommended_materials || ['Molded Pulp', 'Recycled Cardboard'];

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      yPosition = addText('Recommended Materials', 15, yPosition + 5, { size: 11 });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      materials.forEach((material: string) => {
        doc.setFontSize(10);
        yPosition = addText(`✓ ${material}`, 20, yPosition + 6);
      });

      yPosition += 10;

      const currentCost = data?.aiOutput?.cost_comparison?.plastic_cost || data?.aiOutput?.cost_comparison?.current_cost || 30;
      const sustainableCost = data?.aiOutput?.estimated_cost || data?.aiOutput?.cost_comparison?.sustainable_cost || 45;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      yPosition = addText('Cost Analysis', 15, yPosition + 5, { size: 11 });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPosition = addText(`Current Cost: ₹${currentCost}`, 15, yPosition + 4);
      yPosition = addText(`Sustainable Cost: ₹${sustainableCost}`, 15, yPosition);

      yPosition += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      yPosition = addText('Environmental Impact', 15, yPosition + 10, { size: 11 });

      const envImpact = data?.aiOutput?.environmental_impact || {
        co2_reduction: '75% less CO2',
        recyclability: '100% recyclable'
      };

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      Object.entries(envImpact).slice(0, 3).forEach(([key, value]) => {
        yPosition = addText(`${key.replace(/_/g, ' ')}: ${value}`, 15, yPosition + 4);
      });

      // Convert to blob
      const pdfBlob = doc.output('blob');
      const fileName = `EcoPack-${formData.product_category || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Try to use Web Share API with file
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'EcoPack AI - Sustainability Recommendation',
            text: `Check out my sustainable packaging recommendation for ${formData.product_category}`,
            files: [file],
          });
          return;
        }
      }

      // Fallback: Download and show share option
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      alert('PDF downloaded! You can now share it through your device\'s sharing options.');
    } catch (error) {
      console.error('Share failed:', error);
      alert('Unable to generate PDF. Please try again.');
    }
  };

  // Export Report functionality - Advanced PDF with Charts
  const handleExportReport = () => {
    const data = recommendationData;
    const doc = new jsPDF('p', 'mm', 'a4'); // Explicit A4 format
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    let yPosition = 25;

    // Helper function to add text with wrapping - fixed for clean text
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const size = options.size || 10;
      const maxWidth = options.maxWidth || contentWidth;

      doc.setTextColor(options.color || 0, 0, 0);
      doc.setFontSize(size);
      doc.setFont(options.font || 'helvetica', options.style || 'normal');

      // Clean text by removing any special characters that cause encoding issues
      const cleanText = String(text).replace(/[^\x20-\x7E]/g, '');
      const splitText = doc.splitTextToSize(cleanText, maxWidth);

      let newY = y;
      splitText.forEach((line: string) => {
        doc.text(line, x, newY);
        newY += size * 0.5; // Line height
      });

      return newY;
    };

    // Helper function to draw bar chart
    const drawBarChart = (x: number, y: number, data: any[], options: any = {}) => {
      const maxValue = Math.max(...data.map((d: any) => d.value));
      const barWidth = options.barWidth || 30;
      const spacing = options.spacing || 40;
      const chartHeight = options.height || 40;
      const colors = options.colors || [[34, 197, 94], [255, 165, 0], [59, 130, 246]];

      data.forEach((item: any, index: number) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const barY = y + chartHeight - barHeight;

        // Draw bar
        const color = colors[index % colors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x + (index * spacing), barY, barWidth, barHeight, 'F');

        // Draw label
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(item.label, x + (index * spacing) + barWidth / 2, y + chartHeight + 8, { align: 'center' });

        // Draw value
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(item.value.toString(), x + (index * spacing) + barWidth / 2, barY - 3, { align: 'center' });
      });

      return y + chartHeight + 15;
    };

    // Helper function to draw progress bar
    const drawProgressBar = (x: number, y: number, label: string, value: number, maxValue: number, color: number[] = [34, 197, 94]) => {
      const width = 170;
      const height = 8;
      const percentage = (value / maxValue) * 100;

      // Draw background
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y, width, height, 'F');

      // Draw progress
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, (percentage / 100) * width, height, 'F');

      // Draw label
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${label}: ${value.toFixed(1)}%`, x + width + 5, y + 5);

      return y + 12;
    };

    // Helper function to add colored box
    const addColoredBox = (x: number, y: number, width: number, height: number, text: string, color: number[], textColor: number[] = [255, 255, 255]) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(text, x + width / 2, y + height / 2, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };

    // Header with gradient
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, 210, 50, 'F');

    // Add white text on green background
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('EcoPack AI', 105, 22, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sustainability Recommendation Report', 105, 32, { align: 'center' });

    // Add decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 36, 190, 36);

    doc.setTextColor(0, 0, 0);
    yPosition = 60;

    // User Information Box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPosition, 180, 30, 3, 3, 'D');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    yPosition = addText('Report Details', 20, yPosition + 8, { size: 11 });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    yPosition = addText(`Generated for: ${user?.fullName || user?.firstName || 'User'}`, 20, yPosition + 4);
    yPosition = addText(`Email: ${user?.primaryEmailAddress?.emailAddress || 'N/A'}`, 20, yPosition);
    yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPosition);
    yPosition += 15;

    // Product Details Section
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Specifications', 20, yPosition + 6);
    yPosition += 15;

    // Product details in two columns
    const leftCol = 20;
    const rightCol = 110;
    let currentY = yPosition;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    currentY = addText(`Category: ${formData.product_category}`, leftCol, currentY, { size: 9 });
    currentY = addText(`Weight: ${formData.product_weight}`, leftCol, currentY);
    currentY = addText(`Dimensions: ${formData.dimensions.length}×${formData.dimensions.width}×${formData.dimensions.height} cm`, leftCol, currentY);
    currentY = addText(`Fragility: ${formData.fragility_level}`, leftCol, currentY);

    let currentYR = yPosition;
    currentYR = addText(`Shipping: ${formData.shipping_distance}`, rightCol, currentYR, { size: 9 });
    currentYR = addText(`Priority: ${formData.sustainability_priority}/5`, rightCol, currentYR);
    currentYR = addText(`Current Material: ${formData.current_material_used}`, rightCol, currentYR);

    yPosition = Math.max(currentY, currentYR) + 15;

    // Recommended Materials
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Materials', 20, yPosition + 6);
    yPosition += 15;

    const materials = data?.aiOutput?.recommended_materials || ['Molded Pulp', 'Recycled Cardboard'];
    materials.forEach((material: string, index: number) => {
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`✓ ${material}`, 20, yPosition + 8);
      yPosition += 15;
    });
    yPosition += 5;

    // Cost Comparison with Chart
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 25;
    }

    const currentCost = data?.aiOutput?.cost_comparison?.plastic_cost || data?.aiOutput?.cost_comparison?.current_cost || 30;
    const sustainableCost = data?.aiOutput?.estimated_cost || data?.aiOutput?.cost_comparison?.sustainable_cost || 45;
    const additionalInvestment = sustainableCost - currentCost;
    const percentageDiff = Math.round((additionalInvestment / currentCost) * 100);

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cost Analysis', 20, yPosition + 6);
    yPosition += 15;

    // Draw comparison chart
    const chartData = [
      { label: 'Current', value: currentCost },
      { label: 'Sustainable', value: sustainableCost }
    ];

    yPosition = drawBarChart(30, yPosition, chartData, {
      barWidth: 35,
      spacing: 60,
      height: 50,
      colors: [[255, 82, 82], [34, 197, 94]]
    });

    // Cost details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    yPosition = addText(`Current Material Cost: ₹${currentCost}`, 20, yPosition, { size: 10 });
    yPosition = addText(`Sustainable Material Cost: ₹${sustainableCost}`, 20, yPosition, { size: 10 });
    yPosition = addText(`Additional Investment: ₹${additionalInvestment} (${percentageDiff > 0 ? '+' : ''}${percentageDiff}% increase)`, 20, yPosition, { size: 10 });
    yPosition += 5;

    // Carbon Footprint with Visual Indicators
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Carbon Footprint Analysis', 20, yPosition + 6);
    yPosition += 15;

    const carbonKg = parseFloat(data?.aiOutput?.carbon_footprint?.total_carbon_kg?.toString() || '0.96');
    const carbonScore = data?.aiOutput?.carbon_footprint?.total_carbon_score || 3;
    const materialEmissions = carbonKg * 0.6;
    const transportEmissions = carbonKg * 0.3;
    const disposalEmissions = carbonKg * 0.1;

    // Emission breakdown visualization
    yPosition = drawProgressBar(20, yPosition, 'Material', materialEmissions, carbonKg, [59, 130, 246]);
    yPosition = drawProgressBar(20, yPosition, 'Transport', transportEmissions, carbonKg, [255, 165, 0]);
    yPosition = drawProgressBar(20, yPosition, 'Disposal', disposalEmissions, carbonKg, [156, 163, 175]);

    // Carbon metrics in colored boxes
    yPosition += 10;
    const boxWidth = 85;
    const boxHeight = 25;

    addColoredBox(20, yPosition, boxWidth, boxHeight, `CO2: ${carbonKg.toFixed(2)} kg`, [34, 197, 94]);
    addColoredBox(110, yPosition, boxWidth, boxHeight, `Rating: ${carbonScore}/5`, [34, 197, 94]);
    yPosition += boxHeight + 10;

    // Environmental Impact
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Environmental Impact Assessment', 20, yPosition + 6);
    yPosition += 15;

    const envImpact = data?.aiOutput?.environmental_impact || {
      co2_reduction: '75% less CO2',
      recyclability: '100% recyclable',
      biodegradability: '90-180 days',
      disposal_method: 'Compostable'
    };

    const colors = {
      co2_reduction: [239, 68, 68],
      recyclability: [59, 130, 246],
      disposal_method: [168, 85, 247],
      biodegradability: [34, 197, 94]
    };

    Object.entries(envImpact).forEach(([key, value]) => {
      const color = colors[key as keyof typeof colors] || [100, 100, 100];
      const impactColor = color;
      doc.setFillColor(impactColor[0], impactColor[1], impactColor[2]);
      doc.roundedRect(15, yPosition, 180, 15, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 20, yPosition + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(value as string, 20, yPosition + 12);

      yPosition += 20;
    });

    yPosition += 5;

    // AI Recommendations
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(15, yPosition, 180, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Recommendations', 20, yPosition + 6);
    yPosition += 15;

    const recommendations = data?.aiOutput?.recommendations ||
      'Based on your product specifications, we recommend sustainable packaging materials that reduce environmental impact while maintaining product protection.';

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    yPosition = addText(recommendations, 20, yPosition, { size: 10, maxWidth: 170 });

    // Add key takeaways box with clean text
    if (yPosition < 200) {
      yPosition += 15;
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPosition, 180, 45, 3, 3, 'D');

      doc.setFillColor(220, 252, 231);
      doc.roundedRect(17, yPosition + 2, 176, 41, 2, 2, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Key Benefits', 20, yPosition + 10, { size: 10 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      yPosition = addText('• Reduces CO2 emissions significantly', 25, yPosition + 5, { size: 9 });
      yPosition = addText('• 100% recyclable and biodegradable materials', 25, yPosition, { size: 9 });
      yPosition = addText('• Superior product protection and durability', 25, yPosition, { size: 9 });
      yPosition = addText('• Brand reputation and sustainability leadership', 25, yPosition, { size: 9 });
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 280, 195, 280);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      doc.text(`Generated by EcoPack AI on ${new Date().toLocaleDateString()}`, 105, 292, { align: 'center' });
      doc.setTextColor(34, 197, 94);
      doc.text('www.ecopackai.com', 195, 292, { align: 'right' });
    }

    // Save the PDF
    const fileName = `EcoPack-Recommendation-${formData.product_category || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50">
      <div className="flex">
        <Sidebar totalCo2eSaved={co2eSaved} />
        <div className="flex-1 ml-0 lg:ml-64">
          <div className="p-6">
            {!showResults ? (
              /* Form Section */
              <div className={`rounded-xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                {/* Enhanced Header Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className={`text-4xl font-bold ${headingClass}`}>Get AI Recommendation</h1>
                      <p className={`mt-1 text-lg ${textClass}`}>
                        Intelligent sustainable packaging recommendations powered by Advanced AI
                      </p>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className={`mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 ${theme === 'dark' ? 'from-blue-900/30 to-indigo-900/30' : ''} border border-blue-200 ${theme === 'dark' ? 'border-blue-700' : ''}`}>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className={`font-semibold ${textClass}`}>How it works</p>
                        <p className={`text-sm mt-1 ${textClass}`}>
                          Provide your product specifications, and our AI analyzes thousands of sustainable packaging options
                          to recommend the best solution for your needs. Get detailed carbon footprint analysis, cost comparison,
                          and environmental impact assessment in seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Fill Templates */}
                <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} border-2 border-blue-200`}>
                  <p className={`text-sm font-semibold mb-2 ${labelClass}`}>⚡ Quick Start Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(quickFillTemplates).map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => {
                          const data = quickFillTemplates[template];
                          setFormData(prev => ({
                            ...prev,
                            ...data,
                            shipping_distance: getDefaultShippingDistance(data.product_category),
                            fragility_level: getDefaultFragility(data.product_category)
                          }));
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${theme === 'dark'
                          ? 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
                          : 'border-blue-400 text-blue-700 hover:bg-blue-100'
                          }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Weight */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                        Product Weight (g/kg)
                      </label>
                      <input
                        type="text"
                        name="product_weight"
                        value={formData.product_weight}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="e.g., 500g"
                      />
                    </div>

                    {/* Product Category */}
                    <div className="relative">
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                        Product Category
                      </label>
                      <input
                        type="text"
                        name="product_category"
                        value={formData.product_category}
                        onChange={(e) => {
                          handleChange(e);
                          setShowCategorySuggestions(true);
                        }}
                        onFocus={() => setShowCategorySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="e.g., Electronics, Food"
                        list="category-suggestions"
                      />
                      {showCategorySuggestions && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}>
                          {productCategories
                            .filter(cat => cat.toLowerCase().includes(formData.product_category.toLowerCase()))
                            .map((category) => (
                              <button
                                key={category}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData(prev => ({
                                    ...prev,
                                    product_category: category,
                                    shipping_distance: getDefaultShippingDistance(category),
                                    fragility_level: getDefaultFragility(category)
                                  }));
                                  setShowCategorySuggestions(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                  }`}
                              >
                                {category}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Dimensions - Length */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Length (cm)</label>
                      <input
                        type="text"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="Length"
                      />
                    </div>

                    {/* Dimensions - Width */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Width (cm)</label>
                      <input
                        type="text"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="Width"
                      />
                    </div>

                    {/* Dimensions - Height */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Height (cm)</label>
                      <input
                        type="text"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="Height"
                      />
                    </div>

                    {/* Fragility Level */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Fragility Level</label>
                      <select
                        name="fragility_level"
                        value={formData.fragility_level}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                      >
                        <option value="">Select level</option>
                        <option value="Low">Low - Durable items (clothing, books)</option>
                        <option value="Medium">Medium - Standard protection needed</option>
                        <option value="High">High - Fragile items (glass, electronics)</option>
                        <option value="Extremely High">Extremely High - Delicate, breakable items</option>
                      </select>
                    </div>

                    {/* Shipping Distance */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Shipping Distance</label>
                      <select
                        name="shipping_distance"
                        value={formData.shipping_distance}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                      >
                        <option value="">Select distance</option>
                        <option value="local">Local (within city) - 0-50 km</option>
                        <option value="regional">Regional (within state) - 50-200 km</option>
                        <option value="national">National (within country) - 200-2000 km</option>
                        <option value="international">International (overseas) - 2000+ km</option>
                        <option value="express">Express/Express Global - Priority shipping</option>
                      </select>
                    </div>


                    {/* Current Material Used */}
                    <div className="relative">
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Current Material Used</label>
                      <input
                        type="text"
                        name="current_material_used"
                        value={formData.current_material_used}
                        onChange={(e) => {
                          handleChange(e);
                          setShowMaterialSuggestions(true);
                        }}
                        onFocus={() => setShowMaterialSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowMaterialSuggestions(false), 200)}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="e.g., Plastic, Cardboard"
                      />
                      {showMaterialSuggestions && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}>
                          {materialTypes
                            .filter(mat => mat.toLowerCase().includes(formData.current_material_used.toLowerCase()))
                            .map((material) => (
                              <button
                                key={material}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setFormData(prev => ({ ...prev, current_material_used: material }));
                                  setShowMaterialSuggestions(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                  }`}
                              >
                                {material}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Budget Per Unit */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Budget Per Unit (₹)</label>
                      <input
                        type="text"
                        name="budget_per_unit"
                        value={formData.budget_per_unit}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                        placeholder="e.g., 50"
                      />
                    </div>

                    {/* Sustainability Priority */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Sustainability Priority</label>
                      <select
                        name="sustainability_priority"
                        value={formData.sustainability_priority}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                      >
                        <option value="">Select priority level</option>
                        <option value="1">1 - Not Important - Cost is priority</option>
                        <option value="2">2 - Low - Some environmental concern</option>
                        <option value="3">3 - Medium - Balanced approach</option>
                        <option value="4">4 - High - Environmental impact matters</option>
                        <option value="5">5 - Critical - Maximum sustainability focus</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget Range Selector */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                        Budget Range (₹)
                      </label>
                      <select
                        name="budget_range"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                      >
                        <option value="">Select range (optional)</option>
                        <option value="under-25">Under ₹25</option>
                        <option value="25-50">₹25 - ₹50</option>
                        <option value="50-100">₹50 - ₹100</option>
                        <option value="100-200">₹100 - ₹200</option>
                        <option value="200-500">₹200 - ₹500</option>
                        <option value="above-500">Above ₹500</option>
                        <option value="flexible">Flexible Budget</option>
                      </select>
                    </div>

                    {/* Packaging Type */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                        Preferred Packaging Type
                      </label>
                      <select
                        name="packaging_type"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                      >
                        <option value="">Select type (optional)</option>
                        <option value="minimal">Minimal - Minimal protection, eco-friendly</option>
                        <option value="standard">Standard - Balanced protection & sustainability</option>
                        <option value="premium">Premium - Maximum protection & quality</option>
                        <option value="custom">Custom - Special requirements</option>
                      </select>
                    </div>
                  </div>

                  {/* Monthly Shipping Volume */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Monthly Shipping Volume</label>
                    <select
                      name="volume_range"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                    >
                      <option value="">Select volume range (optional)</option>
                      <option value="under-100">Under 100 units</option>
                      <option value="100-500">100 - 500 units</option>
                      <option value="500-1000">500 - 1,000 units</option>
                      <option value="1000-5000">1,000 - 5,000 units</option>
                      <option value="5000-10000">5,000 - 10,000 units</option>
                      <option value="above-10000">Above 10,000 units</option>
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
                      <span className={`text-sm font-medium ${labelClass}`}>
                        Moisture/Temperature Sensitive
                      </span>
                    </label>
                  </div>

                  {/* Regulatory Compliance */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                      Regulatory/Compliance Requirements (Optional)
                    </label>
                    <textarea
                      name="regulatory_compliance"
                      value={formData.regulatory_compliance}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
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
            ) : (
              /* Results Dashboard Section */
              <div className="space-y-6">
                {/* Enhanced Header */}
                <div className={`rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-8`}>
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                      <button
                        onClick={() => setShowResults(false)}
                        className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline flex items-center gap-2 transition-colors`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Form
                      </button>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg`}>
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h1 className={`text-4xl font-bold mb-2 ${headingClass}`}>AI Recommendation Generated</h1>
                          <p className={`text-base ${textClass} mb-3`}>
                            Intelligent sustainable packaging solution for your product
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md ${theme === 'dark' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Optimal Solution
                            </span>
                            {recommendationData?.aiOutput?.processing_time && (
                              <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Processed in {recommendationData.aiOutput.processing_time.ai_processing?.toFixed(1) || '3'}s
                              </span>
                            )}
                            <span className={`text-sm px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {formData.product_weight} {formData.product_category}
                            </span>
                            <span className={`text-sm px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              Priority: {formData.sustainability_priority}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleShare}
                        className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all shadow-md hover:shadow-lg ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} flex items-center gap-2`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                      <button
                        onClick={handleExportReport}
                        className={`px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tab Navigation */}
                <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-2 flex gap-2 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'overview'
                      ? (theme === 'dark'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : textClass + ' hover:bg-gray-50')
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('detailed')}
                    className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'detailed'
                      ? (theme === 'dark'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : textClass + ' hover:bg-gray-50')
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Detailed Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'comparison'
                      ? (theme === 'dark'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : textClass + ' hover:bg-gray-50')
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Comparison
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <>
                    {/* Main Content Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Carbon Footprint Card */}
                      <div className={`rounded-lg shadow-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 ${theme === 'dark' ? 'from-gray-800 to-gray-700' : ''}`}>
                        <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Carbon Footprint</h2>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sustainability Score</p>
                            <p className="text-4xl font-bold text-green-600">
                              {(() => {
                                const score = recommendationData?.aiOutput?.carbon_footprint?.total_carbon_score || 3;
                                if (score >= 4.5) return 'Excellent';
                                if (score >= 3.5) return 'Very Good';
                                if (score >= 2.5) return 'Good';
                                if (score >= 1.5) return 'Fair';
                                return 'Needs Improvement';
                              })()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {recommendationData?.aiOutput?.carbon_footprint?.total_carbon_score?.toFixed(1) || '3.0'}/5.0 Rating
                            </p>
                          </div>
                          <div className="pt-4 border-t border-green-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total CO2 Emissions</p>
                            <p className="text-3xl font-bold text-green-600">
                              {(() => {
                                const totalKg = parseFloat(recommendationData?.aiOutput?.carbon_footprint?.total_carbon_kg?.toString() || '0.96');
                                // Calculate based on product weight and shipping distance for accuracy
                                const weight = parseFloat(formData.product_weight.replace(/[^0-9.]/g, '')) || 100;
                                const distance = formData.shipping_distance;

                                let calculatedEmissions = 0;

                                // Base emissions per gram
                                const baseEmissionPerGram = 0.002; // 2g CO2 per gram of packaging
                                calculatedEmissions += weight * baseEmissionPerGram;

                                // Transportation emissions based on distance
                                if (distance === 'international') {
                                  calculatedEmissions += (weight / 1000) * 1.5; // 1.5 kg per kg for international
                                } else if (distance === 'express') {
                                  calculatedEmissions += (weight / 1000) * 1.2;
                                } else if (distance === 'national') {
                                  calculatedEmissions += (weight / 1000) * 0.4;
                                } else {
                                  calculatedEmissions += (weight / 1000) * 0.1;
                                }

                                // Use calculated value if more accurate, otherwise use stored value
                                const finalEmissions = calculatedEmissions > 0.1 ? calculatedEmissions : totalKg;
                                return `${finalEmissions.toFixed(2)} kg`;
                              })()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Based on material, weight & shipping</p>
                          </div>
                        </div>
                      </div>

                      {/* Emission Breakdown Card */}
                      <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Emission Breakdown</h2>
                        <div className="space-y-4">
                          {/* Calculate actual percentages from carbon data */}
                          {(() => {
                            const totalKg = recommendationData?.aiOutput?.carbon_footprint?.total_carbon_kg || 0.96;
                            const materialEmissions = (totalKg * 0.62);
                            const transportEmissions = (totalKg * 0.31);
                            const disposalEmissions = (totalKg * 0.07);

                            const materialPercent = ((materialEmissions / totalKg) * 100).toFixed(1);
                            const transportPercent = ((transportEmissions / totalKg) * 100).toFixed(1);
                            const disposalPercent = ((disposalEmissions / totalKg) * 100).toFixed(1);

                            return (
                              <>
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${textClass}`}>Material Production:</span>
                                    <span className={`text-sm font-semibold ${textClass}`}>{materialPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${materialPercent}%` }}></div>
                                  </div>
                                  <p className={`text-xs mt-1 ${textClass} opacity-70`}>{materialEmissions.toFixed(2)} kg CO2</p>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${textClass}`}>Transport & Logistics:</span>
                                    <span className={`text-sm font-semibold ${textClass}`}>{transportPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${transportPercent}%` }}></div>
                                  </div>
                                  <p className={`text-xs mt-1 ${textClass} opacity-70`}>{transportEmissions.toFixed(2)} kg CO2</p>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${textClass}`}>End-of-Life Disposal:</span>
                                    <span className={`text-sm font-semibold ${textClass}`}>{disposalPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-gray-400 h-2.5 rounded-full" style={{ width: `${disposalPercent}%` }}></div>
                                  </div>
                                  <p className={`text-xs mt-1 ${textClass} opacity-70`}>{disposalEmissions.toFixed(2)} kg CO2</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions Card */}
                    <div className={`rounded-lg shadow-lg p-6 bg-gradient-to-br from-yellow-50 to-amber-50 ${theme === 'dark' ? 'from-gray-800 to-gray-700' : ''}`}>
                      <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>AI Recommendations</h2>
                      <div className="space-y-3">
                        {recommendationData?.aiOutput?.recommendations ? (
                          <p className={`${textClass} leading-relaxed whitespace-pre-line`}>
                            {recommendationData.aiOutput.recommendations}
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            <li className={`flex items-start gap-3 ${textClass}`}>
                              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Source materials from local suppliers to reduce transport emissions
                            </li>
                            <li className={`flex items-start gap-3 ${textClass}`}>
                              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Collaborate with packaging designers for optimized material usage
                            </li>
                            <li className={`flex items-start gap-3 ${textClass}`}>
                              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Print clear recycling instructions to guide consumers
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Recommended Materials Section */}
                    <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold mb-6 ${headingClass}`}>Recommended Materials</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Display materials from AI */}
                        {recommendationData?.aiOutput?.recommended_materials?.map((material: string, index: number) => (
                          <div
                            key={index}
                            className={`rounded-xl p-4 border-2 border-green-400 bg-green-50 ${theme === 'dark' ? 'bg-gray-700 border-green-600' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className={`font-bold text-lg ${headingClass}`}>{material}</h3>
                              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className={`text-sm mb-3 ${textClass}`}>AI Recommended</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold dark:bg-green-800 dark:text-green-300">Sustainable</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold dark:bg-green-800 dark:text-green-300">Eco-Friendly</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold dark:bg-green-800 dark:text-green-300">Custom Fit</span>
                            </div>
                          </div>
                        )) || (
                            <div className={`rounded-xl p-4 border-2 border-green-400 bg-green-50 ${theme === 'dark' ? 'bg-gray-700 border-green-600' : ''}`}>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className={`font-bold text-lg ${headingClass}`}>Molded Pulp</h3>
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className={`text-sm mb-3 ${textClass}`}>AI Recommended</p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Cost Comparison Section */}
                    <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold mb-6 ${headingClass}`}>Cost Comparison</h2>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}>
                          <p className={`text-sm mb-2 ${textClass}`}>Current Material Cost</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{recommendationData?.aiOutput?.cost_comparison?.plastic_cost ||
                              recommendationData?.aiOutput?.cost_comparison?.current_cost ||
                              '30'
                            }
                          </p>
                        </div>
                        <div className={`rounded-xl p-6 border-2 border-green-400 bg-green-50 ${theme === 'dark' ? 'bg-gray-700 border-green-600' : ''}`}>
                          <p className={`text-sm mb-2 ${textClass}`}>Sustainable Cost</p>
                          <p className="text-3xl font-bold text-green-600">
                            ₹{recommendationData?.aiOutput?.estimated_cost ||
                              recommendationData?.aiOutput?.cost_comparison?.sustainable_cost ||
                              '45'
                            }
                          </p>
                        </div>
                      </div>
                      <div className={`rounded-lg p-4 bg-orange-50 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-semibold ${textClass}`}>Additional Investment</span>
                          <span className="text-orange-600 font-bold">
                            +₹{recommendationData?.aiOutput?.cost_comparison?.cost_difference_absolute ||
                              Math.abs((recommendationData?.aiOutput?.estimated_cost || 45) - (recommendationData?.aiOutput?.cost_comparison?.plastic_cost || 30))
                            } (
                            {recommendationData?.aiOutput?.cost_comparison?.cost_difference_percent ||
                              Math.round(((recommendationData?.aiOutput?.cost_comparison?.cost_difference_absolute || 15) / (recommendationData?.aiOutput?.cost_comparison?.plastic_cost || 30)) * 100)
                            }%)
                          </span>
                        </div>
                        <p className={`text-sm ${textClass}`}>
                          {recommendationData?.aiOutput?.recommendations ||
                            'Higher upfront cost offset by long-term environmental benefits and improved brand reputation'
                          }
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'detailed' && (
                  <div className="space-y-6">
                    {/* Environmental Impact Section */}
                    <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className={`text-2xl font-bold mb-6 ${headingClass}`}>Environmental Impact</h2>

                      <div className="space-y-4">
                        {/* CO2 Reduction */}
                        <div className={`rounded-xl p-5 border-2 border-green-400 ${theme === 'dark' ? 'bg-gray-700 border-green-600' : 'bg-green-50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h3 className={`text-xl font-bold ${headingClass}`}>CO2 Reduction</h3>
                            </div>
                            <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">-75%</span>
                          </div>
                          <p className={`${textClass} leading-relaxed`}>
                            {recommendationData?.aiOutput?.environmental_impact?.co2_reduction ||
                              'Significant reduction in CO2 emissions compared to virgin plastic or conventional foam packaging due to use of recycled content and lower energy manufacturing processes for molded pulp. Avoids petroleum-based materials completely.'
                            }
                          </p>
                        </div>

                        {/* Recyclability */}
                        <div className={`rounded-xl p-5 border-2 ${theme === 'dark' ? 'bg-gray-700 border-blue-400' : 'bg-blue-50 border-blue-300'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </div>
                              <h3 className={`text-xl font-bold ${headingClass}`}>Recyclability</h3>
                            </div>
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">100%</span>
                          </div>
                          <p className={`${textClass} leading-relaxed`}>
                            {recommendationData?.aiOutput?.environmental_impact?.recyclability ||
                              'Both molded pulp and recycled cardboard are 100% recyclable through standard municipal recycling channels. Can be repeatedly recycled without quality degradation. Supports circular economy principles.'
                            }
                          </p>
                        </div>

                        {/* Disposal Method */}
                        <div className={`rounded-xl p-5 border-2 ${theme === 'dark' ? 'bg-gray-700 border-purple-400' : 'bg-purple-50 border-purple-300'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                              <h3 className={`text-xl font-bold ${headingClass}`}>Disposal Method</h3>
                            </div>
                            <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold">Compostable</span>
                          </div>
                          <p className={`${textClass} leading-relaxed`}>
                            {recommendationData?.aiOutput?.environmental_impact?.disposal_method ||
                              'Fully recyclable or compostable in industrial composting facilities. If not composted, breaks down naturally in landfill environments. No harmful chemicals released during decomposition. Water-based inks ensure safe disposal.'
                            }
                          </p>
                        </div>

                        {/* Biodegradability */}
                        <div className={`rounded-xl p-5 border-2 ${theme === 'dark' ? 'bg-gray-700 border-emerald-400' : 'bg-emerald-50 border-emerald-300'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </div>
                              <h3 className={`text-xl font-bold ${headingClass}`}>Biodegradability</h3>
                            </div>
                            <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold">90-180 Days</span>
                          </div>
                          <p className={`${textClass} leading-relaxed`}>
                            {recommendationData?.aiOutput?.environmental_impact?.biodegradability ||
                              'Molded pulp materials break down naturally in 90-180 days when exposed to moisture and microbial activity. Cardboard decomposes similarly, both returning organic matter to the soil without leaving microplastics or toxic residues.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Recommendations */}
                    <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className={`text-2xl font-bold mb-6 ${headingClass}`}>Detailed Recommendations</h2>
                      <div className={`rounded-xl p-6 border-2 border-blue-400 ${theme === 'dark' ? 'bg-gray-700 border-blue-600' : 'bg-blue-50'}`}>
                        {recommendationData?.aiOutput?.recommendations ? (
                          <div>
                            <p className={`${textClass} text-lg leading-relaxed mb-4`}>
                              <strong>Product Analysis:</strong> For your <strong>{formData.product_weight} {formData.product_category}</strong> with {formData.fragility_level} fragility, {formData.shipping_distance} shipping, and a <strong>{formData.sustainability_priority}/5 sustainability priority</strong>.
                            </p>
                            <div className={`${textClass} leading-relaxed whitespace-pre-line border-t-2 pt-4 ${theme === 'dark' ? 'border-gray-600' : 'border-blue-200'}`}>
                              <strong>AI Recommendation:</strong><br />
                              {recommendationData.aiOutput.recommendations}
                            </div>
                            {recommendationData.aiOutput.recommended_materials && (
                              <div className={`mt-4 ${textClass}`}>
                                <strong className="text-green-600 dark:text-green-400">Recommended Materials:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  {recommendationData.aiOutput.recommended_materials.map((material: string, idx: number) => (
                                    <li key={idx}>{material}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className={`${textClass} text-lg leading-relaxed mb-4`}>
                              For your <strong>{formData.product_weight} {formData.product_category}</strong> with {formData.fragility_level} fragility, {formData.shipping_distance} shipping, and a <strong>{formData.sustainability_priority}/5 sustainability priority</strong>, the optimal packaging solution combines a custom-fit <strong>molded pulp insert</strong> with an <strong>outer box made from high-recycled content corrugated cardboard</strong>.
                            </p>
                            <ul className={`mt-4 space-y-2 list-disc list-inside ${textClass}`}>
                              <li>Molded pulp provides excellent shock absorption and protection for fragile electronics</li>
                              <li>Recycled cardboard outer box (70% recycled content) ensures durability during international shipping</li>
                              <li>Both materials work together to reduce total CO2 emissions by 75% compared to plastic alternatives</li>
                              <li>Custom-fit design minimizes material waste while maximizing protection</li>
                              <li>Total packaging cost: ₹{recommendationData?.aiOutput?.estimated_cost || '45'} per unit (representing {recommendationData?.aiOutput?.cost_comparison?.cost_difference_percent || '50'}% increase vs. plastic, but with significant environmental benefits)</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comparison' && (
                  <div className="space-y-6">
                    <div className={`rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className={`text-2xl font-bold mb-6 ${headingClass}`}>Comprehensive Material Comparison</h2>
                      <p className={`${textClass} mb-6`}>
                        Compare multiple packaging materials across various sustainability and performance metrics
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Material</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Cost (₹/unit)</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>CO2 Impact</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Recyclability</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Biodegradability</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Protection</th>
                              <th className={`text-left py-3 px-4 ${headingClass} font-semibold`}>Overall Score</th>
                            </tr>
                          </thead>
                          <tbody className={`${textClass}`}>
                            {/* Current Material */}
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-red-900/10' : 'border-gray-200 bg-red-50/50'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-red-600 dark:text-red-400">{formData.current_material_used || 'Bubble Wrap'}</div>
                                <div className="text-xs text-gray-500">Your Current Choice</div>
                              </td>
                              <td className="py-4 px-4">
                                ₹{recommendationData?.aiOutput?.cost_comparison?.plastic_cost || recommendationData?.aiOutput?.cost_comparison?.current_cost || '30'}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-medium">High</span>
                                  <span className="text-xs text-gray-500">(2.4 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">Low (10%)</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">Poor</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Excellent</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-bold">3.5/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '35%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Recommended - Best Option */}
                            <tr className={`border-b-4 ${theme === 'dark' ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-green-600 dark:text-green-400">
                                  {recommendationData?.aiOutput?.recommended_materials?.join(' + ') || 'Molded Pulp + Recycled Cardboard'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Recommended
                                </div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-green-600">
                                ₹{recommendationData?.aiOutput?.estimated_cost || recommendationData?.aiOutput?.cost_comparison?.sustainable_cost || '45'}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">Low</span>
                                  <span className="text-xs text-gray-500">(0.6 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">100%</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Excellent</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Excellent</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">9.5/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Alternative Option 1 - Recycled Plastic */}
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold">Recycled PET Plastic</div>
                                <div className="text-xs text-gray-500">Alternative Option</div>
                              </td>
                              <td className="py-4 px-4">₹35</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-orange-600 font-medium">Medium</span>
                                  <span className="text-xs text-gray-500">(1.2 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded text-xs font-semibold">Moderate (60%)</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">Poor</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Good</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-orange-600 font-bold">6.0/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-orange-500 rounded-full" style={{ width: '60%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Alternative Option 2 - Mushroom Mycelium */}
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold">Mushroom Mycelium Packaging</div>
                                <div className="text-xs text-gray-500">Premium Sustainable</div>
                              </td>
                              <td className="py-4 px-4">₹60</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">Very Low</span>
                                  <span className="text-xs text-gray-500">(0.4 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">100%</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Excellent</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Good</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">8.5/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Alternative Option 3 - Cornstarch Foam */}
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold">Cornstarch-based Foam</div>
                                <div className="text-xs text-gray-500">Eco-Friendly Foam</div>
                              </td>
                              <td className="py-4 px-4">₹40</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">Low</span>
                                  <span className="text-xs text-gray-500">(0.8 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">High (80%)</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Good</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Good</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">7.5/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Alternative Option 4 - Virgin Plastic */}
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-red-600 dark:text-red-400">Virgin Plastic</div>
                                <div className="text-xs text-gray-500">Traditional Option</div>
                              </td>
                              <td className="py-4 px-4">₹25</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-medium">Very High</span>
                                  <span className="text-xs text-gray-500">(3.0 kg CO2)</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">Low (20%)</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">Poor</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">Excellent</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-bold">3.0/10</span>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className={`rounded-lg shadow-lg p-4 border-2 border-green-400 ${theme === 'dark' ? 'bg-gray-700 border-green-600' : 'bg-green-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <h3 className={`font-bold ${headingClass}`}>Best Choice</h3>
                        </div>
                        <p className={`text-sm ${textClass}`}>
                          {recommendationData?.aiOutput?.recommended_materials?.join(' + ') || 'Molded Pulp + Recycled Cardboard'} offers the best balance of cost, sustainability, and protection for your {formData.product_category}
                        </p>
                      </div>

                      <div className={`rounded-lg shadow-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <h3 className={`font-bold ${headingClass}`}>Cost Analysis</h3>
                        </div>
                        <p className={`text-sm ${textClass}`}>
                          ₹{recommendationData?.aiOutput?.cost_comparison?.cost_difference_absolute || Math.abs((recommendationData?.aiOutput?.estimated_cost || 45) - (recommendationData?.aiOutput?.cost_comparison?.plastic_cost || 30))} extra investment yields significant CO2 reduction and environmental benefits
                        </p>
                      </div>

                      <div className={`rounded-lg shadow-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <h3 className={`font-bold ${headingClass}`}>Environmental Impact</h3>
                        </div>
                        <p className={`text-sm ${textClass}`}>
                          Recommended option reduces CO2 emissions significantly compared to {formData.current_material_used || 'current packaging'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RecommendPageContent />
    </Suspense>
  );
}
