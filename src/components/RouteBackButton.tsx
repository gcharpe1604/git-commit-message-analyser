import { MdArrowBack } from "react-icons/md";

interface RouteBackButtonProps {
  onClick: () => void;
  destination: string;
}

export const RouteBackButton = ({ onClick, destination }: RouteBackButtonProps) => (
  <button type="button" onClick={onClick} className="route-back" aria-label={`Back to ${destination}`}>
    <span className="route-back-icon"><MdArrowBack /></span>
    <span className="route-back-copy"><strong>Back</strong><small>{destination}</small></span>
  </button>
);
