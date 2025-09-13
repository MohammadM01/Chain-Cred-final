import React, { useState } from 'react';
import api from '../utils/api';
import { useUser } from '../context/UserContext'; // If needed for toasts

const ProfileForm = ({ wallet, onSave }) => {
  const { showToast } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    github: '',
    education: [{ degree: '', institution: '', year: '' }],
    workExperience: [{ role: '', company: '', duration: '' }],
    skills: [],
  });

  // Handlers for dynamic fields (simplified; add more for adding/removing items)
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/resume/save-profile', { wallet, ...formData });
      showToast('success', 'Profile saved!');
      onSave();
    } catch (error) {
      showToast('error', 'Failed to save profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-md shadow-md">
      <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 mb-4 bg-black text-white border border-gray-700 rounded" />
      <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 mb-4 bg-black text-white border border-gray-700 rounded" />
      <input name="linkedin" placeholder="LinkedIn" onChange={handleChange} className="w-full p-2 mb-4 bg-black text-white border border-gray-700 rounded" />
      <input name="github" placeholder="GitHub" onChange={handleChange} className="w-full p-2 mb-4 bg-black text-white border border-gray-700 rounded" />
      {/* Add dynamic inputs for education, work, skills here (e.g., using arrays and buttons) */}
      <button type="submit" className="px-4 py-2 bg-yellow-400 text-black rounded">Save Profile</button>
    </form>
  );
};

export default ProfileForm;
