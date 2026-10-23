import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUrgencyScore,
  getDaysRemainingLabel,
  generateSmartStudySchedule,
  predictAcademicPerformance,
  type Assignment,
} from './studyEngine';

const sampleAssignment: Assignment = {
  id: 'a1',
  title: 'Neural Networks Backpropagation Lab',
  course: 'CS-301 Intro to AIML',
  category: 'Lab Report',
  dueDate: '2026-10-24',
  estimatedHours: 5,
  difficulty: 4,
  weightPercent: 20,
  status: 'in_progress',
  subtasks: [
    { id: 's1', title: 'Implement forward pass in NumPy', durationMinutes: 45, completed: true },
    { id: 's2', title: 'Derive gradient descent weight updates', durationMinutes: 60, completed: false },
  ],
};

test('calculateUrgencyScore computes higher priority for imminent high-weight assignments', () => {
  const urgentScore = calculateUrgencyScore(sampleAssignment, '2026-10-22');
  const distantAssignment: Assignment = {
    ...sampleAssignment,
    id: 'a2',
    dueDate: '2026-11-15',
    weightPercent: 5,
    difficulty: 2,
  };
  const distantScore = calculateUrgencyScore(distantAssignment, '2026-10-22');

  assert.ok(urgentScore > distantScore, `Expected ${urgentScore} > ${distantScore}`);
  assert.equal(calculateUrgencyScore({ ...sampleAssignment, status: 'completed' }, '2026-10-22'), 0);
});

test('getDaysRemainingLabel returns accurate relative deadline descriptions', () => {
  const dueToday = getDaysRemainingLabel('2026-10-22', '2026-10-22');
  assert.equal(dueToday.label, 'Due today');
  assert.equal(dueToday.isUrgent, true);

  const dueIn5 = getDaysRemainingLabel('2026-10-27', '2026-10-22');
  assert.equal(dueIn5.days, 5);
  assert.equal(dueIn5.isUrgent, false);
});

test('generateSmartStudySchedule allocates time blocks ordered by priority', () => {
  const schedule = generateSmartStudySchedule([sampleAssignment], 3, '2026-10-22', 'Afternoon');
  assert.ok(schedule.length > 0);
  assert.equal(schedule[0].assignmentId, 'a1');
  assert.equal(schedule[0].focusTopic, 'Derive gradient descent weight updates');
});

test('predictAcademicPerformance models positive impact of study habits and sleep penalty', () => {
  const highPerformer = predictAcademicPerformance({
    attendanceRate: 95,
    weeklyStudyHours: 18,
    assignmentCompletionRate: 96,
    sleepHoursPerNight: 7.8,
    priorGpa: 3.7,
    practiceTestsCompleted: 6,
  });

  const sleepDeprived = predictAcademicPerformance({
    attendanceRate: 72,
    weeklyStudyHours: 8,
    assignmentCompletionRate: 65,
    sleepHoursPerNight: 4.5,
    priorGpa: 2.8,
    practiceTestsCompleted: 1,
  });

  assert.ok(highPerformer.predictedScore > sleepDeprived.predictedScore);
  assert.equal(highPerformer.burnoutRisk, 'Nominal');
  assert.ok(sleepDeprived.burnoutPercentage > highPerformer.burnoutPercentage);
});
