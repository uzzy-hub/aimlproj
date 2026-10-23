import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Play,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  calculateUrgencyScore,
  getDaysRemainingLabel,
  generateSmartStudySchedule,
  type Assignment,
  type AssignmentStatus,
} from '../utils/studyEngine';

interface StudyPlannerWorkspaceProps {
  assignments: Assignment[];
  selectedAssignmentId: string | null;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onUpdateStatus: (assignmentId: string, status: AssignmentStatus) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onAddSubtasks: (
    assignmentId: string,
    newSubtasks: { id: string; title: string; durationMinutes: number; completed: boolean }[]
  ) => void;
  onOpenNewModal: () => void;
  onStartFocusForAssignment: (assignment: Assignment) => void;
}

export const StudyPlannerWorkspace: React.FC<StudyPlannerWorkspaceProps> = ({
  assignments,
  selectedAssignmentId,
  onToggleSubtask,
  onUpdateStatus,
  onDeleteAssignment,
  onAddSubtasks,
  onOpenNewModal,
  onStartFocusForAssignment,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | AssignmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(4.5);
  const [peakWindow, setPeakWindow] = useState<'Morning' | 'Afternoon' | 'Evening'>('Afternoon');
  const [decomposingId, setDecomposingId] = useState<string | null>(null);
  const [aiAdviceMap, setAiAdviceMap] = useState<Record<string, string>>({});
  const [customSubtaskInputs, setCustomSubtaskInputs] = useState<Record<string, string>>({});

  const filteredAssignments = assignments
    .filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (
        searchQuery.trim() !== '' &&
        !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.course.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => calculateUrgencyScore(b) - calculateUrgencyScore(a));

  const studySchedule = generateSmartStudySchedule(
    assignments,
    dailyHours,
    '2026-10-22',
    peakWindow
  );

  const handleAIDecompose = async (assignment: Assignment) => {
    setDecomposingId(assignment.id);
    try {
      const response = await fetch('/api/ai/decompose-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignment.title,
          course: assignment.course,
          category: assignment.category,
          estimatedHours: assignment.estimatedHours,
          difficulty: assignment.difficulty,
        }),
      });
      const data = await response.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        onAddSubtasks(assignment.id, data.subtasks);
      }
      if (data.aiAdvice) {
        setAiAdviceMap((prev) => ({ ...prev, [assignment.id]: data.aiAdvice }));
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setDecomposingId(null);
    }
  };

  const handleAddCustomSubtask = (assignmentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = (customSubtaskInputs[assignmentId] || '').trim();
    if (!text) return;
    onAddSubtasks(assignmentId, [
      {
        id: `custom-${Date.now()}`,
        title: text,
        durationMinutes: 30,
        completed: false,
      },
    ]);
    setCustomSubtaskInputs((prev) => ({ ...prev, [assignmentId]: '' }));
  };

  return (
    <section
      id="planner-workspace"
      aria-label="Personalized AI Study Planner and Assignment Manager"
      className="py-10 max-w-[1280px] mx-auto px-6"
    >
      {/* Section Heading & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-medium text-sky-700 mb-1">
            01. Personalized AI Study Planner & Assignment Queue
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Urgency-Ranked Assignments & Adaptive Timetable
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search assignments by title or course"
              placeholder="Search course or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 w-56"
            />
          </div>

          {/* Interactive Filter Tabs */}
          <div
            role="group"
            aria-label="Filter assignments by status"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80"
          >
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((st) => {
              const labels: Record<typeof st, string> = {
                all: 'All Tasks',
                todo: 'To Do',
                in_progress: 'In Progress',
                completed: 'Completed',
              };
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterStatus === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[st]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Zone Layout: Left 7 cols Assignments, Right 5 cols Adaptive AI Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assignment Cards */}
        <div className="lg:col-span-7 space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="glass-surface rounded-2xl p-10 text-center">
              <p className="text-sm font-medium text-slate-700 mb-1">
                No assignments match your current filter.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Add a new school or college assignment to generate an AI milestone breakdown.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="btn-3d-white text-xs font-medium px-4 py-2 rounded-xl text-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const urgency = calculateUrgencyScore(assignment);
              const dueMeta = getDaysRemainingLabel(assignment.dueDate);
              const completedSubtasks = assignment.subtasks.filter((s) => s.completed).length;
              const progressPercent =
                assignment.subtasks.length > 0
                  ? Math.round((completedSubtasks / assignment.subtasks.length) * 100)
                  : assignment.status === 'completed'
                  ? 100
                  : 0;
              const isHighlighted = selectedAssignmentId === assignment.id;

              return (
                <article
                  key={assignment.id}
                  id={`assignment-${assignment.id}`}
                  className={`glass-surface card-3d-elevation rounded-2xl p-6 transition-all ${
                    isHighlighted ? 'ring-2 ring-sky-500' : ''
                  }`}
                >
                  {/* Top Metadata Line (Zero-Pill Unboxed Discipline) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-700">{assignment.course}</span>
                      <span aria-hidden="true">·</span>
                      <span>{assignment.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Weight {assignment.weightPercent}%
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Difficulty {assignment.difficulty}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      {assignment.status !== 'completed' ? (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            dueMeta.isUrgent ? 'text-amber-700' : 'text-slate-600'
                          }`}
                        >
                          {dueMeta.isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {dueMeta.label} ({assignment.dueDate})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Urgency Metric */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                      {assignment.title}
                    </h3>

                    {assignment.status !== 'completed' && (
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-500">ML Priority</div>
                        <div
                          className={`font-mono text-sm font-bold tabular-nums ${
                            urgency >= 75
                              ? 'text-rose-600'
                              : urgency >= 55
                              ? 'text-amber-600'
                              : 'text-sky-600'
                          }`}
                        >
                          {urgency} / 100
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                      <span>
                        Milestone Progress ({completedSubtasks} of {assignment.subtasks.length}{' '}
                        subtasks)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtasks Checklist */}
                  <div className="space-y-2 mb-4">
                    {assignment.subtasks.map((st) => (
                      <label
                        key={st.id}
                        className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          st.completed
                            ? 'bg-slate-50/80 border-slate-200/60 text-slate-400 line-through'
                            : 'bg-white/90 border-slate-200/90 text-slate-800 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => onToggleSubtask(assignment.id, st.id)}
                            className="sr-only"
                          />
                          {st.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-relaxed">{st.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0 tabular-nums">
                          {st.durationMinutes}m
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Quick Add Subtask Input */}
                  <form
                    onSubmit={(e) => handleAddCustomSubtask(assignment.id, e)}
                    className="flex items-center gap-2 mb-4"
                  >
                    <input
                      type="text"
                      aria-label={`Add milestone to ${assignment.title}`}
                      placeholder="Add a custom study step (e.g., Review theorem 4.2)..."
                      value={customSubtaskInputs[assignment.id] || ''}
                      onChange={(e) =>
                        setCustomSubtaskInputs((prev) => ({
                          ...prev,
                          [assignment.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-1.5 text-xs bg-white/90 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Add Step
                    </button>
                  </form>

                  {/* Optional AI Advice Callout */}
                  {aiAdviceMap[assignment.id] && (
                    <div className="mb-4 p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-xs text-sky-900">
                      <strong className="font-semibold">AI Study Strategy: </strong>
                      {aiAdviceMap[assignment.id]}
                    </div>
                  )}

                  {/* Card Footer Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={decomposingId === assignment.id}
                        onClick={() => handleAIDecompose(assignment)}
                        className="btn-3d-white px-3 py-1.5 rounded-lg text-xs font-medium text-sky-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {decomposingId === assignment.id
                          ? 'Decomposing...'
                          : 'AI Breakdown Subtasks'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartFocusForAssignment(assignment)}
                        className="btn-3d-white px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        Focus Session
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Status for ${assignment.title}`}
                        value={assignment.status}
                        onChange={(e) =>
                          onUpdateStatus(assignment.id, e.target.value as AssignmentStatus)
                        }
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        aria-label={`Delete ${assignment.title}`}
                        onClick={() => onDeleteAssignment(assignment.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Right Column: Personalized AI Daily Study Timetable */}
        <aside
          aria-label="Adaptive AI Study Timetable"
          className="lg:col-span-5 glass-panel rounded-2xl p-6 lg:sticky lg:top-20"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-semibold text-sky-700 block">
                AI Timetable Optimizer
              </span>
              <h3 className="font-display text-lg font-bold text-slate-900">
                5-Day Personalized Study Plan
              </h3>
            </div>
            <Calendar className="w-5 h-5 text-sky-600 shrink-0" />
          </div>

          {/* Timetable Parameters */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-4 mb-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor="daily-hours-slider" className="font-medium text-slate-700">
                  Daily Study Capacity
                </label>
                <span className="font-mono font-semibold text-sky-700 tabular-nums">
                  {dailyHours} hrs / day
                </span>
              </div>
              <input
                id="daily-hours-slider"
                type="range"
                min={1.5}
                max={6}
                step={1.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-0.5">
                <span>1.5h (Light)</span>
                <span>3.0h (Balanced)</span>
                <span>4.5h (Deep)</span>
                <span>6.0h (Exam)</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-700 block mb-1.5">
                Preferred Peak Cognitive Window
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
                {(['Morning', 'Afternoon', 'Evening'] as const).map((win) => (
                  <button
                    key={win}
                    type="button"
                    onClick={() => setPeakWindow(win)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      peakWindow === win
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {win}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Timeblocks */}
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {studySchedule.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All assignments are marked completed. Enjoy your free study window!
              </div>
            ) : (
              studySchedule.map((block) => (
                <div
                  key={block.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{block.dayLabel}</span>
                    <span className="font-mono text-sky-700 font-medium tabular-nums flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {block.timeSlot}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 mb-1">
                    {block.assignmentTitle}
                  </div>

                  <div className="text-xs text-slate-600 mb-2">
                    Milestone: <span className="text-slate-800">{block.focusTopic}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{block.course.split('·')[0]}</span>
                    <span className="font-mono tabular-nums">
                      Load: {block.cognitiveLoad} · Priority {block.priorityScore}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};
