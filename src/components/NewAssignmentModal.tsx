import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import type { Assignment } from '../utils/studyEngine';

interface NewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAssignment: (assignment: Assignment) => void;
}

export const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({
  isOpen,
  onClose,
  onCreateAssignment,
}) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [category, setCategory] = useState<Assignment['category']>('Project');
  const [dueDate, setDueDate] = useState('2026-10-25');
  const [estimatedHours, setEstimatedHours] = useState(3.5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [weightPercent, setWeightPercent] = useState(15);
  const [autoDecompose, setAutoDecompose] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an assignment title.');
      return;
    }
    if (!course.trim()) {
      setErrorMsg('Please enter the course or subject name.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    let generatedSubtasks = [
      {
        id: `st-${Date.now()}-1`,
        title: `Review instructions & gather study materials for ${title.trim()}`,
        durationMinutes: 30,
        completed: false,
      },
      {
        id: `st-${Date.now()}-2`,
        title: `Complete primary draft / core problem solving`,
        durationMinutes: 50,
        completed: false,
      },
    ];

    if (autoDecompose) {
      try {
        const res = await fetch('/api/ai/decompose-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            course: course.trim(),
            category,
            estimatedHours,
            difficulty,
          }),
        });
        const data = await res.json();
        if (data.subtasks && Array.isArray(data.subtasks) && data.subtasks.length > 0) {
          generatedSubtasks = data.subtasks;
        }
      } catch {
        // Keep default subtasks if network fails
      }
    }

    const newAssignment: Assignment = {
      id: `asn-${Date.now()}`,
      title: title.trim(),
      course: course.trim(),
      category,
      dueDate,
      estimatedHours: Number(estimatedHours) || 3,
      difficulty,
      weightPercent: Number(weightPercent) || 10,
      status: 'todo',
      subtasks: generatedSubtasks,
    };

    onCreateAssignment(newAssignment);
    setIsSubmitting(false);
    setTitle('');
    setCourse('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-new-assignment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs"
    >
      <div className="glass-panel rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div>
            <span className="text-xs font-semibold text-sky-700 block">
              AI-Assisted Task Intake
            </span>
            <h2
              id="modal-new-assignment-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              Add New Assignment to Study Plan
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="new-asn-title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Assignment Title *
            </label>
            <input
              id="new-asn-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Support Vector Machines Kernel Lab"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-asn-course"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Course / Subject *
              </label>
              <input
                id="new-asn-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g., CS-301 Intro to AIML"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-asn-category"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="new-asn-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Assignment['category'])}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="Project">Project</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Problem Set">Problem Set</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Reading">Reading</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="new-asn-due"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Due Date
              </label>
              <input
                id="new-asn-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-asn-hours"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Est. Hours
              </label>
              <input
                id="new-asn-hours"
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-asn-weight"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Grade Weight (%)
              </label>
              <input
                id="new-asn-weight"
                type="number"
                min={1}
                max={60}
                value={weightPercent}
                onChange={(e) => setWeightPercent(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor="new-asn-difficulty" className="font-semibold text-slate-700">
                Complexity / Difficulty Level
              </label>
              <span className="font-mono font-semibold text-sky-700 tabular-nums">
                {difficulty} / 5
              </span>
            </div>
            <input
              id="new-asn-difficulty"
              type="range"
              min={1}
              max={5}
              step={1}
              value={difficulty}
              onChange={(e) =>
                setDifficulty(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)
              }
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50/90 border border-sky-200/80 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDecompose}
              onChange={(e) => setAutoDecompose(e.target.checked)}
              className="accent-sky-600 rounded"
            />
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Automatically decompose into study subtasks using AI Study Planner
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-white px-4 py-2 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-medium text-white cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Generating Plan...' : 'Create & Schedule Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
