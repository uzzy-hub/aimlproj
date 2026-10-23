import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  calculateUrgencyScore,
  type Assignment,
} from '../utils/studyEngine';

interface HeroSpatialStageProps {
  assignments: Assignment[];
  onOpenNewModal: () => void;
  onSelectAssignment: (id: string) => void;
  onJumpToPlanner: () => void;
}

export const HeroSpatialStage: React.FC<HeroSpatialStageProps> = ({
  assignments,
  onOpenNewModal,
  onSelectAssignment,
  onJumpToPlanner,
}) => {
  const [tilt, setTilt] = useState({ rotateX: 8, rotateY: -12 });
  const [activeLayer, setActiveLayer] = useState<'priority' | 'neural' | 'schedule'>('priority');

  const activeAssignments = assignments.filter((a) => a.status !== 'completed');
  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const topPriority = [...activeAssignments].sort(
    (a, b) => calculateUrgencyScore(b) - calculateUrgencyScore(a)
  )[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Math.round(-y * 14 * 10) / 10,
      rotateY: Math.round(x * 16 * 10) / 10,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 8, rotateY: -12 });
  };

  return (
    <section
      aria-label="Academic Overview and 3D Study Stage"
      className="relative py-8 lg:py-10 border-b border-slate-200/80"
    >
      {/* Bright White Ambient Daylight Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden -z-10"
      >
        <div className="absolute -top-24 left-1/4 w-[34rem] h-[34rem] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute top-12 right-10 w-[28rem] h-[28rem] rounded-full bg-indigo-100/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[40rem] h-40 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Editorial Academic Command Summary */}
          <div className="lg:col-span-7 flex flex-col justify-between glass-surface rounded-2xl p-7 lg:p-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-sky-700 mb-3">
                <span>AIML Student Productivity Mini-Project</span>
                <span aria-hidden="true">·</span>
                <span>Fall Semester 2026</span>
                <span aria-hidden="true">·</span>
                <span>Adaptive Cognitive Scheduler</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-4xl lg:text-[2.5rem] font-bold tracking-tight text-slate-900 leading-[1.15] mb-4"
                style={{ textWrap: 'balance' }}
              >
                Master Every Deadline with AI-Guided Study Architecture.
              </h1>

              <p className="text-slate-600 text-[15px] leading-relaxed max-w-[64ch] mb-6">
                LuminAI combines an urgency-weighted assignment prioritizer, an AI study-session
                decomposer, an NLP lecture-to-flashcard synthesizer, and a multi-variable grade
                predictor inside a clean, bright workspace built for high school and college students.
              </p>
            </div>

            {/* Key Action & Live KPI Strip */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/70">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Active Assignments</div>
                  <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {activeAssignments.length}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {completedCount} completed this week
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Highest Urgency Index</div>
                  <div className="font-mono text-2xl font-semibold text-sky-600 tabular-nums">
                    {topPriority ? `${calculateUrgencyScore(topPriority)}/100` : '0/100'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {topPriority ? topPriority.course.split('·')[0] : 'All caught up'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Predicted GPA Trajectory</div>
                  <div className="font-mono text-2xl font-semibold text-emerald-600 tabular-nums">
                    3.84
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    ▲ Optimal retention zone
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenNewModal}
                  className="btn-3d-primary text-white font-medium text-sm px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                >
                  + Add Assignment & Auto-Plan
                </button>
                <button
                  type="button"
                  onClick={onJumpToPlanner}
                  className="btn-3d-white text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                >
                  Inspect Smart Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Isometric Glassmorphism Study Cube Stage */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            data-testid="hero-3d-stage"
            className="lg:col-span-5 glass-surface rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden select-none"
            style={{ perspective: '1100px' }}
          >
            {/* Stage Header & Layer Switcher */}
            <div className="flex items-center justify-between gap-2 z-10 mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  3D Spatial Study Stack
                </span>
                <span className="text-[11px] text-slate-500">
                  Move cursor to tilt · Click layer to inspect
                </span>
              </div>

              <div
                role="tablist"
                aria-label="3D Stage Layer Selector"
                className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/70"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === 'priority'}
                  onClick={() => setActiveLayer('priority')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeLayer === 'priority'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Urgency
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === 'schedule'}
                  onClick={() => setActiveLayer('schedule')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeLayer === 'schedule'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Timeblocks
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === 'neural'}
                  onClick={() => setActiveLayer('neural')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeLayer === 'neural'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ML Model
                </button>
              </div>
            </div>

            {/* 3D Preserved Isometric Glass Stack */}
            <div className="my-auto py-4 flex items-center justify-center">
              <div
                className="w-full max-w-[360px] transition-transform duration-150 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                }}
              >
                {/* Back 3D Depth Plate */}
                <div
                  className="rounded-2xl bg-gradient-to-br from-sky-100/80 via-white/70 to-indigo-50/80 border border-white p-5 shadow-lg"
                  style={{
                    transform: 'translateZ(-18px)',
                  }}
                >
                  {activeLayer === 'priority' && topPriority && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium text-sky-700 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Top Ranked by ML Urgency
                        </span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          Score {calculateUrgencyScore(topPriority)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/95 border border-slate-200/80 shadow-xs">
                        <div className="text-xs text-slate-500 mb-1">
                          {topPriority.course} · Due {topPriority.dueDate}
                        </div>
                        <div className="font-display font-semibold text-sm text-slate-900 leading-snug mb-2">
                          {topPriority.title}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            {topPriority.estimatedHours}h est.
                          </span>
                          <span className="font-mono tabular-nums">
                            Weight: {topPriority.weightPercent}% of grade
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                        <span>
                          Subtasks completed:{' '}
                          <strong className="font-mono text-slate-900 tabular-nums">
                            {topPriority.subtasks.filter((s) => s.completed).length}/
                            {topPriority.subtasks.length}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectAssignment(topPriority.id)}
                          className="text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
                        >
                          Focus Task →
                        </button>
                      </div>
                    </div>
                  )}

                  {activeLayer === 'schedule' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-medium text-sky-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Today&apos;s Adaptive Blocks
                        </span>
                        <span className="font-mono text-slate-700 tabular-nums">2 × 90m</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/95 border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-medium text-sky-700 tabular-nums">
                            14:00 - 15:30
                          </span>
                          <span className="text-slate-500">Intensive Focus</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          CNN Confusion Matrix & Overfitting Analysis
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/95 border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-medium text-emerald-700 tabular-nums">
                            16:15 - 17:45
                          </span>
                          <span className="text-slate-500">Problem Solving</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          Lagrange Multipliers Optimization #1–6
                        </div>
                      </div>
                    </div>
                  )}

                  {activeLayer === 'neural' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium text-sky-700 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Multi-Factor Grade Regressor
                        </span>
                        <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                          R² = 0.91
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/95 border border-slate-200/80 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Submission Consistency</span>
                          <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                            +14.4 pts
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full w-[88%]" />
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                          <span className="text-slate-600">Spaced Recall Flashcards</span>
                          <span className="font-mono font-semibold text-sky-700 tabular-nums">
                            +8.4 pts
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[76%]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating 3D Front Glass Strip */}
                <div
                  className="mt-3 rounded-xl bg-white/90 border border-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs"
                  style={{
                    transform: 'translateZ(22px)',
                  }}
                >
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    AI Decomposer Ready
                  </span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {assignments.reduce((acc, a) => acc + a.subtasks.length, 0)} tracked milestones
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Stage Caption */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Zero-clutter glassmorphism UI
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Synced locally
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
