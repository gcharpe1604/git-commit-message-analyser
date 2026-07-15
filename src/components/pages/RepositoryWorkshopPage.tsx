import { Playground } from "../Playground";

interface RepositoryWorkshopPageProps {
  repoName: string;
  onBack: () => void;
  onAnalysis: () => void;
}

export const RepositoryWorkshopPage = ({ repoName, onBack, onAnalysis }: RepositoryWorkshopPageProps) => (
  <div className="analysis-page repository-workshop-page animate-in">
    <div className="analysis-toolbar">
      <button onClick={onBack} className="btn-ghost route-back">← Back</button>
      <div className="analysis-tabs">
        <button onClick={onAnalysis}>Analysis</button>
        <span className="active">Commit workshop</span>
      </div>
    </div>
    <div className="repository-workshop-context"><span>Repository workshop</span><strong>{repoName}</strong></div>
    <Playground embedded repositoryName={repoName} />
  </div>
);
