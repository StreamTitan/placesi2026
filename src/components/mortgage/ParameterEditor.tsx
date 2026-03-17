import { useState, useEffect } from 'react';
import { Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { MortgageCalculationParameters } from '../../services/mortgageParameters';
import {
  getActiveParameters,
  getSystemDefaultParameters,
  updateInstitutionParameters,
  resetToDefaults,
} from '../../services/mortgageParameters';

interface ParameterEditorProps {
  institutionId: string;
  onParametersUpdated?: () => void;
}

export function ParameterEditor({ institutionId, onParametersUpdated }: ParameterEditorProps) {
  const [params, setParams] = useState<Partial<MortgageCalculationParameters>>({});
  const [defaults, setDefaults] = useState<MortgageCalculationParameters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadParameters();
  }, [institutionId]);

  const loadParameters = async () => {
    setLoading(true);
    try {
      const [currentParams, defaultParams] = await Promise.all([
        getActiveParameters(institutionId),
        getSystemDefaultParameters(),
      ]);

      setParams(currentParams || defaultParams || {});
      setDefaults(defaultParams);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading parameters:', error);
      setMessage({ type: 'error', text: 'Failed to load parameters' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await updateInstitutionParameters(institutionId, params);
      if (result.success) {
        setMessage({ type: 'success', text: 'Parameters saved successfully!' });
        setHasChanges(false);
        onParametersUpdated?.();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save parameters' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save parameters' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all parameters to system defaults? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const result = await resetToDefaults(institutionId);
      if (result.success) {
        await loadParameters();
        setMessage({ type: 'success', text: 'Parameters reset to defaults!' });
        onParametersUpdated?.();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset parameters' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset parameters' });
    } finally {
      setSaving(false);
    }
  };

  const updateParam = (key: keyof MortgageCalculationParameters, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading parameters...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calculation Parameters</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize mortgage calculation thresholds and scoring weights
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 bg-[#158EC5] hover:bg-[#1178a3]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GDS Ratio Thresholds (%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excellent (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.gds_excellent_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.gds_excellent_threshold || ''}
              onChange={(e) => updateParam('gds_excellent_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Good (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.gds_good_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.gds_good_threshold || ''}
              onChange={(e) => updateParam('gds_good_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fair (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.gds_fair_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.gds_fair_threshold || ''}
              onChange={(e) => updateParam('gds_fair_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">TDS Ratio Thresholds (%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excellent (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.tds_excellent_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.tds_excellent_threshold || ''}
              onChange={(e) => updateParam('tds_excellent_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Good (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.tds_good_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.tds_good_threshold || ''}
              onChange={(e) => updateParam('tds_good_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fair (≤)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.tds_fair_threshold}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.tds_fair_threshold || ''}
              onChange={(e) => updateParam('tds_fair_threshold', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interest Rates by Financing Tier (%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ≤80% Financing
              {defaults && <span className="text-xs text-gray-500 block">(Default: {defaults.interest_rate_lte_80}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.interest_rate_lte_80 || ''}
              onChange={(e) => updateParam('interest_rate_lte_80', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              80-95% Financing
              {defaults && <span className="text-xs text-gray-500 block">(Default: {defaults.interest_rate_80_to_95}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.interest_rate_80_to_95 || ''}
              onChange={(e) => updateParam('interest_rate_80_to_95', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              95-99% Financing
              {defaults && <span className="text-xs text-gray-500 block">(Default: {defaults.interest_rate_95_to_99}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.interest_rate_95_to_99 || ''}
              onChange={(e) => updateParam('interest_rate_95_to_99', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              100% Financing
              {defaults && <span className="text-xs text-gray-500 block">(Default: {defaults.interest_rate_100}%)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={params.interest_rate_100 || ''}
              onChange={(e) => updateParam('interest_rate_100', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Cost Estimates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property Tax Rate (% per year)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: {defaults.property_tax_rate}%)</span>}
            </label>
            <input
              type="number"
              step="0.01"
              value={params.property_tax_rate || ''}
              onChange={(e) => updateParam('property_tax_rate', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Heating Cost ($ per month)
              {defaults && <span className="text-xs text-gray-500 ml-2">(Default: ${defaults.heating_cost_monthly})</span>}
            </label>
            <input
              type="number"
              step="1"
              value={params.heating_cost_monthly || ''}
              onChange={(e) => updateParam('heating_cost_monthly', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5]"
            />
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">Parameter Guidelines</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Lower thresholds make qualification criteria more strict</li>
              <li>Higher interest rates apply to higher-risk financing tiers</li>
              <li>All changes are logged and can be audited</li>
              <li>Parameters affect new applications only, not existing ones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
