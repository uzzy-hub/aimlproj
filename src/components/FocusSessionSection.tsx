import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import type { Assignment } from '../utils/studyEngine';

interface FocusSessionSectionProps {
  activeAssignment: Assignment | null;
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onCompleteSession: (assignmentId: string, minutesLogged: number) => void;
}

export const FocusSessionSection: React.FC<FocusSessionSectionProps> = ({
  activeAssignment,
  assignments,
  onSelectAssignment,
  onCompleteSession,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'deep' | 'break'>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(2);

  const modeDurations: Record<typeof mode, number> = {
    pomodoro: 25 * 60,
    deep: 50 * 60,
    break: 10 * 60,
  };

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setSessionsCompleted((c) => c + 1);
          if (activeAssignment) {
            onCompleteSession(activeAssignment.id, Math.round(modeDurations[mode] / 60));
          }
          return modeDurations[mode];
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, mode, activeAssignment, onCompleteSession]);

  const handleSwitchMode = (newMode: typeof mode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(modeDurations[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(modeDurations[mode]);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const targetTask =
    activeAssignment || assignments.find((a) => a.status !== 'completed') || assignments[0];

  return (
    <section
      id="focus-timer"
      aria-label="3D Deep Work Pomodoro Timer"
      className="py-10 border-t border-slate-200/80 max-w-[1280px] mx-auto px-6"
    >
      <div className="glass-surface rounded-2xl p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Cols: Context & Assignment Target */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-medium text-sky-700">
              04. Cognitive Focus & Spaced Repetition Cadence
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tactile 3D Deep-Work Session Timer
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[60ch]">
              Pair your highest-urgency assignment with structured 25-minute Pomodoro sprints or
              50-minute college deep-work blocks to prevent context switching.
            </p>

            {targetTask && (
              <div className="p-4 rounded-xl bg-white/95 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Currently Bound Assignment</span>
                  <span className="font-mono text-sky-700 tabular-nums">{targetTask.course}</span>
                </div>
                <div className="font-display font-bold text-base text-slate-900">
                  {targetTask.title}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <label htmlFor="focus-task-select" className="text-xs text-slate-500">
                    Switch active assignment:
                  </label>
                  <select
                    id="focus-task-select"
                    value={targetTask.id}
                    onChange={(e) => {
                      const found = assignments.find((a) => a.id === e.target.value);
                      if (found) onSelectAssignment(found);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                  >
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Cols: 3D Tactile Clock Dial */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/80 shadow-inner">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70 mb-5">
              <button
                type="button"
                onClick={() => handleSwitchMode('pomodoro')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === 'pomodoro'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                25m Sprint
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('deep')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === 'deep'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                50m Deep Work
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('break')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === 'break'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10m Recovery
              </button>
            </div>

            {/* Monospace Tabular Readout */}
            <div
              aria-live="polite"
              className="font-mono text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight tabular-nums my-2"
            >
              {mins}:{secs}
            </div>

            <div className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              {isRunning ? 'Focus session active — stay in flow' : 'Ready to start timed interval'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className="btn-3d-primary text-white font-medium text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Focus Block
                  </>
                )}
              </button>

              <button
                type="button"
                aria-label="Reset focus timer"
                onClick={handleReset}
                className="btn-3d-white text-slate-700 font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/70 w-full flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed today
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {sessionsCompleted} intervals ({sessionsCompleted * 25} mins)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
