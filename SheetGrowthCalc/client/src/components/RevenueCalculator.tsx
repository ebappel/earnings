import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface RevenueData {
  period: string;
  date: string;
  estimatedRevenue?: number;
  actualRevenue?: number;
  calculatedRevenueGrowth?: number;
  col7?: string;
  estimatedEPS?: number;
  actualEPS?: number;
  calculatedEPSGrowth?: number;
  col10?: string;
  col11?: string;
}

export default function RevenueCalculator() {
  const [pastedData, setPastedData] = useState('');

  const parseNumber = (str: string): number | undefined => {
    if (!str || str.trim() === '' || str.trim() === '--' || str.trim() === '—' || str.trim() === '0') {
      return undefined;
    }
    const cleanStr = str.trim().replace(/[$,]/g, '').replace(/M$/i, '');
    const value = parseFloat(cleanStr);
    if (isNaN(value) || value === 0) return undefined;
    if (str.toUpperCase().includes('M')) {
      return value * 1000000;
    }
    return value;
  };

  const parseEPS = (str: string): number | undefined => {
    if (!str || str.trim() === '' || str.trim() === '--' || str.trim() === '—' || str.trim() === '0') {
      return undefined;
    }
    const value = parseFloat(str.trim());
    if (isNaN(value) || value === 0) return undefined;
    return value;
  };

  const parsedData = useMemo((): RevenueData[] => {
    if (!pastedData.trim()) return [];

    const lines = pastedData.trim().split('\n');
    const data: RevenueData[] = [];

    // Skip header row if it exists
    const startIndex = lines[0]?.includes('Period Year') || lines[0]?.includes('Year') ? 1 : 0;
    const dataLines = lines.slice(startIndex);

    for (const line of dataLines) {
      const columns = line.split('\t');
      
      if (columns.length >= 10) {
        const year = columns[0]?.trim() || '';
        const period = columns[1]?.trim() || '';
        const date = columns[2]?.trim() || '';
        // columns[3] = EPS Growth (we'll calculate)
        // columns[4] = Revenue Growth (we'll calculate)
        const estRev = parseNumber(columns[5] || '');
        const actRev = parseNumber(columns[6] || '');
        const col7 = columns[7]?.trim() || '';
        const estEPS = parseEPS(columns[8] || '');
        const actEPS = parseEPS(columns[9] || '');
        const col10 = columns[10]?.trim() || '';
        const col11 = columns[11]?.trim() || '';

        if (year && period && date) {
          // Combine year and period as "Q4-2024"
          let displayPeriod = `${period}-${year}`;
          
          // Add 'EST' prefix if there's estimated revenue but no actual revenue
          if (estRev !== undefined && actRev === undefined) {
            displayPeriod = `EST ${displayPeriod}`;
          }
          
          data.push({
            period: displayPeriod,
            date,
            estimatedRevenue: estRev,
            actualRevenue: actRev,
            col7: col7 !== '0' && col7 !== '' ? col7 : undefined,
            estimatedEPS: estEPS,
            actualEPS: actEPS,
            col10: col10 !== '0' && col10 !== '' ? col10 : undefined,
            col11: col11 !== '0' && col11 !== '' ? col11 : undefined,
          });
        }
      }
    }

    // Sort by date (oldest to newest)
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate revenue growth and EPS growth for each row
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      
      // Extract quarter and year from period (e.g., "Q3-2025" or "EST Q2-2026")
      const periodMatch = current.period.match(/Q(\d)-(\d{4})/i);
      
      if (periodMatch) {
        const currentQuarter = periodMatch[1];
        const currentYear = parseInt(periodMatch[2]);
        
        // Find the same quarter from previous year
        for (let j = 0; j < data.length; j++) {
          if (i === j) continue;
          
          const compareRow = data[j];
          const comparePeriodMatch = compareRow.period.match(/Q(\d)-(\d{4})/i);
          
          if (comparePeriodMatch) {
            const compareQuarter = comparePeriodMatch[1];
            const compareYear = parseInt(comparePeriodMatch[2]);
            
            // Same quarter, previous year
            if (compareQuarter === currentQuarter && compareYear === currentYear - 1) {
              // Calculate Revenue Growth
              if (current.estimatedRevenue !== undefined && compareRow.actualRevenue !== undefined) {
                const growth = ((current.estimatedRevenue - compareRow.actualRevenue) / compareRow.actualRevenue) * 100;
                data[i].calculatedRevenueGrowth = growth;
              }
              
              // Calculate EPS Growth
              if (current.estimatedEPS !== undefined && compareRow.actualEPS !== undefined) {
                const epsGrowth = ((current.estimatedEPS - compareRow.actualEPS) / Math.abs(compareRow.actualEPS)) * 100;
                data[i].calculatedEPSGrowth = epsGrowth;
              }
              
              break;
            }
          }
        }
      }
    }

    return data;
  }, [pastedData]);

  const handleClear = () => {
    setPastedData('');
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '—';
    return Math.round(value) + '%';
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '—';
    return value.toFixed(3);
  };

  const formatSurprisePercentage = (value: string | undefined) => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return Math.round(num) + '%';
    }
    return '—';
  };

  const formatColumn = (value: string | undefined) => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toFixed(2);
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-full px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-foreground mb-2">Revenue & EPS Growth Calculator</h1>
          <p className="text-sm text-muted-foreground">
            Copy and paste your table data from your spreadsheet to calculate year-over-year growth
          </p>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="data-input" className="text-sm font-medium">
                  Paste Your Data
                </Label>
                {pastedData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    data-testid="button-clear"
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <Textarea
                id="data-input"
                data-testid="input-data"
                placeholder="Paste your table data here (including headers)..."
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                rows={12}
                className="font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-results">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-foreground whitespace-nowrap">
                        Period
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-foreground whitespace-nowrap">
                        Date Announced
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        EPS Growth (YOY %)
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Revenue Growth (YOY %)
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Estimated Revenue
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Revenue
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Surprise % Revenue
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Estimated EPS
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        EPS
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Surprise % EPS
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-foreground whitespace-nowrap">
                        Days To Cover
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-b-0 hover-elevate"
                        data-testid={`row-data-${index}`}
                      >
                        <td className="p-4 text-sm text-foreground whitespace-nowrap" data-testid={`cell-period-${index}`}>
                          {row.period}
                        </td>
                        <td className="p-4 text-sm text-foreground whitespace-nowrap" data-testid={`cell-date-${index}`}>
                          {row.date}
                        </td>
                        <td
                          className={`p-4 text-right text-sm font-mono whitespace-nowrap ${
                            row.calculatedEPSGrowth !== undefined
                              ? 'bg-calculated text-calculated-foreground font-medium'
                              : 'text-muted-foreground'
                          }`}
                          data-testid={`cell-eps-growth-${index}`}
                        >
                          {formatPercentage(row.calculatedEPSGrowth)}
                        </td>
                        <td
                          className={`p-4 text-right text-sm font-mono whitespace-nowrap ${
                            row.calculatedRevenueGrowth !== undefined
                              ? 'bg-calculated text-calculated-foreground font-medium'
                              : 'text-muted-foreground'
                          }`}
                          data-testid={`cell-revenue-growth-${index}`}
                        >
                          {formatPercentage(row.calculatedRevenueGrowth)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-estimated-${index}`}>
                          {formatCurrency(row.estimatedRevenue)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-actual-${index}`}>
                          {formatCurrency(row.actualRevenue)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-col7-${index}`}>
                          {formatSurprisePercentage(row.col7)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-estimated-eps-${index}`}>
                          {formatNumber(row.estimatedEPS)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-actual-eps-${index}`}>
                          {formatNumber(row.actualEPS)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-col10-${index}`}>
                          {formatSurprisePercentage(row.col10)}
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-foreground whitespace-nowrap" data-testid={`cell-col11-${index}`}>
                          {formatColumn(row.col11)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
