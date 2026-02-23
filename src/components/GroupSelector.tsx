import { useState, useEffect } from 'react';

interface Group {
  id: number;
  name: string;
}

interface GroupSelectorProps {
  onSelect: (groupId: number) => void;
  selectedGroupId: number | null;
}

export default function GroupSelector({ onSelect, selectedGroupId }: GroupSelectorProps) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
      <div className="flex gap-2 flex-wrap">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGroupId === group.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}
