import React from 'react';
import { Users, Folder, ChevronRight, MoreHorizontal } from 'lucide-react';

export const TalentPools: React.FC = () => {
    // Static mock data for talent pools
    const pools = [
        { id: 1, name: 'Engineering Leads', count: 124, updated: '2 days ago', tags: ['Senior', 'Tech Lead', 'Architect'] },
        { id: 2, name: 'Frontend React Developers', count: 856, updated: '1 hour ago', tags: ['React', 'TypeScript', 'Mid-Level'] },
        { id: 3, name: 'Product Designers', count: 45, updated: '1 week ago', tags: ['UX/UI', 'Figma'] },
        { id: 4, name: 'Sales Executives (Remote)', count: 210, updated: '3 days ago', tags: ['Sales', 'SaaS', 'Remote'] },
        { id: 5, name: 'Internship Fall 2025', count: 1420, updated: 'Just now', tags: ['Junior', 'Intern', 'University'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Talent Pools</h1>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium">
                    Create New Pool
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                    <div key={pool.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Folder className="w-6 h-6" />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                            {pool.name}
                        </h3>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Users className="w-4 h-4 mr-1.5" />
                            {pool.count.toLocaleString()} candidates
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {pool.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>Updated {pool.updated}</span>
                            <div className="flex items-center text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                View Candidates <ChevronRight className="w-4 h-4 ml-0.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
