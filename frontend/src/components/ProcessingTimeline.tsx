import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProcessingTimelineProps {
  currentStage: string;
  progressPercentage: number;
  stagesLog: { message: string; timestamp: string }[];
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  progressPercentage
}) => {
  const defaultStages = [
    { id: 'UPLOAD', label: 'Receipt safely uploaded' },
    { id: 'PARSING', label: 'Document text extracted (PyMuPDF / OCR)' },
    { id: 'EXTRACTION', label: 'Purchase details normalized' },
    { id: 'POLICY_MATCH', label: 'Store policy matched (DemoMart §3.1, §4.1)' },
    { id: 'CALCULATOR', label: 'Deterministic return/warranty windows calculated' },
    { id: 'INDEXING', label: 'Indexed into shopper-isolated vector space' },
    { id: 'COMPLETE', label: 'Protection summary ready' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-slate-200/90 shadow-xl relative overflow-hidden bg-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Analyzing Purchase Protection...</h4>
            <p className="text-xs text-slate-500">Executing automatic extraction &amp; deterministic calculator</p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          {progressPercentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6 border border-slate-200">
        <motion.div
          className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Stage Checklist */}
      <div className="space-y-3">
        {defaultStages.map((stage, idx) => {
          const isFinished = progressPercentage >= (idx + 1) * 14 || progressPercentage === 100;
          const isCurrent = !isFinished && progressPercentage >= idx * 14;

          return (
            <div key={stage.id} className="flex items-center space-x-3 text-xs">
              {isFinished ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
              )}
              <span className={isFinished ? 'text-slate-800 font-medium' : isCurrent ? 'text-indigo-700 font-semibold' : 'text-slate-400'}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
