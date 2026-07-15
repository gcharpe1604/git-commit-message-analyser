import type { Repository } from "../../types";
import { UserRepoList } from "../UserRepoList";
import { RouteBackButton } from "../RouteBackButton";

export const DeveloperReposPage = ({ username, repos, loading, onBack, onSelectRepo }: { username: string; repos: Repository[]; loading: boolean; onBack: () => void; onSelectRepo: (url: string) => void }) => <div className="animate-in">
  <RouteBackButton onClick={onBack} destination="analyzer" />
  <UserRepoList repos={repos} onSelectRepo={onSelectRepo} username={username} isLoading={loading} />
</div>;
