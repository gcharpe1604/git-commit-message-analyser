import type { Repository } from "../../types";
import { UserRepoList } from "../UserRepoList";

export const DeveloperReposPage = ({ username, repos, loading, onBack, onSelectRepo }: { username: string; repos: Repository[]; loading: boolean; onBack: () => void; onSelectRepo: (url: string) => void }) => <div className="animate-in">
  <button onClick={onBack} className="btn-ghost route-back">← Back to analyzer</button>
  <UserRepoList repos={repos} onSelectRepo={onSelectRepo} username={username} isLoading={loading} />
</div>;
