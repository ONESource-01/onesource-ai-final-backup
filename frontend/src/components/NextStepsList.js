// src/components/NextStepsList.js  
import React from 'react';
import { Card, CardContent } from './ui/card';
import Markdown from './Markdown';

export default function NextStepsList({ title, content, steps = [], className = "" }) {
  // Parse steps from content if not provided as array
  const stepsList = steps.length > 0 ? steps : 
    content?.split(/\d+\.\s+/).filter(Boolean) || [];

  return (
    <Card className={`border-l-4 border-l-green-500 bg-green-50/50 ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <h2 className="text-xl font-bold text-gray-900">
            {title || "Next Steps"}
          </h2>
        </div>
        <div className="space-y-3">
          {stepsList.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="prose max-w-none text-gray-800 leading-relaxed">
                <Markdown source={step} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}