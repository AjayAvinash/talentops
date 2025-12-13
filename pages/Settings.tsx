import React from 'react';
import { User, Bell, Lock, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* Profile Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Update your account details and profile.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                defaultValue="Jane Doe"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <input
                                    type="email"
                                    defaultValue="jane.doe@talentops.com"
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                                type="text"
                                defaultValue="Senior Recruiter"
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Manage how you receive alerts.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="candidates"
                                name="candidates"
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="candidates" className="font-medium text-gray-700">New Candidates</label>
                            <p className="text-gray-500">Get notified when a new candidate applies to your jobs.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="pipeline"
                                name="pipeline"
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="pipeline" className="font-medium text-gray-700">Pipeline Updates</label>
                            <p className="text-gray-500">Receive daily summaries of pipeline movement.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section (Static) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-medium text-gray-900">Security</h2>
                    </div>
                </div>
                <div className="p-6">
                    <button className="text-sm text-emerald-600 font-medium hover:text-emerald-500">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};
