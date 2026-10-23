import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = 3000;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. AI Assignment Subtask & Study Strategy Decomposer
  app.post('/api/ai/decompose-assignment', async (req, res) => {
    const { title, course, category, estimatedHours, difficulty } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: 'Assignment title is required.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Deterministic intelligent AIML fallback when no API key is configured
      return res.json({
        source: 'heuristic_engine',
        subtasks: [
          {
            id: `st-${Date.now()}-1`,
            title: `Scope rubric requirements & gather core references for ${title}`,
            durationMinutes: Math.max(25, Math.round((estimatedHours || 3) * 15)),
            completed: false,
          },
          {
            id: `st-${Date.now()}-2`,
            title: `Complete primary problem-solving / implementation draft (${course || 'Coursework'})`,
            durationMinutes: Math.max(45, Math.round((estimatedHours || 3) * 25)),
            completed: false,
          },
          {
            id: `st-${Date.now()}-3`,
            title: `Verify edge cases, citations & self-grade against ${category || 'Assignment'} checklist`,
            durationMinutes: Math.max(25, Math.round((estimatedHours || 3) * 15)),
            completed: false,
          },
        ],
        aiAdvice: `Split this Difficulty ${difficulty || 3}/5 task across at least 2 separate days to leverage spaced consolidation.`,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Break down the following student assignment into 3 to 4 concrete, actionable study subtasks with realistic durations in minutes, plus a 1-sentence study tip.
Assignment Title: ${title}
Course: ${course || 'General Studies'}
Category: ${category || 'Project'}
Estimated Total Hours: ${estimatedHours || 3}
Difficulty (1-5): ${difficulty || 3}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                  },
                  required: ['title', 'durationMinutes'],
                },
              },
              aiAdvice: { type: Type.STRING },
            },
            required: ['subtasks', 'aiAdvice'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const subtasks = (parsed.subtasks || []).map((st: { title: string; durationMinutes: number }, idx: number) => ({
        id: `st-${Date.now()}-${idx}`,
        title: st.title,
        durationMinutes: st.durationMinutes || 35,
        completed: false,
      }));

      return res.json({
        source: 'gemini',
        subtasks,
        aiAdvice: parsed.aiAdvice || 'Start with the highest-uncertainty milestone during your peak energy window.',
      });
    } catch (error) {
      return res.json({
        source: 'heuristic_fallback',
        subtasks: [
          {
            id: `st-${Date.now()}-1`,
            title: `Outline core concepts & requirements for ${title}`,
            durationMinutes: 35,
            completed: false,
          },
          {
            id: `st-${Date.now()}-2`,
            title: `Execute main draft / problem set calculations`,
            durationMinutes: 55,
            completed: false,
          },
          {
            id: `st-${Date.now()}-3`,
            title: `Final review, formatting & submission check`,
            durationMinutes: 30,
            completed: false,
          },
        ],
        aiAdvice: 'Tackle the core analytical work first before spending time on formatting.',
      });
    }
  });

  // 2. AI NLP Lecture Notes Summarizer & Flashcard Generator
  app.post('/api/ai/study-kit', async (req, res) => {
    const { rawNotes, courseName } = req.body || {};
    if (!rawNotes || typeof rawNotes !== 'string' || rawNotes.trim().length < 15) {
      return res.status(400).json({ error: 'Please provide at least a paragraph of lecture notes or topic text.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Deterministic local NLP extraction when API key is not configured
      const sentences = rawNotes
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20);
      const words = rawNotes.trim().split(/\s+/).length;
      const firstLine = rawNotes.trim().split('\n')[0].slice(0, 65);

      return res.json({
        source: 'local_nlp',
        studyKit: {
          topicTitle: courseName ? `${courseName}: ${firstLine}` : `Synthesized Study Notes: ${firstLine}`,
          executiveSummary:
            sentences.slice(0, 2).join(' ') ||
            rawNotes.slice(0, 240) + (rawNotes.length > 240 ? '...' : ''),
          predictedReadMinutes: Math.max(2, Math.ceil(words / 130)),
          complexityScore: Math.min(92, Math.max(48, Math.round(words / 3))),
          keyConcepts: [
            {
              id: `kc-${Date.now()}-1`,
              term: 'Primary Mechanism & Definition',
              definition: sentences[0] || 'Core foundational principle extracted from your lecture text.',
              example: sentences[1] || 'Applied directly in problem sets and analytical derivations.',
            },
            {
              id: `kc-${Date.now()}-2`,
              term: 'System Constraints & Edge Cases',
              definition: sentences[2] || 'Key boundary condition governing system behavior under load.',
              example: 'Compare baseline assumptions vs real-world empirical performance.',
            },
          ],
          flashcards: [
            {
              id: `fc-${Date.now()}-1`,
              question: `What is the central thesis or mechanism described in "${firstLine}"?`,
              answer: sentences[0] || rawNotes.slice(0, 160),
              bloomLevel: 'Recall',
            },
            {
              id: `fc-${Date.now()}-2`,
              question: 'How is this concept applied when solving exam or lab problems?',
              answer: sentences[1] || 'Identify input variables, apply the governing formula, and verify boundary units.',
              bloomLevel: 'Application',
            },
            {
              id: `fc-${Date.now()}-3`,
              question: 'What trade-off or limitation must be considered in advanced scenarios?',
              answer: sentences[2] || 'Balancing computational/system overhead against accuracy and stability.',
              bloomLevel: 'Synthesis',
            },
          ],
          examTips: [
            'Write out the governing definition and variable units before substituting numbers.',
            'Test your understanding by explaining the first concept card aloud without looking at the back.',
          ],
        },
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an academic AIML study assistant for school and college students. Analyze the following raw lecture notes or textbook excerpt and generate a structured Study Kit with an executive summary, key concepts, active-recall flashcards tagged by Bloom's taxonomy level ('Recall', 'Application', or 'Synthesis'), and concrete exam tips.

Course Context: ${courseName || 'General Academic Course'}
Raw Notes:
${rawNotes}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicTitle: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              predictedReadMinutes: { type: Type.INTEGER },
              complexityScore: { type: Type.INTEGER },
              keyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ['term', 'definition', 'example'],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    bloomLevel: { type: Type.STRING },
                  },
                  required: ['question', 'answer', 'bloomLevel'],
                },
              },
              examTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'topicTitle',
              'executiveSummary',
              'predictedReadMinutes',
              'complexityScore',
              'keyConcepts',
              'flashcards',
              'examTips',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({
        source: 'gemini',
        studyKit: {
          topicTitle: parsed.topicTitle || 'Generated Study Kit',
          executiveSummary: parsed.executiveSummary || '',
          predictedReadMinutes: parsed.predictedReadMinutes || 5,
          complexityScore: parsed.complexityScore || 70,
          keyConcepts: (parsed.keyConcepts || []).map((c: any, i: number) => ({
            id: `kc-${Date.now()}-${i}`,
            term: c.term,
            definition: c.definition,
            example: c.example,
          })),
          flashcards: (parsed.flashcards || []).map((f: any, i: number) => ({
            id: `fc-${Date.now()}-${i}`,
            question: f.question,
            answer: f.answer,
            bloomLevel:
              f.bloomLevel === 'Recall' || f.bloomLevel === 'Application' || f.bloomLevel === 'Synthesis'
                ? f.bloomLevel
                : 'Application',
          })),
          examTips: parsed.examTips || [],
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to synthesize study kit. Please try again.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuminAI server listening at http://localhost:${PORT}`);
  });
}

startServer();
