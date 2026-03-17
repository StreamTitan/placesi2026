import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfileImageUpload } from '../ui/ProfileImageUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Lock, User, Briefcase, Info } from 'lucide-react';
import { updateComprehensiveAgentInfo, changeAgentPassword, type AgentWithPerformance } from '../../services/agentManagement';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentWithPerformance;
  onSuccess: () => void;
}

export function EditAgentModal({ isOpen, onClose, agent, onSuccess }: EditAgentModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [basicForm, setBasicForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });

  const [contactForm, setContactForm] = useState({
    email: '',
    whatsapp: '',
  });

  const [professionalForm, setProfessionalForm] = useState({
    license_number: '',
    bio: '',
    years_experience: 0,
    specializations: [] as string[],
  });

  const [extendedForm, setExtendedForm] = useState({
    about: '',
    mission: '',
    languages_spoken: [] as string[],
    certifications: [] as string[],
    awards: [] as string[],
    areas_served: [] as string[],
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [specializationsInput, setSpecializationsInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [certificationsInput, setCertificationsInput] = useState('');
  const [awardsInput, setAwardsInput] = useState('');
  const [areasInput, setAreasInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (agent) {
      setBasicForm({
        full_name: agent.full_name || '',
        phone: agent.phone || '',
        avatar_url: agent.avatar_url || '',
      });

      setContactForm({
        email: agent.agentProfile?.email || '',
        whatsapp: agent.agentProfile?.whatsapp || '',
      });

      setProfessionalForm({
        license_number: agent.agentProfile?.license_number || '',
        bio: agent.agentProfile?.bio || '',
        years_experience: agent.agentProfile?.years_experience || 0,
        specializations: agent.agentProfile?.specializations || [],
      });

      setExtendedForm({
        about: agent.agentProfile?.about || '',
        mission: agent.agentProfile?.mission || '',
        languages_spoken: agent.agentProfile?.languages_spoken || [],
        certifications: agent.agentProfile?.certifications || [],
        awards: agent.agentProfile?.awards || [],
        areas_served: agent.agentProfile?.areas_served || [],
      });

      setSpecializationsInput((agent.agentProfile?.specializations || []).join(', '));
      setLanguagesInput((agent.agentProfile?.languages_spoken || []).join(', '));
      setCertificationsInput((agent.agentProfile?.certifications || []).join(', '));
      setAwardsInput((agent.agentProfile?.awards || []).join(', '));
      setAreasInput((agent.agentProfile?.areas_served || []).join(', '));
    }
  }, [agent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        profile: basicForm,
        agentProfile: {
          ...contactForm,
          ...professionalForm,
          ...extendedForm,
        },
      };

      const success = await updateComprehensiveAgentInfo(agent.id, updates);

      if (success) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to update agent information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving agent info:', error);
      alert('An error occurred while updating. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordForm.newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changeAgentPassword(
        agent.id,
        passwordForm.newPassword
      );

      if (result.success) {
        alert('Password changed successfully');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleArrayInputChange = (
    value: string,
    setter: (val: string) => void,
    formSetter: (fn: (prev: any) => any) => void,
    key: string
  ) => {
    setter(value);
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    formSetter(prev => ({ ...prev, [key]: array }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${agent.full_name || 'Agent'}`}
      size="large"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="basic">
              <User className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Briefcase className="w-4 h-4 mr-2" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="extended">
              <Info className="w-4 h-4 mr-2" />
              Extended
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <ProfileImageUpload
                currentImageUrl={basicForm.avatar_url}
                onImageUploaded={(url) => setBasicForm({ ...basicForm, avatar_url: url })}
                userId={agent.id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={basicForm.full_name}
                onChange={(e) => setBasicForm({ ...basicForm, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={basicForm.phone}
                onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp
              </label>
              <Input
                type="tel"
                value={contactForm.whatsapp}
                onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                placeholder="e.g., +1868XXXXXXX"
              />
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Number
              </label>
              <Input
                type="text"
                value={professionalForm.license_number}
                onChange={(e) => setProfessionalForm({ ...professionalForm, license_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                min="0"
                value={professionalForm.years_experience}
                onChange={(e) => setProfessionalForm({ ...professionalForm, years_experience: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specializations (comma-separated)
              </label>
              <Input
                type="text"
                value={specializationsInput}
                onChange={(e) => handleArrayInputChange(e.target.value, setSpecializationsInput, setProfessionalForm, 'specializations')}
                placeholder="e.g., Residential, Commercial, Luxury Properties"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={professionalForm.bio}
                onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Brief professional bio..."
              />
            </div>
          </TabsContent>

          <TabsContent value="extended" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About
              </label>
              <textarea
                value={extendedForm.about}
                onChange={(e) => setExtendedForm({ ...extendedForm, about: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Comprehensive agent description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission Statement
              </label>
              <textarea
                value={extendedForm.mission}
                onChange={(e) => setExtendedForm({ ...extendedForm, mission: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Your professional mission..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages Spoken (comma-separated)
              </label>
              <Input
                type="text"
                value={languagesInput}
                onChange={(e) => handleArrayInputChange(e.target.value, setLanguagesInput, setExtendedForm, 'languages_spoken')}
                placeholder="e.g., English, Spanish, French"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certifications (comma-separated)
              </label>
              <Input
                type="text"
                value={certificationsInput}
                onChange={(e) => handleArrayInputChange(e.target.value, setCertificationsInput, setExtendedForm, 'certifications')}
                placeholder="e.g., Licensed Real Estate Agent, Certified Negotiator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Awards (comma-separated)
              </label>
              <Input
                type="text"
                value={awardsInput}
                onChange={(e) => handleArrayInputChange(e.target.value, setAwardsInput, setExtendedForm, 'awards')}
                placeholder="e.g., Top Sales Agent 2023, Customer Service Excellence"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas Served (comma-separated)
              </label>
              <Input
                type="text"
                value={areasInput}
                onChange={(e) => handleArrayInputChange(e.target.value, setAreasInput, setExtendedForm, 'areas_served')}
                placeholder="e.g., Port of Spain, San Fernando, Chaguanas"
              />
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Note: This will change the password for the agent's account. The agent will need to use the new password for their next login.
              </p>
            </div>

            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password for Agent
              </label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="w-full"
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
