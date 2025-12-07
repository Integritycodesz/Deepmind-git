
export interface GithubRepoData {
  description: string;
  log: string;
  name: string;
}

export const fetchGithubData = async (repoUrl: string): Promise<GithubRepoData> => {
  // 1. Parse URL to get owner and repo
  // Supports: https://github.com/owner/repo or https://github.com/owner/repo.git
  const regex = /github\.com\/([^/]+)\/([^/.]+)/;
  const match = repoUrl.match(regex);

  if (!match) {
    throw new Error("Invalid GitHub URL. Please use format: https://github.com/owner/repo");
  }

  const owner = match[1];
  const repo = match[2];
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 2. Fetch Repo Details (for description)
    const repoResponse = await fetch(baseUrl);
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) throw new Error("Repository not found.");
      if (repoResponse.status === 403) throw new Error("GitHub API rate limit exceeded. Please paste log manually.");
      throw new Error("Failed to fetch repository details.");
    }
    const repoData = await repoResponse.json();

    // 3. Fetch Commits (for log)
    const commitsResponse = await fetch(`${baseUrl}/commits?per_page=30`);
    if (!commitsResponse.ok) throw new Error("Failed to fetch commits.");
    const commitsData = await commitsResponse.json();

    // 4. Transform Commits to Git Log format
    // Note: The public API list endpoint doesn't give file stats (insertions/deletions)
    // We will generate a log format that the AI can parse, even without stats.
    const formattedLog = commitsData.map((item: any) => {
      const c = item.commit;
      return `commit ${item.sha}
Author: ${c.author.name} <${c.author.email}>
Date:   ${c.author.date}
Message: ${c.message}

 [Stats unavailable via public API - AI will estimate impact]
`;
    }).join('\n');

    return {
      description: repoData.description || "",
      log: formattedLog,
      name: repoData.full_name
    };

  } catch (error: any) {
    console.error("GitHub Fetch Error:", error);
    throw error;
  }
};
