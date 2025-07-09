import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, AlertTriangle, CheckIcon } from 'lucide-react';

// Frontend token estimation utility (rough estimate: 4 chars per token)
function estimateTokens(data: any): number {
  const jsonString = JSON.stringify(data);
  return Math.ceil(jsonString.length / 4);
}

const MAX_INPUT_TOKENS = 100000; // Match server limit

interface AiScanSectionProps {
  isAiScanning: boolean;
  showAiSummary: boolean;
  aiScanDismissed: boolean;
  aiSummaryData: {
    totalViolations: number;
    affectedAccounts: number;
  };
  aiViolations: { [accountId: string]: string[] };
  onAiScan: () => void;
  onDismissAiSummary: () => void;
  creditData: any;
  showInputTooLargeWarning?: boolean;
  scanProgress?: number;
  scanMessage?: string;
}

export function AiScanSection({
  isAiScanning,
  showAiSummary,
  aiScanDismissed,
  aiSummaryData,
  aiViolations,
  onAiScan,
  onDismissAiSummary,
  creditData,
  showInputTooLargeWarning = false,
  scanProgress = 0,
  scanMessage = ""
}: AiScanSectionProps) {
  const estimatedTokens = creditData ? estimateTokens(creditData) : 0;
  const isInputTooLarge = estimatedTokens > MAX_INPUT_TOKENS;

  // Calculate violation counts by category
  const calculateViolationBreakdown = () => {
    let metro2Count = 0;
    let fcraCount = 0;
    let fdcpaCount = 0;
    let otherCount = 0;

    Object.values(aiViolations).forEach((accountViolations) => {
      if (Array.isArray(accountViolations)) {
        accountViolations.forEach((violation: string) => {
          if (violation.startsWith('- Metro 2')) {
            metro2Count++;
          } else if (violation.startsWith('- FCRA')) {
            fcraCount++;
          } else if (violation.startsWith('- FDCPA')) {
            fdcpaCount++;
          } else {
            otherCount++;
          }
        });
      }
    });

    return { metro2Count, fcraCount, fdcpaCount, otherCount };
  };

  const violationBreakdown = calculateViolationBreakdown();

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center space-y-4">
        {/* AI Scan Button */}
        {!showAiSummary && !isAiScanning && !aiScanDismissed && (
          <Button
            onClick={onAiScan}
            disabled={isInputTooLarge}
            className={`
              font-semibold text-base px-6 py-3 rounded-lg shadow-lg transition-colors duration-300 
              w-[280px] h-[48px] flex items-center justify-center gap-2
              ${isInputTooLarge 
                ? 'bg-gray-400 hover:bg-gray-400 border-2 border-gray-400 text-white cursor-not-allowed opacity-50' 
                : 'bg-blue-700 hover:bg-blue-800 border-2 border-blue-700 hover:border-blue-800 text-white'
              }
            `}
          >
            <Zap className="w-4 h-4 animate-bolt-pulse" />
            AI Metro 2 / Compliance Scan
          </Button>
        )}

        {/* Large Input Warning */}
        {(showInputTooLargeWarning || isInputTooLarge) && !showAiSummary && !isAiScanning && !aiScanDismissed && (
          <Card className="w-full max-w-md border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-800">Input Too Large for AI Scan</h4>
                  <p className="text-sm text-orange-700">
                    Your credit report ({estimatedTokens.toLocaleString()} tokens) exceeds our {MAX_INPUT_TOKENS.toLocaleString()} token limit.
                    To scan large reports, contact support for enterprise options.
                  </p>
                  <p className="text-xs text-orange-600">
                    AI scan is currently limited to smaller credit reports to ensure reliable processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showAiSummary && !isAiScanning && aiScanDismissed && (
          <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg px-4 py-2 max-w-md">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-medium">AI scan completed</span>
              <span className="text-xs text-green-600">• View dispute suggestions below</span>
            </div>
          </div>
        )}

        {isAiScanning && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-semibold text-blue-600">
                AI is scanning your credit report...
              </span>
            </div>
            
            {/* Progress Bar */}
            {scanProgress > 0 && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Current Status Message */}
            <p className="text-sm text-gray-600 text-center max-w-md">
              {scanMessage || "Examining all accounts, inquiries, and public records for compliance violations and generating dispute suggestions"}
            </p>
            
            {/* Timeout Warning */}
            {scanProgress > 80 && (
              <div className="text-xs text-orange-600 text-center max-w-md bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                Analysis is taking longer than usual. The scan will timeout after 25 seconds to ensure system stability.
              </div>
            )}
          </div>
        )}

        {showAiSummary && (
          <Card className="w-full max-w-2xl border-2 border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <h3 className="text-xl font-bold text-blue-800 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                AI Metro 2 / Compliance Scan Complete
              </h3>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {aiSummaryData.totalViolations}
                  </div>
                  <div className="text-sm text-gray-600">Total Violations Found</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {aiSummaryData.affectedAccounts}
                  </div>
                  <div className="text-sm text-gray-600">Accounts Affected</div>
                </div>
              </div>

              {/* Category Breakdown */}
              {(violationBreakdown.metro2Count > 0 || violationBreakdown.fcraCount > 0 || violationBreakdown.fdcpaCount > 0) && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Violations by Category</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-blue-600">{violationBreakdown.metro2Count}</div>
                      <div className="text-xs text-gray-600">Metro 2</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-green-600">{violationBreakdown.fcraCount}</div>
                      <div className="text-xs text-gray-600">FCRA</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-purple-600">{violationBreakdown.fdcpaCount}</div>
                      <div className="text-xs text-gray-600">FDCPA</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Metro 2, FCRA, and FDCPA violations detected. View accounts below for AI dispute
                suggestions.
              </p>
              <Button
                onClick={onDismissAiSummary}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-900"
              >
                Got it, hide this
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}