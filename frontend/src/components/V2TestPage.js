import React, { useState, useEffect } from 'react';
import ResponseRenderer from './ResponseRenderer';
import { sampleV2, sampleV2Enhanced } from '../fixtures/sampleV2';

export default function V2TestPage() {
  const [liveResponse, setLiveResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState('basic');

  const fetchLiveSample = async (type = 'basic') => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sample/v2/${type}`);
      if (response.ok) {
        const data = await response.json();
        setLiveResponse(data);
      } else {
        console.error('Failed to fetch live sample:', response.status);
      }
    } catch (error) {
      console.error('Error fetching live sample:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSample(selectedSample);
  }, [selectedSample]);

  const samples = {
    fixture: selectedSample === 'basic' ? sampleV2 : sampleV2Enhanced,
    live: liveResponse
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">V2 Schema ResponseRenderer Test</h1>
          <p className="text-muted-foreground">
            Testing the new ResponseRenderer component with v2 schema responses
          </p>
        </header>

        {/* Controls */}
        <div className="mb-6 p-4 border rounded-xl bg-card">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Sample Type:</label>
            <select 
              value={selectedSample} 
              onChange={(e) => setSelectedSample(e.target.value)}
              className="px-3 py-1.5 border rounded-md bg-background"
            >
              <option value="basic">Basic Sample</option>
              <option value="enhanced">Enhanced Sample</option>
              <option value="table-test">Table Test</option>
            </select>
            <button 
              onClick={() => fetchLiveSample(selectedSample)}
              disabled={loading}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Live'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Fixture Sample */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              📦 Fixture Sample
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (from sampleV2.ts)
              </span>
            </h2>
            <div className="border rounded-xl p-6 bg-card">
              <ResponseRenderer response={samples.fixture} />
            </div>
          </div>

          {/* Live API Sample */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              🔗 Live API Sample
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (from /api/sample/v2/{selectedSample})
              </span>
            </h2>
            <div className="border rounded-xl p-6 bg-card">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-muted-foreground">Loading...</span>
                </div>
              ) : liveResponse ? (
                <ResponseRenderer response={liveResponse} />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No live response available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Tests */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">🧪 Feature Tests</h2>
          
          <div className="grid gap-6">
            {/* Table Features Test */}
            <div className="border rounded-xl p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">Table Features</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test table functionality: CSV export, copy to clipboard, mobile card-table view
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>✅ Sticky headers on scroll</div>
                <div>✅ Zebra striping</div>
                <div>✅ Copy to clipboard</div>
                <div>✅ CSV export</div>
                <div>✅ Mobile card-table (&lt;md breakpoint)</div>
                <div>✅ Accessibility (WCAG 2.1 AA)</div>
              </div>
            </div>

            {/* Responsive Test */}
            <div className="border rounded-xl p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">Responsive Design</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Resize your browser to test responsive behavior
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>📱 Mobile (&lt;768px): Card-table layout</div>
                <div>💻 Desktop (≥768px): Full table layout</div>
                <div>🎨 Theme tokens work in light/dark mode</div>
              </div>
            </div>

            {/* Schema Validation */}
            <div className="border rounded-xl p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">V2 Schema Validation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All responses conform to v2 schema structure
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>✅ Title with emoji</div>
                <div>✅ Summary (optional)</div>
                <div>✅ Blocks array (markdown, table, code, callout, image, list)</div>
                <div>✅ Meta object (emoji, schema, mapped)</div>
                <div>✅ Suggested actions (Phase 3 ready)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Listeners for Testing */}
        <div className="mt-8 p-4 border rounded-xl bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">Event Console</h3>
          <p className="text-xs text-muted-foreground">
            Open browser console to see events: table_copy, table_export_csv, suggested_action_clicked
          </p>
        </div>
      </div>
    </div>
  );
}

// Event listeners for testing
if (typeof window !== 'undefined') {
  window.addEventListener('table_copy', (e) => {
    console.log('📋 Table copied:', e.detail);
  });
  
  window.addEventListener('table_export_csv', (e) => {
    console.log('📁 CSV exported:', e.detail);
  });
  
  window.addEventListener('suggested_action_clicked', (e) => {
    console.log('🎯 Suggested action clicked:', e.detail);
  });
}