import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Info, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface AgentAboutData {
  about: string;
  mission: string;
  languages_spoken: string[];
  certifications: string[];
  awards: string[];
  areas_served: string[];
}

export function AgentAboutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<AgentAboutData>({
    about: '',
    mission: '',
    languages_spoken: [],
    certifications: [],
    awards: [],
    areas_served: [],
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('about, mission, languages_spoken, certifications, awards, areas_served')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          about: data.about || '',
          mission: data.mission || '',
          languages_spoken: data.languages_spoken || [],
          certifications: data.certifications || [],
          awards: data.awards || [],
          areas_served: data.areas_served || [],
        });
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('agent_profiles')
        .update({
          about: formData.about || null,
          mission: formData.mission || null,
          languages_spoken: formData.languages_spoken.length > 0 ? formData.languages_spoken : null,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
          awards: formData.awards.length > 0 ? formData.awards : null,
          areas_served: formData.areas_served.length > 0 ? formData.areas_served : null,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving agent data:', error);
      alert('Failed to save agent information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: keyof Pick<AgentAboutData, 'languages_spoken' | 'certifications' | 'awards' | 'areas_served'>, value: string, setter: (value: string) => void) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      });
      setter('');
    }
  };

  const removeItem = (type: keyof Pick<AgentAboutData, 'languages_spoken' | 'certifications' | 'awards' | 'areas_served'>, index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agent About Information
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-13">
            Share your professional story, expertise, and what makes you unique
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-medium">
              Agent information saved successfully!
            </p>
          </div>
        )}

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About You
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                placeholder="Tell your professional story. What inspired you to become a real estate agent? What do you love about helping clients find their perfect property?"
                maxLength={2000}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formData.about.length} / 2000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                placeholder="What is your mission as a real estate agent? What principles guide your work?"
                maxLength={500}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formData.mission.length} / 500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages Spoken
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g., English, Spanish"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('languages_spoken', newLanguage, setNewLanguage);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('languages_spoken', newLanguage, setNewLanguage)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages_spoken.map((lang, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                  >
                    {lang}
                    <button
                      onClick={() => removeItem('languages_spoken', index)}
                      className="hover:text-green-900 dark:hover:text-green-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certifications
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="e.g., Certified Residential Specialist"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('certifications', newCertification, setNewCertification);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('certifications', newCertification, setNewCertification)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      onClick={() => removeItem('certifications', index)}
                      className="hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Awards & Recognition
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder="e.g., Top Producer 2023"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('awards', newAward, setNewAward);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('awards', newAward, setNewAward)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.awards.map((award, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm"
                  >
                    {award}
                    <button
                      onClick={() => removeItem('awards', index)}
                      className="hover:text-yellow-900 dark:hover:text-yellow-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas Served
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g., Bridgetown, Christ Church"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('areas_served', newArea, setNewArea);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('areas_served', newArea, setNewArea)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.areas_served.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {area}
                    <button
                      onClick={() => removeItem('areas_served', index)}
                      className="hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/agent-panel')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
