import React, { useState, useEffect } from 'react';

export default function LandingExamples({ onExampleClick, onDismiss, userTopics = [] }) {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if examples were dismissed this session
    const sessionDismissed = sessionStorage.getItem('examples_dismissed');
    if (sessionDismissed === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }

    fetchExamples();
  }, [userTopics]);

  const fetchExamples = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams({
        n: '5'
      });
      
      if (userTopics && userTopics.length > 0) {
        params.append('topics', userTopics.join(','));
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prompts/examples?${params}`, {
        headers: {
          'Authorization': 'Bearer mock_test_token', // Use existing auth
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch examples: ${response.status}`);
      }

      const data = await response.json();
      setExamples(data.examples || []);
      
      // Track that examples were served
      trackEvent('examples_served', {
        count: data.examples?.length || 0,
        topics: userTopics,
        seed: data.seed
      });
      
    } catch (err) {
      console.error('Failed to fetch examples:', err);
      setError(err.message);
      
      // Fallback examples
      setExamples([
        "When is a fire-rated door required in a Class 2 building?",
        "How do I size roof gutters to AS 3500.3?",
        "What's the NCC requirement for stair handrail height?",
        "When is backflow prevention mandatory (AS/NZS 3500.1)?",
        "How do I determine wind classification (N1–N6/C1–C4)?"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example, index) => {
    // Track the click
    trackEvent('example_clicked', {
      example_text: example,
      index,
      topics: userTopics
    });

    // Mark as dismissed for this session
    setDismissed(true);
    sessionStorage.setItem('examples_dismissed', 'true');

    // Call parent callback
    if (onExampleClick) {
      onExampleClick(example);
    }
  };

  const handleDismiss = (reason = 'user_action') => {
    trackEvent('dismiss_examples', { reason });
    
    setDismissed(true);
    sessionStorage.setItem('examples_dismissed', 'true');
    
    if (onDismiss) {
      onDismiss(reason);
    }
  };

  const trackEvent = async (eventType, metadata) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/telemetry/ui`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_test_token',
        },
        body: JSON.stringify({
          event_type: eventType,
          user_id: 'current_user', // Replace with actual user ID
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          metadata
        })
      });
    } catch (err) {
      console.warn('Failed to track event:', err);
    }
  };

  // Handle new thread - refresh examples
  const handleNewThread = () => {
    sessionStorage.removeItem('examples_dismissed');
    setDismissed(false);
    fetchExamples();
  };

  // Expose refresh function for parent components
  useEffect(() => {
    window.addEventListener('new_thread_started', handleNewThread);
    return () => window.removeEventListener('new_thread_started', handleNewThread);
  }, []);

  if (dismissed) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-6 p-4 border rounded-xl bg-card animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && examples.length === 0) {
    return (
      <div className="mb-6 p-4 border rounded-xl bg-card">
        <div className="text-sm text-muted-foreground mb-2">
          Unable to load examples. Try asking a question directly.
        </div>
        <button
          onClick={() => fetchExamples()}
          className="text-xs px-2 py-1 border rounded hover:bg-accent/40"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Try asking about...</h3>
        <button
          onClick={() => handleDismiss('user_dismiss')}
          className="text-xs text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss examples"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {examples.slice(0, 5).map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example, index)}
            className="w-full text-left p-3 rounded-lg border hover:bg-accent/40 hover:border-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring text-sm group"
          >
            <span className="group-hover:text-accent-foreground">{example}</span>
          </button>
        ))}
      </div>

      {userTopics && userTopics.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          Suggestions based on recent topics: {userTopics.join(', ')}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => fetchExamples()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Refresh examples
        </button>
        <div className="text-xs text-muted-foreground">
          {examples.length} suggestions
        </div>
      </div>
    </div>
  );
}