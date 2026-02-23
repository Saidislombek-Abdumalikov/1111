/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import GroupSelector from './components/GroupSelector';
import StudentGrid from './components/StudentGrid';

export default function App() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">IELTS Tracker</h1>
          <p className="text-gray-500 mt-1">Simple progress tracking for your students</p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <GroupSelector 
            selectedGroupId={selectedGroupId} 
            onSelect={setSelectedGroupId} 
          />
        </div>

        {selectedGroupId ? (
          <StudentGrid groupId={selectedGroupId} />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Please select a group to view records.</p>
          </div>
        )}
      </div>
    </div>
  );
}

