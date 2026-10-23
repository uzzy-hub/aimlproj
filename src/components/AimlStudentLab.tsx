import React, { useState } from 'react';
import {
  Sparkles,
  RotateCw,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Brain,
  Award,
} from 'lucide-react';
import {
  predictAcademicPerformance,
  type GradePredictionInput,
  type StudyKitResult,
} from '../utils/studyEngine';
import { SAMPLE_STUDY_KITS } from '../data/seedData';

export const AimlStudentLab: React.FC = () => {
  // Module 1 State: NLP Lecture Notes Summarizer & 3D Flashcard Deck
  const [selectedPreset, setSelectedPreset] = useState<'aiml_backprop' | 'os_paging'>('aiml_backprop');
  const [studyKit, setStudyKit] = useState<StudyKitResult>(SAMPLE_STUDY_KITS.aiml_backprop);
  const [rawNotes, setRawNotes] = useState<string>(
    'Backpropagation computes the gradient of the loss function with respect to each weight by applying the chain rule layer-by-layer from the output back to the input. When sigmoid activations are stacked across deep networks, derivatives smaller than 0.25 multiply together and cause the vanishing gradient problem. Modern architectures mitigate this using ReLU or GELU activations, residual skip connections, and Batch Normalization.'
  );
  const [courseName, setCourseName] = useState<string>('CS-301 Neural Networks');
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});
  const [kitError, setKitError] = useState<string | null>(null);

  // Module 2 State: ML Academic Performance & Burnout Predictor
  const [mlInput, setMlInput] = useState<GradePredictionInput>({
    attendanceRate: 92,
    weeklyStudyHours: 16,
    assignmentCompletionRate: 94,
    sleepHoursPerNight: 7.5,
    priorGpa: 3.6,
    practiceTestsCompleted: 5,
  });

  const prediction = predictAcademicPerformance(mlInput);

  const handleLoadPreset = (key: 'aiml_backprop' | 'os_paging') => {
    setSelectedPreset(key);
    setStudyKit(SAMPLE_STUDY_KITS[key]);
    setFlippedCards({});
    setKitError(null);
    if (key === 'aiml_backprop') {
      setCourseName('CS-301 Neural Networks');
      setRawNotes(
        'Backpropagation computes the gradient of the loss function with respect to each weight by applying the chain rule layer-by-layer from the output back to the input. When sigmoid activations are stacked across deep networks, derivatives smaller than 0.25 multiply together and cause the vanishing gradient problem.'
      );
    } else {
      setCourseName('CS-310 Operating Systems');
      setRawNotes(
        'Virtual memory abstracts physical RAM into a contiguous address space for each process using fixed-size Pages and Page Tables. The Translation Lookaside Buffer (TLB) caches recent virtual-to-physical frame translations in hardware to reduce Effective Access Time.'
      );
    }
  };

  const handleSynthesizeNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawNotes.trim().length < 15) {
      setKitError('Please enter at least 15 characters of lecture notes or textbook concepts.');
      return;
    }
    setKitError(null);
    setIsGeneratingKit(true);
    try {
      const response = await fetch('/api/ai/study-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, courseName }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setKitError(data.error || 'Could not generate study kit.');
      } else if (data.studyKit) {
        setStudyKit(data.studyKit);
        setFlippedCards({});
      }
    } catch {
      setKitError('Network error while contacting the AI study synthesizer.');
    } finally {
      setIsGeneratingKit(false);
    }
  };

  const toggleFlipCard = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="aiml-lab"
      aria-label="AIML Student Utility Toolkit and Grade Predictor"
      className="py-10 border-t border-slate-200/80 max-w-[1280px] mx-auto px-6 space-y-12"
    >
      {/* Part A: NLP Lecture Notes Summarizer & 3D Flip Flashcards */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-medium text-sky-700 mb-1">
              02. NLP Study Synthesizer & 3D Active-Recall Deck
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Convert Lecture Notes into 3D Flashcards & Exam Kits
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Load Sample Topic:</span>
            <button
              type="button"
              onClick={() => handleLoadPreset('aiml_backprop')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPreset === 'aiml_backprop'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Neural Nets & Backprop
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('os_paging')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPreset === 'os_paging'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              OS Virtual Memory
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 5 cols: Note Input Form & Executive Summary */}
          <div className="lg:col-span-5 glass-surface rounded-2xl p-6 space-y-5">
            <form onSubmit={handleSynthesizeNotes} className="space-y-4">
              <div>
                <label
                  htmlFor="nlp-course-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Course / Subject Name
                </label>
                <input
                  id="nlp-course-input"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., CS-301 Intro to Machine Learning"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label
                  htmlFor="nlp-notes-textarea"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Paste Lecture Notes, Syllabus Topic, or Textbook Excerpt
                </label>
                <textarea
                  id="nlp-notes-textarea"
                  rows={5}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="Paste your raw class notes here to extract key concepts and 3D active recall flashcards..."
                  className="w-full p-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed focus:outline-none focus:border-sky-500"
                />
              </div>

              {kitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{kitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingKit}
                className="w-full btn-3d-primary text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingKit
                  ? 'Synthesizing Study Kit & Flashcards...'
                  : 'Generate AI Summary & 3D Flashcards'}
              </button>
            </form>

            {/* Executive Summary Output */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  Synthesized Concept Brief
                </span>
                <span className="font-mono tabular-nums">
                  {studyKit.predictedReadMinutes} min review · Complexity {studyKit.complexityScore}/100
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-slate-900">
                {studyKit.topicTitle}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed bg-white/90 p-3.5 rounded-xl border border-slate-200/70">
                {studyKit.executiveSummary}
              </p>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-slate-800">Key Extracted Definitions</div>
                {studyKit.keyConcepts.map((kc) => (
                  <div
                    key={kc.id}
                    className="p-3 rounded-xl bg-white/80 border border-slate-200/70 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-900">{kc.term}</div>
                    <div className="text-slate-600">{kc.definition}</div>
                    <div className="font-mono text-[11px] text-sky-700 pt-0.5">{kc.example}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 cols: Interactive 3D Perspective Flashcards Grid */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Interactive 3D Active-Recall Cards
                </h3>
                <p className="text-xs text-slate-500">
                  Click any card to flip in 3D space and reveal the synthesized answer.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-600 tabular-nums">
                Mastered: {Object.values(masteredCards).filter(Boolean).length} /{' '}
                {studyKit.flashcards.length}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studyKit.flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[card.id];
                const isMastered = !!masteredCards[card.id];

                return (
                  <article
                    key={card.id}
                    style={{ perspective: '1000px' }}
                    className="h-56"
                  >
                    <div
                      onClick={() => toggleFlipCard(card.id)}
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateX(4deg) translateY(-2px)' : 'rotateX(0deg)',
                      }}
                      className={`w-full h-full rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${
                        isFlipped
                          ? 'bg-gradient-to-br from-sky-50/95 via-white to-emerald-50/90 border-2 border-sky-300 shadow-lg'
                          : 'glass-surface card-3d-elevation'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Card 0{idx + 1} · {card.bloomLevel}
                          {isFlipped ? ' · Answer' : ' · Question'}
                        </span>
                        <button
                          type="button"
                          aria-label={`Flip Flashcard ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlipCard(card.id);
                          }}
                          className="flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          {isFlipped ? 'Show Question' : 'Flip 3D'}
                        </button>
                      </div>

                      <div className="my-auto py-2">
                        {!isFlipped ? (
                          <p className="font-display font-semibold text-sm text-slate-900 leading-snug">
                            {card.question}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {card.answer}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {isFlipped ? 'Showing verified solution' : 'Click card to reveal answer'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleMastered(card.id, e)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isMastered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isMastered ? '✓ Mastered' : 'Mark Mastered'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Exam Strategy Checklist */}
            <div className="glass-surface rounded-2xl p-5">
              <div className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-600" />
                High-Yield Exam & Rubric Checkpoints
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {studyKit.examTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono font-semibold text-sky-700">0{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Interactive AIML Student Performance & Burnout Predictor */}
      <div id="grade-predictor" className="pt-8 border-t border-slate-200/80">
        <div className="mb-6">
          <div className="text-xs font-medium text-sky-700 mb-1">
            03. AIML Multi-Variable Academic Performance & Burnout Simulator
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Interactive Grade Forecasting & Feature Importance Lab
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-[70ch]">
            Explore how machine learning regression models student outcomes by adjusting your weekly
            study habits, sleep recovery, attendance, and practice exam frequency in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 6 cols: Interactive Parameter Sliders */}
          <div className="lg:col-span-6 glass-surface rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-600" />
                Student Input Features (Model X-Vector)
              </span>
              <button
                type="button"
                onClick={() =>
                  setMlInput({
                    attendanceRate: 92,
                    weeklyStudyHours: 16,
                    assignmentCompletionRate: 94,
                    sleepHoursPerNight: 7.5,
                    priorGpa: 3.6,
                    practiceTestsCompleted: 5,
                  })
                }
                className="text-xs text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
              >
                Reset Baseline
              </button>
            </div>

            <div className="space-y-4">
              {/* Slider 1: Weekly Deep Study Hours */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ml-study-hours" className="font-medium text-slate-700">
                    Weekly Self-Study Volume
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {mlInput.weeklyStudyHours} hrs / week
                  </span>
                </div>
                <input
                  id="ml-study-hours"
                  type="range"
                  min={2}
                  max={35}
                  step={1}
                  value={mlInput.weeklyStudyHours}
                  onChange={(e) =>
                    setMlInput((prev) => ({
                      ...prev,
                      weeklyStudyHours: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Assignment Completion Rate */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ml-assignment-rate" className="font-medium text-slate-700">
                    On-Time Assignment Completion Rate
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {mlInput.assignmentCompletionRate}%
                  </span>
                </div>
                <input
                  id="ml-assignment-rate"
                  type="range"
                  min={50}
                  max={100}
                  step={2}
                  value={mlInput.assignmentCompletionRate}
                  onChange={(e) =>
                    setMlInput((prev) => ({
                      ...prev,
                      assignmentCompletionRate: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Sleep Hours Per Night */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ml-sleep-hours" className="font-medium text-slate-700">
                    Daily Sleep & Memory Consolidation
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {mlInput.sleepHoursPerNight} hrs / night
                  </span>
                </div>
                <input
                  id="ml-sleep-hours"
                  type="range"
                  min={4.5}
                  max={9.5}
                  step={0.5}
                  value={mlInput.sleepHoursPerNight}
                  onChange={(e) =>
                    setMlInput((prev) => ({
                      ...prev,
                      sleepHoursPerNight: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Class Attendance */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ml-attendance" className="font-medium text-slate-700">
                    Lecture & Lab Attendance Rate
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {mlInput.attendanceRate}%
                  </span>
                </div>
                <input
                  id="ml-attendance"
                  type="range"
                  min={50}
                  max={100}
                  step={2}
                  value={mlInput.attendanceRate}
                  onChange={(e) =>
                    setMlInput((prev) => ({
                      ...prev,
                      attendanceRate: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Practice Exams Completed */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="ml-practice-tests" className="font-medium text-slate-700">
                    Practice Exams / Past Papers Completed
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {mlInput.practiceTestsCompleted} papers
                  </span>
                </div>
                <input
                  id="ml-practice-tests"
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={mlInput.practiceTestsCompleted}
                  onChange={(e) =>
                    setMlInput((prev) => ({
                      ...prev,
                      practiceTestsCompleted: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right 6 cols: Model Output, Burnout Risk & Feature Attribution Bars */}
          <div className="lg:col-span-6 glass-surface rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/95 border border-slate-200/80">
              <div>
                <div className="text-xs text-slate-500 mb-1">Predicted Score</div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {prediction.predictedScore}%
                </div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  95% CI: [{prediction.confidenceInterval[0]}, {prediction.confidenceInterval[1]}]
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Projected Grade</div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-sky-600">
                  {prediction.letterGrade}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Coursework Trajectory</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Cognitive Burnout</div>
                <div
                  className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums ${
                    prediction.burnoutRisk === 'Nominal'
                      ? 'text-emerald-600'
                      : prediction.burnoutRisk === 'Moderate'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {prediction.burnoutPercentage}%
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                  State: {prediction.burnoutRisk}
                </div>
              </div>
            </div>

            {/* Feature Importance Attribution */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-sky-600" />
                Feature Attribution & Actionable Habit Diagnostics
              </div>

              {prediction.featureContributions.map((fc) => {
                const isPositive = fc.impactScore >= 0;
                const barWidth = Math.min(100, Math.max(8, Math.abs(fc.impactScore) * 5.5));
                return (
                  <div
                    key={fc.feature}
                    className="p-3 rounded-xl bg-white/85 border border-slate-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{fc.feature}</span>
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          isPositive ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${fc.impactScore}` : fc.impactScore} pts
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          isPositive ? 'bg-sky-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600">{fc.recommendation}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Explainable ML Feature Weights
              </span>
              <span className="font-mono tabular-nums">Update latency &lt; 10ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
