import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This step is now combined into PlayingLevel. Redirect back to that page.
const SwingStrength = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/reserve/level", { replace: true });
  }, [navigate]);
  return null;
};

export default SwingStrength;
