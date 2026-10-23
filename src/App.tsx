/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_ASSIGNMENTS } from './data/seedData';
import type { Assignment, AssignmentStatus } from './utils/studyEngine';
import { HeroSpatialStage } from './components/HeroSpatialStage';
import { StudyPlannerWorkspace } from './components/StudyPlannerWorkspace';
import { AimlStudentLab } from './components/AimlStudentLab';
import { FocusSessionSection } from './components/FocusSessionSection';
import { NewAssignmentModal } from './components/NewAssignmentModal';

const STORAGE_KEY = 'luminai_student_assignments_v1';

export default function App() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed data
    }
    return INITIAL_ASSIGNMENTS;
  });

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    INITIAL_ASSIGNMENTS[0].id
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      // Ignore storage quota errors
    }
  }, [assignments]);

  const handleToggleSubtask = (assignmentId: string, subtaskId: string) => {
    setAssignments((prev) =>
      prev.map((asn) => {
        if (asn.id !== assignmentId) return asn;
        const updatedSubtasks = asn.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone =
          updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
        const anyDone = updatedSubtasks.some((st) => st.completed);
        const nextStatus: AssignmentStatus = allDone
          ? 'completed'
          : anyDone
          ? 'in_progress'
          : asn.status;

        return {
          ...asn,
          subtasks: updatedSubtasks,
          status: nextStatus,
        };
      })
    );
  };

  const handleUpdateStatus = (assignmentId: string, status: AssignmentStatus) => {
    setAssignments((prev) =>
      prev.map((asn) => (asn.id === assignmentId ? { ...asn, status } : asn))
    );
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((asn) => asn.id !== assignmentId));
  };

  const handleAddSubtasks = (
    assignmentId: string,
    newSubtasks: { id: string; title: string; durationMinutes: number; completed: boolean }[]
  ) => {
    setAssignments((prev) =>
      prev.map((asn) =>
        asn.id === assignmentId
          ? {
              ...asn,
              subtasks: [...asn.subtasks, ...newSubtasks],
              status: asn.status === 'completed' ? 'in_progress' : asn.status,
            }
          : asn
      )
    );
  };

  const handleCreateAssignment = (newAssignment: Assignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
    setSelectedAssignmentId(newAssignment.id);
  };

  const handleStartFocusForAssignment = (assignment: Assignment) => {
    setSelectedAssignmentId(assignment.id);
    const el = document.getElementById('focus-timer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCompleteFocusSession = (assignmentId: string, _minutesLogged: number) => {
    setAssignments((prev) =>
      prev.map((asn) => {
        if (asn.id !== assignmentId) return asn;
        const firstIncompleteIdx = asn.subtasks.findIndex((s) => !s.completed);
        if (firstIncompleteIdx === -1) return asn;
        const nextSubtasks = [...asn.subtasks];
        nextSubtasks[firstIncompleteIdx] = {
          ...nextSubtasks[firstIncompleteIdx],
          completed: true,
        };
        return {
          ...asn,
          subtasks: nextSubtasks,
          status: 'in_progress',
        };
      })
    );
  };

  const activeFocusAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) || assignments[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            LuminAI Studio
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#planner-workspace"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Study Planner
            </a>
            <a
              href="#aiml-lab"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Flashcard AI
            </a>
            <a
              href="#grade-predictor"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Grade Predictor
            </a>
            <a
              href="#focus-timer"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Focus Timer
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="btn-3d-primary px-4 py-2 text-xs font-medium text-white rounded-xl cursor-pointer whitespace-nowrap shrink-0"
            >
              New Assignment
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1">
        <HeroSpatialStage
          assignments={assignments}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onSelectAssignment={(id) => {
            setSelectedAssignmentId(id);
            const el = document.getElementById(`assignment-${id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          onJumpToPlanner={() => {
            const el = document.getElementById('planner-workspace');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <StudyPlannerWorkspace
          assignments={assignments}
          selectedAssignmentId={selectedAssignmentId}
          onToggleSubtask={handleToggleSubtask}
          onUpdateStatus={handleUpdateStatus}
          onDeleteAssignment={handleDeleteAssignment}
          onAddSubtasks={handleAddSubtasks}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onStartFocusForAssignment={handleStartFocusForAssignment}
        />

        <AimlStudentLab />

        <FocusSessionSection
          activeAssignment={activeFocusAssignment}
          assignments={assignments}
          onSelectAssignment={(a) => setSelectedAssignmentId(a.id)}
          onCompleteSession={handleCompleteFocusSession}
        />
      </main>

      {/* Quiet Academic Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-6 mt-12">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            LuminAI Academic Workspace · AIML Mini-Project for School &amp; College Students
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setAssignments(INITIAL_ASSIGNMENTS);
              }}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Reset Demo Assignments
            </button>
          </div>
        </div>
      </footer>

      {/* New Assignment Modal */}
      <NewAssignmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateAssignment={handleCreateAssignment}
      />
    </div>
  );
}
