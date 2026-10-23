import type { Assignment, StudyKitResult } from '../utils/studyEngine';

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asn-101',
    title: 'Convolutional Neural Networks & Image Classification Lab',
    course: 'CS-301 · Intro to AI & Machine Learning',
    category: 'Lab Report',
    dueDate: '2026-10-23',
    estimatedHours: 4.5,
    difficulty: 4,
    weightPercent: 18,
    status: 'in_progress',
    subtasks: [
      { id: 'st-1', title: 'Preprocess CIFAR-10 dataset & normalization pipeline', durationMinutes: 40, completed: true },
      { id: 'st-2', title: 'Train 3-layer Conv2D architecture with BatchNorm & Dropout', durationMinutes: 55, completed: true },
      { id: 'st-3', title: 'Plot confusion matrix & analyze overfitting curves in report', durationMinutes: 45, completed: false },
      { id: 'st-4', title: 'Export final Jupyter Notebook & PDF lab summary', durationMinutes: 30, completed: false },
    ],
    notes: 'Compare ReLU vs GELU activation accuracy across 25 epochs.',
  },
  {
    id: 'asn-102',
    title: 'Multivariable Calculus: Lagrange Multipliers Problem Set',
    course: 'MATH-204 · Vector Calculus',
    category: 'Problem Set',
    dueDate: '2026-10-24',
    estimatedHours: 3.0,
    difficulty: 4,
    weightPercent: 12,
    status: 'todo',
    subtasks: [
      { id: 'st-5', title: 'Solve constrained optimization problems #1–6', durationMinutes: 50, completed: false },
      { id: 'st-6', title: 'Sketch 3D contour gradient vectors & tangent planes', durationMinutes: 45, completed: false },
      { id: 'st-7', title: 'Verify Hessian matrix boundary conditions', durationMinutes: 35, completed: false },
    ],
    notes: 'Show full partial derivative steps for full rubric credit.',
  },
  {
    id: 'asn-103',
    title: 'Cellular Respiration & Bohr Effect Kinetics Essay',
    course: 'BIO-110 · Molecular Biology',
    category: 'Project',
    dueDate: '2026-10-26',
    estimatedHours: 3.5,
    difficulty: 3,
    weightPercent: 15,
    status: 'in_progress',
    subtasks: [
      { id: 'st-8', title: 'Synthesize 5 peer-reviewed papers on hemoglobin allostery', durationMinutes: 45, completed: true },
      { id: 'st-9', title: 'Draft oxygen dissociation curve shift analysis section', durationMinutes: 50, completed: false },
      { id: 'st-10', title: 'Format APA 7th citations & abstract proofread', durationMinutes: 30, completed: false },
    ],
    notes: 'Include quantitative pH 7.4 vs pH 7.2 P50 torr comparison.',
  },
  {
    id: 'asn-104',
    title: 'Data Structures Midterm: Trees, Heaps & Graph Traversal',
    course: 'CS-202 · Algorithms & Data Structures',
    category: 'Exam Prep',
    dueDate: '2026-10-28',
    estimatedHours: 6.0,
    difficulty: 5,
    weightPercent: 25,
    status: 'todo',
    subtasks: [
      { id: 'st-11', title: 'Review AVL tree rotations & Red-Black invariants', durationMinutes: 60, completed: false },
      { id: 'st-12', title: 'Trace Dijkstra & A* shortest-path time complexity', durationMinutes: 55, completed: false },
      { id: 'st-13', title: 'Complete Fall 2025 timed practice exam paper', durationMinutes: 75, completed: false },
    ],
    notes: 'Closed-book exam; focus on recurrence relations and Big-O proofs.',
  },
  {
    id: 'asn-105',
    title: 'Macroeconomics Policy Brief: Inflation & Monetary Transmission',
    course: 'ECON-102 · Principles of Macroeconomics',
    category: 'Reading',
    dueDate: '2026-10-21',
    estimatedHours: 2.0,
    difficulty: 2,
    weightPercent: 8,
    status: 'completed',
    subtasks: [
      { id: 'st-14', title: 'Annotate Federal Reserve FOMC minutes excerpt', durationMinutes: 40, completed: true },
      { id: 'st-15', title: 'Submit 600-word Taylor Rule reflection on portal', durationMinutes: 45, completed: true },
    ],
    notes: 'Submitted ahead of schedule.',
  },
];

export const SAMPLE_STUDY_KITS: Record<string, StudyKitResult> = {
  aiml_backprop: {
    topicTitle: 'Neural Networks: Gradient Descent & Backpropagation',
    executiveSummary:
      'Backpropagation computes the gradient of the loss function with respect to each weight by applying the chain rule layer-by-layer from the output back to the input. Combined with stochastic gradient descent (SGD) or Adam, it enables deep networks to minimize empirical risk across high-dimensional parameter spaces.',
    predictedReadMinutes: 6,
    complexityScore: 78,
    keyConcepts: [
      {
        id: 'kc-1',
        term: 'Chain Rule in Computational Graphs',
        definition:
          'Decomposes partial derivatives of composite functions into local gradients multiplied along backward paths.',
        example: '∂L/∂w₁ = (∂L/∂y) · (∂y/∂h) · (∂h/∂w₁)',
      },
      {
        id: 'kc-2',
        term: 'Vanishing Gradient Problem',
        definition:
          'When sigmoid or tanh derivatives (< 0.25) are multiplied across many layers, early layer gradients shrink exponentially toward zero.',
        example: 'Using ReLU f(x) = max(0, x) preserves a gradient of 1 for positive activations.',
      },
      {
        id: 'kc-3',
        term: 'Learning Rate (η) & Convergence',
        definition:
          'Hyperparameter controlling step size along the negative gradient direction.',
        example: 'Too high η causes divergence oscillation; too low η traps training in plateaus.',
      },
    ],
    flashcards: [
      {
        id: 'fc-1',
        question: 'Why do we zero out gradients before each backward pass in PyTorch?',
        answer:
          'Because backward() accumulates gradients into existing tensor buffers by default; failing to reset mixes gradients from previous mini-batches.',
        bloomLevel: 'Application',
      },
      {
        id: 'fc-2',
        question: 'What is the derivative of the Sigmoid function σ(z) in terms of σ(z)?',
        answer: 'σ′(z) = σ(z) · (1 − σ(z)), which reaches a maximum value of 0.25 at z = 0.',
        bloomLevel: 'Recall',
      },
      {
        id: 'fc-3',
        question: 'How does Batch Normalization accelerate deep neural network training?',
        answer:
          'It normalizes layer activations to zero mean and unit variance per mini-batch, smoothing the loss landscape and allowing higher learning rates.',
        bloomLevel: 'Synthesis',
      },
      {
        id: 'fc-4',
        question: 'Compare Batch Gradient Descent, Mini-Batch SGD, and Stochastic Gradient Descent.',
        answer:
          'Batch uses all N samples per step (stable, slow); SGD uses 1 sample (noisy, fast); Mini-Batch uses B samples (e.g., 32–256) balancing GPU vectorization and generalization.',
        bloomLevel: 'Synthesis',
      },
    ],
    examTips: [
      'Always verify matrix dimensions when computing weight gradients: ∂L/∂W has the exact same shape as W.',
      'For exam derivations on Cross-Entropy with Softmax, remember the combined gradient simplifies cleanly to (ŷ − y).',
      'Draw a 2-node computational graph first before writing partial derivative chains.',
    ],
  },
  os_paging: {
    topicTitle: 'Operating Systems: Virtual Memory, Paging & TLB',
    executiveSummary:
      'Virtual memory abstracts physical RAM into a contiguous address space for each process using fixed-size Pages and Page Tables. The Translation Lookaside Buffer (TLB) caches recent virtual-to-physical frame translations in hardware to keep Effective Access Time near single-cycle RAM speeds.',
    predictedReadMinutes: 5,
    complexityScore: 71,
    keyConcepts: [
      {
        id: 'kc-21',
        term: 'Translation Lookaside Buffer (TLB)',
        definition:
          'A fast associative hardware cache storing recent virtual page number (VPN) to physical frame number (PFN) mappings.',
        example: 'EAT = α(t_TLB + t_MEM) + (1 − α)(t_TLB + 2·t_MEM)',
      },
      {
        id: 'kc-22',
        term: 'Page Fault & Demand Paging',
        definition:
          'Trap raised by the MMU when a accessed virtual page is not resident in physical RAM, triggering disk I/O.',
        example: 'LRU (Least Recently Used) evicts the page unused for the longest period.',
      },
      {
        id: 'kc-23',
        term: 'Thrashing',
        definition:
          'State where a system spends more time swapping pages between disk and RAM than executing instructions.',
        example: 'Occurs when Σ Working Set sizes > total available physical frames.',
      },
    ],
    flashcards: [
      {
        id: 'fc-21',
        question: 'If a system has a 32-bit virtual address space and 4 KB page size, how many bits are used for the Page Offset?',
        answer: '12 bits, since 4 KB = 2¹² bytes. The remaining 20 bits represent the Virtual Page Number (VPN).',
        bloomLevel: 'Application',
      },
      {
        id: 'fc-22',
        question: 'What is Belady’s Anomaly in page replacement algorithms?',
        answer:
          'The counter-intuitive phenomenon in FIFO page replacement where increasing the number of physical frames results in MORE page faults.',
        bloomLevel: 'Recall',
      },
      {
        id: 'fc-23',
        question: 'Why are Multi-Level (Hierarchical) Page Tables preferred over a single flat Page Table on 64-bit architectures?',
        answer:
          'A flat page table requires contiguous megabytes/gigabytes per process even for sparse address spaces, whereas multi-level tables only allocate inner nodes for active memory regions.',
        bloomLevel: 'Synthesis',
      },
    ],
    examTips: [
      'Convert all sizes to powers of 2 immediately (1 KB = 2¹⁰, 1 MB = 2²⁰, 1 GB = 2³⁰).',
      'Watch out for microseconds (µs) vs nanoseconds (ns) when computing Effective Access Time (EAT) with page fault rates.',
    ],
  },
};
