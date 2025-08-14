// Optional build info display for debugging/support
import React, { useState, useEffect } from 'react';

const BuildInfo = ({ className = "" }) => {
  const [buildInfo, setBuildInfo] = useState(null);

  useEffect(() => {
    // Fetch build info from backend
    fetch('/api/version', { cache: 'no-store' })
      .then(r => r.json())
      .then(setBuildInfo)
      .catch(() => {}); // Silent fail - not critical
  }, []);

  if (!buildInfo) return null;

  const buildDate = buildInfo.builtAt !== 'unknown' 
    ? new Date(buildInfo.builtAt).toLocaleString()
    : 'Unknown';

  return (
    <small 
      className={`text-muted-foreground/60 text-xs ${className}`}
      aria-label="build-info"
      title={`Commit: ${buildInfo.commitSha}\nBuilt: ${buildDate}`}
    >
      Build {buildInfo.version?.substring(0, 8)} • {buildDate}
    </small>
  );
};

export default BuildInfo;