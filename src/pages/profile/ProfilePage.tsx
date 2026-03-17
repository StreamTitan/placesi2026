import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProfileImageUpload } from '../../components/ui/ProfileImageUpload';
import { User, Mail, Phone, Calendar, Users, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { formatPhoneNumber } from '../../lib/formatters';
import { uploadProfileImage, deleteProfileImage } from '../../services/imageUpload';
import type { Database } from '../../lib/database.types';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../lib/countries';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProfilePage() {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        const phoneStr = data.phone || '';
        if (phoneStr.startsWith('1868') && phoneStr.length === 11) {
          setPhoneNumber(phoneStr.substring(4));
        } else {
          setPhoneNumber('');
        }
        setCountry(data.country || DEFAULT_COUNTRY);
        setSex(data.sex || '');
        setDateOfBirth(data.date_of_birth || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (phoneNumber && phoneNumber.length !== 7) {
      setError('Phone number must be exactly 7 digits');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if ((newPassword || confirmPassword) && !newPassword) {
      setError('Please enter a new password');
      return;
    }

    if ((newPassword || confirmPassword) && !confirmPassword) {
      setError('Please confirm your new password');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);

    try {
      const formattedPhone = phoneNumber && phoneNumber.length === 7 ? `1868${phoneNumber}` : (phone || null);

      await updateAuthProfile({
        full_name: fullName,
        phone: formattedPhone,
        country: country || DEFAULT_COUNTRY,
        sex: sex || null,
        date_of_birth: dateOfBirth || null,
      });

      if (profile?.role === 'agency' && formattedPhone) {
        await supabase
          .from('agencies')
          .update({ phone: formattedPhone })
          .eq('created_by', user?.id);
      }

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;
      }

      setSuccess(newPassword ? 'Profile and password updated successfully!' : 'Profile updated successfully!');
      setEditing(false);
      setNewPassword('');
      setConfirmPassword('');
      fetchProfile();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      const phoneStr = profile.phone || '';
      if (phoneStr.startsWith('1868') && phoneStr.length === 11) {
        setPhoneNumber(phoneStr.substring(4));
      } else {
        setPhoneNumber('');
      }
      setCountry(profile.country || DEFAULT_COUNTRY);
      setSex(profile.sex || '');
      setDateOfBirth(profile.date_of_birth || '');
    }
    setNewPassword('');
    setConfirmPassword('');
    setEditing(false);
    setError('');
  };

  const formatSex = (sex: string) => {
    switch (sex) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'other':
        return 'Other';
      case 'prefer_not_to_say':
        return 'Prefer not to say';
      default:
        return 'Not specified';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {profile?.role === 'agent' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Profile Photo
              </h2>
              <ProfileImageUpload
                currentImageUrl={profile?.avatar_url}
                onUpload={async (file) => {
                  const result = await uploadProfileImage(file, user!.id);
                  if (!result.error) {
                    await supabase
                      .from('profiles')
                      .update({ avatar_url: result.url })
                      .eq('id', user!.id);
                    await fetchProfile();
                  }
                  return result;
                }}
                onRemove={async () => {
                  await deleteProfileImage(user!.id);
                  await supabase
                    .from('profiles')
                    .update({ avatar_url: null })
                    .eq('id', user!.id);
                  await fetchProfile();
                }}
                disabled={false}
              />
            </div>
          </Card>
        )}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
              {!editing && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                  {editing ? (
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.full_name || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  {editing ? (
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      helperText="Enter your 7-digit phone number"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.phone ? formatPhoneNumber(profile.phone) : 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Country</p>
                  {editing ? (
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {COUNTRIES.map((countryName) => (
                        <option key={countryName} value={countryName}>
                          {countryName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.country || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{profile?.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Security</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your password</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Password</p>
                  {editing ? (
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">••••••••</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</p>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
                    )}
                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">Passwords match</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {profile?.role !== 'contractor' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Personal Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This information helps us provide better recommendations</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sex</p>
                    {editing ? (
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Select sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{formatSex(profile?.sex || '')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-white mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                    {editing ? (
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(profile?.date_of_birth || '')}</p>
                    )}
                  </div>
                </div>

              </div>

              {editing && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1" isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
