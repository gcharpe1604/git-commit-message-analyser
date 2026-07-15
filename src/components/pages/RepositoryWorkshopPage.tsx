import { Playground } from "../Playground";
import { RouteBackButton } from "../RouteBackButton";

interface RepositoryWorkshopPageProps {
  repoName: string;
  onBack: () => void;
  onAnalysis: () => void;
}

export const RepositoryWorkshopPage = ({ repoName, onBack, onAnalysis }: RepositoryWorkshopPageProps) => (
  <div className="analysis-page repository-workshop-page animate-in">
    <div className="analysis-toolbar">
      <RouteBackButton onClick={onBack} destination="previous view" />
      <div className="analysis-tabs">
        <button onClick={onAnalysis}>Analysis</button>
        <span className="active">Commit workshop</span>
      </div>
    </div>
    <div className="repository-workshop-context"><span>Repository workshop</span><strong>{repoName}</strong></div>
    <Playground embedded repositoryName={repoName} />
  </div>
);
