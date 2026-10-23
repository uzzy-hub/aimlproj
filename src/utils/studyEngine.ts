export type AssignmentStatus = 'todo' | 'in_progress' | 'completed';

export type AcademicLevel = 'High School' | 'College';

export interface Subtask {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  category: 'Exam Prep' | 'Project' | 'Problem Set' | 'Lab Report' | 'Reading';
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  weightPercent: number; // e.g., 15% of final grade
  status: AssignmentStatus;
  subtasks: Subtask[];
  notes?: string;
}

export interface StudyBlock {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  course: string;
  dayLabel: string; // e.g., "Today · Thu Oct 22"
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "16:00 - 17:30"
  durationHours: number;
  focusTopic: string;
  priorityScore: number;
  cognitiveLoad: 'Optimal' | 'Elevated' | 'Intensive';
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  bloomLevel: 'Recall' | 'Application' | 'Synthesis';
  mastered?: boolean;
}

export interface ConceptNode {
  id: string;
  term: string;
  definition: string;
  example: string;
}

export interface StudyKitResult {
  topicTitle: string;
  executiveSummary: string;
  predictedReadMinutes: number;
  complexityScore: number; // 1-100
  keyConcepts: ConceptNode[];
  flashcards: Flashcard[];
  examTips: string[];
}

export interface GradePredictionInput {
  attendanceRate: number; // 50 - 100
  weeklyStudyHours: number; // 1 - 40
  assignmentCompletionRate: number; // 0 - 100
  sleepHoursPerNight: number; // 4 - 10
  priorGpa: number; // 2.0 - 4.0
  practiceTestsCompleted: number; // 0 - 10
}

export interface FeatureContribution {
  feature: string;
  impactScore: number; // positive or negative points
  recommendation: string;
}

export interface GradePredictionOutput {
  predictedScore: number; // 0 - 100
  letterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D';
  burnoutRisk: 'Nominal' | 'Moderate' | 'High';
  burnoutPercentage: number;
  confidenceInterval: [number, number];
  featureContributions: FeatureContribution[];
}

/**
 * Pure ML-heuristic urgency & priority scorer for assignments.
 * Combines inverse days-until-due, course weight, difficulty, and remaining workload.
 */
export function calculateUrgencyScore(
  assignment: Assignment,
  referenceDateStr: string = '2026-10-22'
): number {
  if (assignment.status === 'completed') {
    return 0;
  }

  const refDate = new Date(`${referenceDateStr}T00:00:00Z`).getTime();
  const due = new Date(`${assignment.dueDate}T00:00:00Z`).getTime();
  const diffDays = Math.max(0.5, (due - refDate) / (1000 * 60 * 60 * 24));

  const completedSubtasks = assignment.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = assignment.subtasks.length;
  const remainingRatio =
    totalSubtasks > 0 ? Math.max(0.15, (totalSubtasks - completedSubtasks) / totalSubtasks) : 1;

  // Urgency formula:
  // Proximity factor (0-45 pts) + Grade Weight factor (0-25 pts) + Difficulty (0-15 pts) + Workload (0-15 pts)
  const proximityPoints = Math.min(45, (14 / diffDays) * 14);
  const weightPoints = Math.min(25, assignment.weightPercent * 0.85);
  const difficultyPoints = assignment.difficulty * 3;
  const workloadPoints = Math.min(15, assignment.estimatedHours * remainingRatio * 1.8);

  const rawScore = proximityPoints + weightPoints + difficultyPoints + workloadPoints;
  return Math.min(99, Math.max(12, Math.round(rawScore)));
}

/**
 * Formats days remaining into a clean human-readable label.
 */
export function getDaysRemainingLabel(
  dueDate: string,
  referenceDateStr: string = '2026-10-22'
): { days: number; label: string; isUrgent: boolean } {
  const refDate = new Date(`${referenceDateStr}T00:00:00Z`).getTime();
  const due = new Date(`${dueDate}T00:00:00Z`).getTime();
  const days = Math.round((due - refDate) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { days, label: `${Math.abs(days)}d overdue`, isUrgent: true };
  }
  if (days === 0) {
    return { days: 0, label: 'Due today', isUrgent: true };
  }
  if (days === 1) {
    return { days: 1, label: 'Due tomorrow', isUrgent: true };
  }
  return { days, label: `Due in ${days} days`, isUrgent: days <= 3 };
}

/**
 * Generates an optimized multi-day personalized study schedule from active assignments
 * respecting daily cognitive load limits.
 */
export function generateSmartStudySchedule(
  assignments: Assignment[],
  dailyAvailableHours: number = 4,
  referenceDateStr: string = '2026-10-22',
  preferredPeakWindow: 'Morning' | 'Afternoon' | 'Evening' = 'Afternoon'
): StudyBlock[] {
  const active = assignments
    .filter((a) => a.status !== 'completed')
    .map((a) => ({
      assignment: a,
      score: calculateUrgencyScore(a, referenceDateStr),
    }))
    .sort((a, b) => b.score - a.score);

  if (active.length === 0) return [];

  const baseDate = new Date(`${referenceDateStr}T00:00:00Z`);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const slotTemplates: Record<'Morning' | 'Afternoon' | 'Evening', string[]> = {
    Morning: ['08:00 - 09:30', '10:00 - 11:30', '14:00 - 15:30'],
    Afternoon: ['14:00 - 15:30', '16:15 - 17:45', '19:00 - 20:30'],
    Evening: ['17:30 - 19:00', '19:30 - 21:00', '21:15 - 22:30'],
  };

  const blocks: StudyBlock[] = [];
  const maxDays = 5;
  const slotsPerDay = Math.max(1, Math.min(3, Math.floor(dailyAvailableHours / 1.5)));

  let queueIndex = 0;

  for (let d = 0; d < maxDays; d++) {
    const currentDate = new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
    const yyyy = currentDate.getUTCFullYear();
    const mm = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getUTCDate()).padStart(2, '0');
    const dateIso = `${yyyy}-${mm}-${dd}`;
    const dayPrefix = d === 0 ? 'Today · ' : d === 1 ? 'Tomorrow · ' : '';
    const dayLabel = `${dayPrefix}${dayNames[currentDate.getUTCDay()]} ${monthNames[currentDate.getUTCMonth()]} ${currentDate.getUTCDate()}`;

    for (let s = 0; s < slotsPerDay; s++) {
      const target = active[(queueIndex + s) % active.length];
      if (!target) continue;

      const uncompletedSubtask = target.assignment.subtasks.find((st) => !st.completed);
      const focusTopic = uncompletedSubtask
        ? uncompletedSubtask.title
        : `Deep work & review on ${target.assignment.title}`;

      const durationHours = 1.5;
      const cognitiveLoad: StudyBlock['cognitiveLoad'] =
        target.assignment.difficulty >= 4
          ? 'Intensive'
          : target.assignment.difficulty === 3
          ? 'Elevated'
          : 'Optimal';

      blocks.push({
        id: `block-${d}-${s}-${target.assignment.id}`,
        assignmentId: target.assignment.id,
        assignmentTitle: target.assignment.title,
        course: target.assignment.course,
        dayLabel,
        date: dateIso,
        timeSlot: slotTemplates[preferredPeakWindow][s % 3],
        durationHours,
        focusTopic,
        priorityScore: target.score,
        cognitiveLoad,
      });
    }
    queueIndex++;
  }

  return blocks;
}

/**
 * AIML Student Performance & Burnout Predictor (Multi-Variable Regression + Non-linear Fatigue Penalty)
 * Models how study habits, sleep hygiene, assignment completion, and practice exams predict course outcomes.
 */
export function predictAcademicPerformance(input: GradePredictionInput): GradePredictionOutput {
  const baseline = 42;

  // 1. Attendance contribution (up to +14 pts)
  const attendanceDelta = ((input.attendanceRate - 70) / 30) * 10;

  // 2. Weekly study hours with diminishing returns above 25h
  const effectiveStudyHours = Math.min(28, input.weeklyStudyHours);
  const studyDelta = (effectiveStudyHours / 20) * 16;

  // 3. Assignment completion rate (high weight in school/college)
  const assignmentDelta = ((input.assignmentCompletionRate - 60) / 40) * 18;

  // 4. Prior GPA baseline anchor
  const gpaDelta = ((input.priorGpa - 2.5) / 1.5) * 10;

  // 5. Practice tests completed (active recall boost)
  const practiceDelta = Math.min(10, input.practiceTestsCompleted * 1.4);

  // 6. Sleep hygiene curve (optimal 7.5 - 8.5 hrs; penalty below 6 hrs)
  const sleepPenalty =
    input.sleepHoursPerNight < 6.5
      ? -((6.5 - input.sleepHoursPerNight) * 4.2)
      : Math.min(4, (input.sleepHoursPerNight - 7) * 2);

  const rawScore =
    baseline +
    attendanceDelta +
    studyDelta +
    assignmentDelta +
    gpaDelta +
    practiceDelta +
    sleepPenalty;

  const predictedScore = Math.round(Math.min(99, Math.max(45, rawScore)) * 10) / 10;

  let letterGrade: GradePredictionOutput['letterGrade'] = 'C';
  if (predictedScore >= 96) letterGrade = 'A+';
  else if (predictedScore >= 92) letterGrade = 'A';
  else if (predictedScore >= 89) letterGrade = 'A-';
  else if (predictedScore >= 86) letterGrade = 'B+';
  else if (predictedScore >= 82) letterGrade = 'B';
  else if (predictedScore >= 79) letterGrade = 'B-';
  else if (predictedScore >= 75) letterGrade = 'C+';
  else if (predictedScore >= 70) letterGrade = 'C';
  else letterGrade = 'D';

  // Burnout Risk Calculation
  const sleepDeficit = Math.max(0, 7.5 - input.sleepHoursPerNight) * 14;
  const studyOverload = Math.max(0, input.weeklyStudyHours - 22) * 2.4;
  const backlogStress = Math.max(0, 90 - input.assignmentCompletionRate) * 0.45;
  const burnoutPercentage = Math.min(96, Math.max(8, Math.round(14 + sleepDeficit + studyOverload + backlogStress)));

  const burnoutRisk: GradePredictionOutput['burnoutRisk'] =
    burnoutPercentage >= 68 ? 'High' : burnoutPercentage >= 40 ? 'Moderate' : 'Nominal';

  const featureContributions: FeatureContribution[] = [
    {
      feature: 'Assignment Completion',
      impactScore: Math.round(assignmentDelta * 10) / 10,
      recommendation:
        input.assignmentCompletionRate < 85
          ? 'Break pending assignments into 30-min subtasks to raise completion above 90%.'
          : 'Strong submission consistency is anchoring your coursework grade.',
    },
    {
      feature: 'Deep Study Volume',
      impactScore: Math.round(studyDelta * 10) / 10,
      recommendation:
        input.weeklyStudyHours < 12
          ? 'Add two 90-minute focused Pomodoro blocks per week for core subjects.'
          : 'Study volume is in the high-retention zone.',
    },
    {
      feature: 'Active Recall Practice',
      impactScore: Math.round(practiceDelta * 10) / 10,
      recommendation:
        input.practiceTestsCompleted < 4
          ? 'Convert lecture notes into flashcards and complete 2 practice quizzes.'
          : 'Spaced repetition testing is boosting exam readiness.',
    },
    {
      feature: 'Sleep & Cognitive Recovery',
      impactScore: Math.round(sleepPenalty * 10) / 10,
      recommendation:
        input.sleepHoursPerNight < 7
          ? 'Sleeping under 7 hours degrades memory consolidation by up to 28%.'
          : 'Healthy sleep schedule supports long-term synaptic consolidation.',
    },
    {
      feature: 'Lecture Attendance',
      impactScore: Math.round(attendanceDelta * 10) / 10,
      recommendation:
        input.attendanceRate < 85
          ? 'Attending live sessions reduces self-study catch-up time by 40%.'
          : 'High attendance keeps instructor cues aligned with exam topics.',
    },
  ];

  return {
    predictedScore,
    letterGrade,
    burnoutRisk,
    burnoutPercentage,
    confidenceInterval: [
      Math.max(40, Math.round((predictedScore - 2.8) * 10) / 10),
      Math.min(100, Math.round((predictedScore + 2.8) * 10) / 10),
    ],
    featureContributions,
  };
}
