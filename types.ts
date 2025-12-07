
export enum CommitType {
  FEATURE = 'Feature',
  BUGFIX = 'Bug Fix',
  REFACTOR = 'Refactor',
  CHORE = 'Chore',
  DOCS = 'Documentation',
  PERF = 'Performance',
  SECURITY = 'Security',
  UNKNOWN = 'Unknown'
}

export interface Commit {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  message: string;
  type: CommitType;
  impactScore: number; // 1-10 scale of importance
  summary: string; // AI generated one-liner
  filesChanged: number;
  codeSmells?: string[]; // Detected smells like 'Magic Numbers', 'Duplicate Code'
  // Raw diff content (simulated or real)
  diff?: string;
}

export interface AnalysisResult {
  repoName: string;
  repoUrl?: string;
  projectType: string; // e.g. "React Web App", "Python CLI", "Go Microservice"
  whatItIs: string; // A one-line pitch
  whatItDoes: string; // A detailed paragraph explaining functionality
  overview: string;
  commits: Commit[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  COMMIT_DETAIL = 'COMMIT_DETAIL',
  CHAT = 'CHAT'
}

// Sample data for demo purposes if user doesn't paste a log
// Using a stat format to mimic git log --stat
export const DEMO_GIT_LOG = `
commit a1b2c3d
Author: Sarah Dev <sarah@example.com>
Date:   2023-10-05 14:30:00
Message: feat: Implement JWT authentication logic

 src/auth/auth.service.ts | 45 +++++++++++++++++++++++++++++++
 src/auth/jwt.strategy.ts | 30 +++++++++++++++++++++
 src/app.module.ts        |  5 ++++
 3 files changed, 80 insertions(+)

commit d4e5f6g
Author: Mike Junior <mike@example.com>
Date:   2023-10-06 09:15:00
Message: fix: Resolve null pointer in user session handling causing crash on login

 src/users/users.controller.ts | 12 ++++--------
 1 file changed, 4 insertions(+), 8 deletions(-)

commit h7i8j9k
Author: Sarah Dev <sarah@example.com>
Date:   2023-10-07 11:20:00
Message: refactor: Extract validation logic into reusable middleware service

 src/common/validation.pipe.ts | 50 +++++++++++++++++++++++++++++++++++
 src/users/users.controller.ts | 25 -----------------
 2 files changed, 50 insertions(+), 25 deletions(-)

commit l0m1n2o
Author: Alex Lead <alex@example.com>
Date:   2023-10-08 16:45:00
Message: perf: Optimize database query for dashboard analytics (reduced load time by 40%)

 src/analytics/analytics.repository.ts | 15 +++++++--------
 src/analytics/analytics.service.ts    |  5 +----
 2 files changed, 10 insertions(+), 12 deletions(-)

commit p3q4r5s
Author: Mike Junior <mike@example.com>
Date:   2023-10-09 10:00:00
Message: security: Sanitize user input to prevent XSS attacks

 src/utils/sanitize.ts | 20 ++++++++++++++++++++
 src/main.ts | 4 ++--
 2 files changed, 22 insertions(+), 2 deletions(-)
`;
