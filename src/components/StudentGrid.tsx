import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Check, X, Minus } from 'lucide-react';

interface Student {
  id: number;
  name: string;
}

interface Record {
  id: number;
  student_id: number;
  date: string;
  attendance: string;
  homework: string;
  note: string;
}

interface StudentGridProps {
  groupId: number;
}

export default function StudentGrid({ groupId }: StudentGridProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [endDate, setEndDate] = useState(new Date());

  // Edit State
  const [editingCell, setEditingCell] = useState<{ studentId: number; date: string } | null>(null);
  const [editForm, setEditForm] = useState({ attendance: '', homework: '', note: '' });

  // Initialize dates (last 7 days)
  useEffect(() => {
    const d = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      d.push(date.toISOString().split('T')[0]);
    }
    setDates(d);
  }, [endDate]);

  useEffect(() => {
    if (dates.length === 0) return;
    setLoading(true);
    const start = dates[0];
    const end = dates[dates.length - 1];

    fetch(`/api/grid?groupId=${groupId}&startDate=${start}&endDate=${end}`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students);
        setRecords(data.records);
        setLoading(false);
      });
  }, [groupId, dates]);

  const getRecord = (studentId: number, date: string) => {
    return records.find((r) => r.student_id === studentId && r.date === date);
  };

  const handleCellClick = (studentId: number, date: string) => {
    const record = getRecord(studentId, date);
    setEditingCell({ studentId, date });
    setEditForm({
      attendance: record?.attendance || '',
      homework: record?.homework || '',
      note: record?.note || '',
    });
  };

  const handleSave = async () => {
    if (!editingCell) return;

    // Optimistic update
    const newRecord = {
      id: Math.random(), // temp id
      student_id: editingCell.studentId,
      date: editingCell.date,
      ...editForm,
    };

    setRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.student_id === editingCell.studentId && r.date === editingCell.date)
      );
      return [...filtered, newRecord];
    });

    setEditingCell(null);

    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: editingCell.studentId,
          date: editingCell.date,
          ...editForm,
        }),
      });
    } catch (error) {
      console.error('Failed to save record', error);
    }
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(endDate);
    newDate.setDate(newDate.getDate() + days);
    setEndDate(newDate);
  };

  const handleNameChange = async (studentId: number, newName: string) => {
    setStudents((prev) => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
    try {
      await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
    } catch (error) {
      console.error('Failed to update name', error);
    }
  };

  if (loading && students.length === 0) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={() => shiftDate(-7)} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft /></button>
          <span className="font-medium text-gray-700">
            {dates[0]} - {dates[dates.length - 1]}
          </span>
          <button onClick={() => shiftDate(7)} className="p-1 hover:bg-gray-200 rounded"><ChevronRight /></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left border-b border-r border-gray-200 bg-gray-100 min-w-[200px] font-bold italic text-lg transform -rotate-2 origin-bottom-left text-gray-600">
                Keldi_Ketti
              </th>
              {dates.map((date) => (
                <th key={date} className="p-2 border-b border-gray-200 bg-gray-50 w-24 text-center">
                  <div className="h-24 flex items-center justify-center">
                    <span className="transform -rotate-90 whitespace-nowrap text-gray-600 font-medium">
                      {date.split('-').slice(1).reverse().join('.')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="p-2 border-b border-r border-gray-200 font-medium text-gray-900">
                  <input 
                    value={student.name}
                    onChange={(e) => handleNameChange(student.id, e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0"
                  />
                </td>
                {dates.map((date) => {
                  const record = getRecord(student.id, date);
                  const att = record?.attendance;
                  const hw = record?.homework;
                  
                  let display = "";
                  if (att === 'Keldi') display += "+";
                  else if (att === 'Kelmadi') display += "-";
                  
                  if (hw === 'Topshirdi') display += ", +";
                  else if (hw === 'Topshirmadi') display += ", -";

                  const hasNote = record?.note && record.note.trim().length > 0;

                  return (
                    <td 
                      key={date} 
                      onClick={() => handleCellClick(student.id, date)}
                      className="p-2 border-b border-gray-200 text-center cursor-pointer hover:bg-blue-50 transition-colors text-lg font-mono relative border-r"
                    >
                      {display}
                      {hasNote && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-red-500 border-r-transparent transform rotate-90"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal/Popover */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setEditingCell(null)}>
          <div className="bg-white p-6 rounded-xl shadow-xl w-80" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">Edit Record</h3>
                <p className="text-sm text-gray-500">{editingCell.date.split('-').slice(1).reverse().join('.')}</p>
              </div>
              <button 
                onClick={() => {
                  setEditForm({ attendance: '', homework: '', note: '' });
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditForm({ ...editForm, attendance: editForm.attendance === 'Keldi' ? '' : 'Keldi' })}
                    className={`flex-1 py-2 rounded border transition-colors ${editForm.attendance === 'Keldi' ? 'bg-green-100 border-green-500 text-green-700 font-bold' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Keldi (+)
                  </button>
                  <button
                    onClick={() => setEditForm({ ...editForm, attendance: editForm.attendance === 'Kelmadi' ? '' : 'Kelmadi' })}
                    className={`flex-1 py-2 rounded border transition-colors ${editForm.attendance === 'Kelmadi' ? 'bg-red-100 border-red-500 text-red-700 font-bold' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Kelmadi (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Homework</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditForm({ ...editForm, homework: editForm.homework === 'Topshirdi' ? '' : 'Topshirdi' })}
                    className={`flex-1 py-2 rounded border transition-colors ${editForm.homework === 'Topshirdi' ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Topshirdi (+)
                  </button>
                  <button
                    onClick={() => setEditForm({ ...editForm, homework: editForm.homework === 'Topshirmadi' ? '' : 'Topshirmadi' })}
                    className={`flex-1 py-2 rounded border transition-colors ${editForm.homework === 'Topshirmadi' ? 'bg-orange-100 border-orange-500 text-orange-700 font-bold' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Topshirmadi (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setEditingCell(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
