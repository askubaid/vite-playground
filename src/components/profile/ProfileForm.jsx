import React from 'react';
import PasswordSection from './PasswordSection';

const ProfileForm = ({
    formData,
    errors,
    isEditing,
    onSubmit,
    onChange,
    onEdit,
    onCancel,
    hasUnsavedChanges
}) => {
    if (!isEditing) {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                </div>
                <button
                    onClick={onEdit}
                    className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Edit Profile
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={onChange}
                    className={`mt-1 block w-full border ${
                        errors.name 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                />
                {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
            </div>

            <PasswordSection
                formData={formData}
                errors={errors}
                onChange={onChange}
            />

            <div className="flex space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;
