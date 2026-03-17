import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, ArrowLeft, Edit2, Trash2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SingleImageUpload } from '../../components/ui/SingleImageUpload';
import {
  getContractorSpecials,
  createContractorSpecial,
  updateContractorSpecial,
  deleteContractorSpecial,
  uploadBannerImage
} from '../../services/contractorManagement';
import type { Database } from '../../lib/database.types';

type ContractorSpecial = Database['public']['Tables']['contractor_specials']['Row'];

export function ContractorSpecialsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [specials, setSpecials] = useState<ContractorSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<ContractorSpecial | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;

    try {
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (contractorData) {
        setContractorId(contractorData.id);
        const specialsData = await getContractorSpecials(contractorData.id);
        setSpecials(specialsData);
      }
    } catch (error) {
      console.error('Error loading specials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSpecial(null);
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setBannerFile(null);
    setCurrentBannerUrl(null);
    setShowModal(true);
  };

  const handleEdit = (special: ContractorSpecial) => {
    setEditingSpecial(special);
    setTitle(special.title);
    setDescription(special.description || '');
    setStartDate(special.start_date);
    setEndDate(special.end_date);
    setBannerFile(null);
    setCurrentBannerUrl(special.banner_image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!contractorId || !title || !startDate || !endDate) return;

    setSaving(true);
    try {
      let bannerUrl = currentBannerUrl;

      if (bannerFile && profile?.id) {
        const uploadedUrl = await uploadBannerImage(profile.id, bannerFile);
        if (uploadedUrl) {
          bannerUrl = uploadedUrl;
        }
      }

      if (editingSpecial) {
        await updateContractorSpecial(editingSpecial.id, {
          title,
          description: description || null,
          start_date: startDate,
          end_date: endDate,
          banner_image_url: bannerUrl || null,
        });
      } else {
        await createContractorSpecial({
          contractor_id: contractorId,
          title,
          description: description || null,
          start_date: startDate,
          end_date: endDate,
          banner_image_url: bannerUrl || null,
        });
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving special:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (specialId: string) => {
    if (!confirm('Are you sure you want to delete this special?')) return;

    try {
      await deleteContractorSpecial(specialId);
      loadData();
    } catch (error) {
      console.error('Error deleting special:', error);
    }
  };

  const getSpecialStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Specials
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your special offers and promotions
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Special
            </Button>
          </div>
        </div>

        {specials.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No specials yet</h3>
              <p>Create your first special offer to attract more clients</p>
            </div>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Special
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {specials.map((special) => {
              const status = getSpecialStatus(special.start_date, special.end_date);
              return (
                <Card key={special.id} className="p-6">
                  <div className="flex gap-6">
                    {special.banner_image_url && (
                      <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={special.banner_image_url}
                          alt={special.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {special.title}
                          </h3>
                          {getStatusBadge(status)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(special)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(special.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {special.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {special.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(special.start_date).toLocaleDateString()} - {new Date(special.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSpecial ? 'Edit Special' : 'Create Special'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Discount - 20% Off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Details about your special offer..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                />
              </div>
            </div>

            <div>
              <SingleImageUpload
                currentImage={currentBannerUrl || undefined}
                onImageSelect={setBannerFile}
                label="Banner Image"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                isLoading={saving}
                disabled={!title || !startDate || !endDate}
              >
                {editingSpecial ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
