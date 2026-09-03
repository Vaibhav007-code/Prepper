// The complete syllabus data — seeded into Supabase on first run
// This is the single source of truth for curriculum structure

export const SYLLABUS = [
  {
    code: '01', title: 'DSA', description: 'Become capable of solving common SWE interview problems without depending on memorized solutions.', icon: 'Brain', color: '#6366f1', order_index: 1,
    phases: [
      {
        code: 'A', title: 'Foundations', order_index: 1,
        groups: [
          { code: 'A1', title: 'Complexity', order_index: 1, topics: ['Big-O', 'Time complexity', 'Space complexity', 'Amortized intuition', 'Analyzing nested loops', 'Recursion complexity'] },
          { code: 'A2', title: 'Arrays', order_index: 2, topics: ['Traversal', 'Min/max', 'Frequency', 'Prefix sum', 'Difference array', 'Kadane', 'Subarrays', 'Sorting-based problems', 'In-place manipulation'] },
          { code: 'A3', title: 'Hashing', order_index: 3, topics: ['HashMap', 'HashSet', 'Frequency maps', 'Complement lookup', 'Grouping', 'Prefix sum + hashmap'] },
          { code: 'A4', title: 'Strings', order_index: 4, topics: ['Character frequency', 'Anagrams', 'Palindromes', 'String traversal', 'Hashing', 'Substrings/subsequences'] },
        ]
      },
      {
        code: 'B', title: 'Core Patterns', order_index: 2,
        groups: [
          { code: 'B1', title: 'Two Pointers', order_index: 1, topics: ['Opposite direction', 'Same direction', 'Sorted arrays', 'Pair problems', '3Sum-style problems'] },
          { code: 'B2', title: 'Sliding Window', order_index: 2, topics: ['Fixed window', 'Variable window', 'Frequency window', 'Longest window', 'Smallest window', 'At-most-K'] },
          { code: 'B3', title: 'Binary Search', order_index: 3, topics: ['Standard', 'First/last occurrence', 'Lower/upper bound', 'Rotated array', 'Peak', 'Binary search on answer'] },
        ]
      },
      {
        code: 'C', title: 'Data Structures', order_index: 3,
        groups: [
          { code: 'C1', title: 'Linked List', order_index: 1, topics: ['Traversal', 'Reverse', 'Middle', 'Cycle', 'Merge', 'Intersection', 'Remove Nth', 'Palindrome', 'Fast/slow pointers'] },
          { code: 'C2', title: 'Stack', order_index: 2, topics: ['Stack implementation', 'Parentheses', 'Monotonic stack', 'Next greater/smaller', 'Min stack'] },
          { code: 'C3', title: 'Queue/Deque', order_index: 3, topics: ['Queue', 'Deque', 'Circular queue', 'Sliding window maximum'] },
          { code: 'C4', title: 'Heap', order_index: 4, topics: ['Min/max heap', 'Priority queue', 'Top K', 'Kth largest/smallest', 'Merge K lists', 'Median'] },
        ]
      },
      {
        code: 'D', title: 'Trees & Graphs', order_index: 4,
        groups: [
          { code: 'D1', title: 'Trees', order_index: 1, topics: ['Binary tree representation', 'DFS', 'BFS', 'Preorder', 'Inorder', 'Postorder', 'Level order', 'Height', 'Diameter', 'Balanced tree', 'Path problems', 'LCA'] },
          { code: 'D2', title: 'BST', order_index: 2, topics: ['Search', 'Insert', 'Delete', 'Validate BST', 'Kth smallest', 'LCA BST'] },
          { code: 'D3', title: 'Graphs', order_index: 3, topics: ['Adjacency matrix/list', 'BFS', 'DFS', 'Components', 'Cycle detection', 'Bipartite', 'Topological sort', 'DAG', 'Shortest path', 'Dijkstra', 'Union-Find', 'MST basics'] },
        ]
      },
      {
        code: 'E', title: 'Recursion / Backtracking', order_index: 5,
        groups: [
          { code: 'E1', title: 'Recursion & Backtracking', order_index: 1, topics: ['Recursion tree', 'Base/recursive cases', 'Subsequences', 'Subsets', 'Permutations', 'Combinations', 'Combination Sum', 'N-Queens', 'Backtracking state'] },
        ]
      },
      {
        code: 'F', title: 'Dynamic Programming', order_index: 6,
        groups: [
          { code: 'F1', title: 'DP Fundamentals', order_index: 1, topics: ['Memoization', 'Tabulation', '1D DP', 'Fibonacci', 'Climbing stairs', 'House robber'] },
          { code: 'F2', title: 'DP Advanced', order_index: 2, topics: ['Grid DP', 'Knapsack', 'Subset sum', 'Partition', 'LIS', 'LCS', 'String DP'] },
        ]
      },
    ]
  },
  {
    code: '02', title: 'JavaScript', description: 'Master the language that powers the web — from fundamentals to advanced runtime concepts.', icon: 'Code2', color: '#f59e0b', order_index: 2,
    phases: [
      {
        code: 'A', title: 'Fundamentals', order_index: 1,
        groups: [
          { code: 'A1', title: 'Core Language', order_index: 1, topics: ['Variables', 'Scope', 'Hoisting', 'Data types', 'Operators', 'Functions', 'Arrow functions', 'Objects', 'Arrays', 'Destructuring', 'Spread/rest', 'Modules'] },
          { code: 'A2', title: 'Functional JS', order_index: 2, topics: ['map', 'filter', 'reduce', 'forEach', 'find', 'some/every'] },
          { code: 'A3', title: 'Async JS', order_index: 3, topics: ['Callbacks', 'Promises', 'async/await', 'Promise.all', 'Error handling'] },
          { code: 'A4', title: 'Runtime', order_index: 4, topics: ['Call stack', 'Event loop', 'Microtasks/macrotasks', 'Web APIs', 'Node runtime'] },
          { code: 'A5', title: 'Advanced', order_index: 5, topics: ['Closures', 'this', 'Prototypes', 'Classes', 'Memory basics'] },
        ]
      },
    ]
  },
  {
    code: '03', title: 'Frontend', description: 'Build stunning, performant UIs with React and modern web standards.', icon: 'Layers', color: '#06b6d4', order_index: 3,
    phases: [
      {
        code: 'A', title: 'HTML/CSS', order_index: 1,
        groups: [
          { code: 'A1', title: 'HTML & CSS', order_index: 1, topics: ['Semantic HTML', 'Forms', 'Accessibility basics', 'Box model', 'Flexbox', 'Grid', 'Responsive design', 'Positioning'] },
        ]
      },
      {
        code: 'B', title: 'React', order_index: 2,
        groups: [
          { code: 'B1', title: 'Fundamentals', order_index: 1, topics: ['Components', 'Props', 'State', 'Events', 'Conditional rendering', 'Lists'] },
          { code: 'B2', title: 'Hooks', order_index: 2, topics: ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'Custom hooks'] },
          { code: 'B3', title: 'Application', order_index: 3, topics: ['Routing', 'Forms', 'Validation', 'API calls', 'Loading/error states', 'Authentication', 'Protected routes'] },
          { code: 'B4', title: 'Architecture', order_index: 4, topics: ['Component design', 'State management', 'Folder structure', 'Reusable components', 'Separation of concerns'] },
          { code: 'B5', title: 'Performance', order_index: 5, topics: ['Rendering', 'Memoization', 'Lazy loading', 'Code splitting'] },
        ]
      },
    ]
  },
  {
    code: '04', title: 'Backend', description: 'Design, build and deploy production-grade server-side applications.', icon: 'Server', color: '#10b981', order_index: 4,
    phases: [
      {
        code: 'A', title: 'Node.js', order_index: 1,
        groups: [
          { code: 'A1', title: 'Node.js Core', order_index: 1, topics: ['Runtime architecture', 'Event loop', 'Async I/O', 'Modules', 'Environment variables', 'File system basics', 'Streams basics'] },
        ]
      },
      {
        code: 'B', title: 'Express', order_index: 2,
        groups: [
          { code: 'B1', title: 'Express.js', order_index: 1, topics: ['Routing', 'Middleware', 'Controllers', 'Services', 'Validation', 'Error handling'] },
        ]
      },
      {
        code: 'C', title: 'REST APIs', order_index: 3,
        groups: [
          { code: 'C1', title: 'API Design', order_index: 1, topics: ['Request/response lifecycle', 'REST', 'HTTP methods', 'Status codes', 'Pagination', 'Filtering', 'Sorting', 'API versioning', 'Validation', 'Error responses'] },
        ]
      },
      {
        code: 'D', title: 'Auth', order_index: 4,
        groups: [
          { code: 'D1', title: 'Authentication', order_index: 1, topics: ['Password hashing', 'Sessions', 'Cookies', 'JWT', 'Access/refresh tokens'] },
          { code: 'D2', title: 'Authorization', order_index: 2, topics: ['RBAC', 'OAuth concepts'] },
        ]
      },
    ]
  },
  {
    code: '05', title: 'Databases', description: 'Design schemas, write complex queries, and understand database internals.', icon: 'Database', color: '#8b5cf6', order_index: 5,
    phases: [
      {
        code: 'A', title: 'PostgreSQL', order_index: 1,
        groups: [
          { code: 'A1', title: 'SQL Basics', order_index: 1, topics: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOINs', 'Subqueries', 'CTEs', 'Aggregations', 'Window functions'] },
          { code: 'A2', title: 'Database Design', order_index: 2, topics: ['Primary keys', 'Foreign keys', 'Constraints', 'One-to-one', 'One-to-many', 'Many-to-many', 'Normalization'] },
          { code: 'A3', title: 'Performance', order_index: 3, topics: ['Indexes', 'Query plans', 'EXPLAIN', 'Composite indexes', 'Transactions'] },
          { code: 'A4', title: 'Theory', order_index: 4, topics: ['ACID', 'Isolation levels', 'Dirty reads', 'Non-repeatable reads', 'Phantom reads', 'Locks'] },
        ]
      },
      {
        code: 'B', title: 'Redis', order_index: 2,
        groups: [
          { code: 'B1', title: 'Redis Essentials', order_index: 1, topics: ['Key/value', 'TTL', 'Caching', 'Sessions', 'Rate limiting', 'Pub/Sub basics'] },
        ]
      },
    ]
  },
  {
    code: '06', title: 'CS Fundamentals', description: 'OS, memory, processes, and concurrency — the foundation under every application.', icon: 'Cpu', color: '#ef4444', order_index: 6,
    phases: [
      {
        code: 'A', title: 'Operating Systems', order_index: 1,
        groups: [
          { code: 'A1', title: 'Processes', order_index: 1, topics: ['Process', 'PCB', 'Context switching', 'Process states'] },
          { code: 'A2', title: 'Threads', order_index: 2, topics: ['Threads', 'Process vs thread', 'Multithreading', 'Concurrency'] },
          { code: 'A3', title: 'Scheduling', order_index: 3, topics: ['FCFS', 'SJF', 'Round Robin', 'Priority'] },
          { code: 'A4', title: 'Memory', order_index: 4, topics: ['Stack/heap', 'Virtual memory', 'Paging', 'Page faults', 'Memory allocation'] },
          { code: 'A5', title: 'Synchronization', order_index: 5, topics: ['Race conditions', 'Mutex', 'Semaphore', 'Deadlock', 'Deadlock prevention'] },
        ]
      },
    ]
  },
  {
    code: '07', title: 'Computer Networks', description: 'From IP packets to HTTP to WebSockets — understand how the internet actually works.', icon: 'Globe', color: '#0ea5e9', order_index: 7,
    phases: [
      {
        code: 'A', title: 'Foundations', order_index: 1,
        groups: [
          { code: 'A1', title: 'Network Models', order_index: 1, topics: ['OSI model', 'TCP/IP', 'IP', 'MAC', 'Ports'] },
          { code: 'A2', title: 'Transport Layer', order_index: 2, topics: ['TCP', 'UDP', 'Handshake', 'Reliability', 'Flow control', 'Congestion basics'] },
          { code: 'A3', title: 'HTTP', order_index: 3, topics: ['HTTP request', 'HTTP response', 'Methods', 'Status codes', 'Headers', 'Cookies', 'Sessions', 'HTTPS'] },
          { code: 'A4', title: 'Web Infrastructure', order_index: 4, topics: ['DNS', 'TLS', 'CDN', 'Reverse proxy', 'WebSockets', 'REST'] },
        ]
      },
    ]
  },
  {
    code: '08', title: 'OOP & SWE', description: 'Write clean, maintainable, scalable code using solid engineering principles.', icon: 'GitBranch', color: '#f97316', order_index: 8,
    phases: [
      {
        code: 'A', title: 'OOP', order_index: 1,
        groups: [
          { code: 'A1', title: 'OOP Concepts', order_index: 1, topics: ['Class/object', 'Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism', 'Composition'] },
        ]
      },
      {
        code: 'B', title: 'Design Principles', order_index: 2,
        groups: [
          { code: 'B1', title: 'Principles', order_index: 1, topics: ['SOLID', 'Dependency injection', 'Separation of concerns', 'DRY', 'KISS'] },
          { code: 'B2', title: 'Patterns', order_index: 2, topics: ['Factory', 'Strategy', 'Observer', 'Singleton', 'Adapter'] },
        ]
      },
    ]
  },
  {
    code: '09', title: 'System Design', description: 'Architect scalable, reliable distributed systems from first principles.', icon: 'LayoutDashboard', color: '#ec4899', order_index: 9,
    phases: [
      {
        code: 'A', title: 'Foundations', order_index: 1,
        groups: [
          { code: 'A1', title: 'Core Concepts', order_index: 1, topics: ['Client/server', 'Stateless architecture', 'APIs', 'Load balancing', 'Reverse proxies', 'Caching', 'CDN', 'Database scaling'] },
          { code: 'A2', title: 'Data', order_index: 2, topics: ['Replication', 'Read replicas', 'Sharding', 'Indexing', 'SQL vs NoSQL'] },
          { code: 'A3', title: 'Distributed Systems', order_index: 3, topics: ['Message queues', 'Kafka concepts', 'Async processing', 'Event-driven architecture', 'Idempotency', 'Consistency', 'Availability', 'CAP theorem', 'Rate limiting', 'Fault tolerance'] },
        ]
      },
      {
        code: 'B', title: 'Case Studies', order_index: 2,
        groups: [
          { code: 'B1', title: 'System Designs', order_index: 1, topics: ['URL shortener', 'Chat application', 'Notification system', 'File storage system', 'Social-media feed', 'Your own SaaS'] },
        ]
      },
    ]
  },
  {
    code: '10', title: 'AI Engineering', description: 'Build real AI-powered products using LLMs, RAG, and agents.', icon: 'Sparkles', color: '#a855f7', order_index: 10,
    phases: [
      {
        code: 'A', title: 'LLM Fundamentals', order_index: 1,
        groups: [
          { code: 'A1', title: 'LLM Concepts', order_index: 1, topics: ['LLMs', 'Tokens', 'Context window', 'Temperature', 'Sampling', 'Embeddings', 'Transformers — conceptual level'] },
          { code: 'A2', title: 'LLM APIs', order_index: 2, topics: ['API calls', 'Structured output', 'Streaming', 'Function/tool calling', 'Error handling', 'Rate limits', 'Cost management'] },
        ]
      },
      {
        code: 'B', title: 'Prompt Engineering', order_index: 2,
        groups: [
          { code: 'B1', title: 'Prompting', order_index: 1, topics: ['System prompts', 'Few-shot prompting', 'Structured prompting', 'Output constraints', 'Prompt injection awareness'] },
        ]
      },
      {
        code: 'C', title: 'RAG', order_index: 3,
        groups: [
          { code: 'C1', title: 'RAG Pipeline', order_index: 1, topics: ['Chunking strategies', 'Embedding models', 'Similarity search', 'Metadata filtering', 'Retrieval quality', 'RAG failure modes', 'RAG evaluation'] },
        ]
      },
      {
        code: 'D', title: 'AI Agents', order_index: 4,
        groups: [
          { code: 'D1', title: 'Agents', order_index: 1, topics: ['Tool calling', 'Agent loop', 'State', 'Memory', 'Planning', 'Tool selection', 'Guardrails'] },
          { code: 'D2', title: 'Production AI', order_index: 2, topics: ['Evaluation', 'Hallucination handling', 'Logging', 'Observability', 'Caching', 'Cost optimization', 'Prompt injection', 'Rate limiting'] },
        ]
      },
    ]
  },
  {
    code: '11', title: 'Projects', description: 'Build, ship and present real-world projects that demonstrate mastery.', icon: 'Rocket', color: '#14b8a6', order_index: 11,
    phases: [
      {
        code: 'A', title: 'Project 1', order_index: 1,
        groups: [
          { code: 'A1', title: 'SaaS (Hostel Management)', order_index: 1, topics: ['React frontend', 'Node/Express backend', 'PostgreSQL integration', 'Authentication & RBAC', 'REST APIs', 'Deployment', 'Caching layer', 'Background jobs', 'AI feature', 'Proper architecture docs'] },
        ]
      },
      {
        code: 'B', title: 'Project 2', order_index: 2,
        groups: [
          { code: 'B1', title: 'AI Engineering Project', order_index: 1, topics: ['React frontend', 'Backend API', 'RAG pipeline', 'Postgres + pgvector', 'LLM integration', 'Tool calling'] },
        ]
      },
      {
        code: 'C', title: 'Project 3', order_index: 3,
        groups: [
          { code: 'C1', title: 'Engineering Project', order_index: 1, topics: ['Real-time system / distributed-ish / developer tool', 'Architecture decision', 'Deployment', 'README & docs'] },
        ]
      },
    ]
  },
  {
    code: '12', title: 'Interview Prep', description: 'Resume, GitHub hygiene, DSA interviews, technical rounds, and behavioral prep.', icon: 'Briefcase', color: '#f43f5e', order_index: 12,
    phases: [
      {
        code: 'A', title: 'Resume & GitHub', order_index: 1,
        groups: [
          { code: 'A1', title: 'Resume', order_index: 1, topics: ['One-page SWE resume', 'Project bullets', 'Quantifiable impact', 'ATS optimization', 'Technical skills section'] },
          { code: 'A2', title: 'GitHub', order_index: 2, topics: ['Repository hygiene', 'README quality', 'Architecture documentation', 'Deployment links', 'Meaningful commits'] },
        ]
      },
      {
        code: 'B', title: 'Interview Skills', order_index: 2,
        groups: [
          { code: 'B1', title: 'DSA Interviews', order_index: 1, topics: ['Timed solving', 'Pattern recognition', 'Verbal explanation', 'Complexity analysis'] },
          { code: 'B2', title: 'Technical Interviews', order_index: 2, topics: ['JS deep dive', 'React internals', 'Node.js Q&A', 'SQL & DBMS', 'OS concepts', 'Networks', 'OOP', 'Project architecture defense'] },
          { code: 'B3', title: 'Behavioral', order_index: 3, topics: ['Tell me about yourself', 'Project deep dive', 'Failure story', 'Conflict resolution', 'Leadership example', 'Challenge faced', 'Why this company?', 'Why should we hire you?'] },
        ]
      },
    ]
  },
]

export function getTotalTopics(subject: typeof SYLLABUS[0]) {
  return subject.phases.reduce((acc, phase) =>
    acc + phase.groups.reduce((a, g) => a + g.topics.length, 0), 0)
}
