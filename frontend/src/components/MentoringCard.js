// src/components/MentoringCard.js
import React from 'react';
import { Card, CardContent } from './ui/card';

export default function MentoringCard({ title, content, className = "" }) {
  return (
    <Card className={`border-l-4 border-l-blue-500 bg-blue-50/50 ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🧐</span>
          <h2 className="text-xl font-bold text-gray-900">
            {title || "Mentoring Insight"}
          </h2>
        </div>
        <div className="prose max-w-none text-gray-800 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </CardContent>
    </Card>
  );
}