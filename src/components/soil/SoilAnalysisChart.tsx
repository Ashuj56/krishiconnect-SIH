import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine, LabelList } from "recharts";

interface NutrientStatus {
  level: 'Low' | 'Medium' | 'Optimal';
  levelMl: string;
  value: number;
  ideal: { min: number; max: number };
}

// Indian Standard ranges for display
const nutrientRanges = {
  N: { low: '<280', medium: '280-560', high: '>560', unit: 'kg/ha' },
  P: { low: '<10', medium: '10-25', high: '>25', unit: 'kg/ha' },
  K: { low: '<110', medium: '110-280', high: '>280', unit: 'kg/ha' },
};

interface PHStatus {
  category: string;
  categoryMl: string;
  value: number;
}

interface SoilAnalysisChartProps {
  nitrogen: NutrientStatus;
  phosphorus: NutrientStatus;
  potassium: NutrientStatus;
  ph: PHStatus;
  language: string;
}

export function SoilAnalysisChart({ nitrogen, phosphorus, potassium, ph, language }: SoilAnalysisChartProps) {
  const getColor = (level: string) => {
    switch (level) {
      case 'Low': return 'hsl(var(--destructive))';
      case 'Medium': return 'hsl(var(--warning))';
      case 'Optimal': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getPHColor = (value: number) => {
    if (value < 5.5 || value > 8.5) return 'hsl(var(--destructive))';
    if (value < 6.0 || value > 8.0) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  const nutrientData = [
    {
      name: language === 'ml' ? 'N (നൈട്രജൻ)' : 'N (Nitrogen)',
      value: nitrogen.value,
      level: nitrogen.level,
      idealMin: nitrogen.ideal.min,
      max: 600,
    },
    {
      name: language === 'ml' ? 'P (ഫോസ്ഫറസ്)' : 'P (Phosphorus)',
      value: phosphorus.value,
      level: phosphorus.level,
      idealMin: phosphorus.ideal.min,
      max: 80,
    },
    {
      name: language === 'ml' ? 'K (പൊട്ടാസ്യം)' : 'K (Potassium)',
      value: potassium.value,
      level: potassium.level,
      idealMin: potassium.ideal.min,
      max: 600,
    },
  ];

  const phData = [
    {
      name: 'pH',
      value: ph.value,
      max: 14,
    },
  ];

  return (
    <div className="space-y-6">
      {/* NPK Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">
          {language === 'ml' ? 'NPK നിലകൾ (kg/ha)' : 'NPK Levels (kg/ha)'}
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={nutrientData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 80, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]}
                barSize={32}
              >
                {nutrientData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.level)} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  style={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => `${value}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Range Info Table */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="font-medium text-foreground">N</div>
            <div className="text-destructive">{nutrientRanges.N.low}</div>
            <div className="text-warning">{nutrientRanges.N.medium}</div>
            <div className="text-primary">{nutrientRanges.N.high}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="font-medium text-foreground">P</div>
            <div className="text-destructive">{nutrientRanges.P.low}</div>
            <div className="text-warning">{nutrientRanges.P.medium}</div>
            <div className="text-primary">{nutrientRanges.P.high}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="font-medium text-foreground">K</div>
            <div className="text-destructive">{nutrientRanges.K.low}</div>
            <div className="text-warning">{nutrientRanges.K.medium}</div>
            <div className="text-primary">{nutrientRanges.K.high}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">
              {language === 'ml' ? 'കുറവ്' : 'Low'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">
              {language === 'ml' ? 'ഇടത്തരം' : 'Medium'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">
              {language === 'ml' ? 'ഉചിതം/ഉയർന്നത്' : 'Optimal/High'}
            </span>
          </div>
        </div>
      </div>

      {/* pH Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">
          {language === 'ml' ? 'pH ലെവൽ' : 'pH Level'}
        </h4>
        <div className="relative h-16 bg-gradient-to-r from-destructive via-warning via-50% to-destructive rounded-xl overflow-hidden">
          {/* pH Scale */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-destructive/80" /> {/* 0-4 */}
            <div className="flex-1 bg-warning/80" /> {/* 4-5.5 */}
            <div className="flex-1 bg-primary/80" /> {/* 5.5-7.5 */}
            <div className="flex-1 bg-warning/80" /> {/* 7.5-9 */}
            <div className="flex-1 bg-destructive/80" /> {/* 9-14 */}
          </div>
          
          {/* pH Marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg transition-all duration-500"
            style={{ left: `${(ph.value / 14) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold whitespace-nowrap">
              {ph.value}
            </div>
          </div>

          {/* Scale Labels */}
          <div className="absolute bottom-1 left-2 text-xs text-white/80 font-medium">0</div>
          <div className="absolute bottom-1 right-2 text-xs text-white/80 font-medium">14</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/80 font-medium">7</div>
        </div>
        
        <div className="mt-8 text-center">
          <span className="text-sm font-medium" style={{ color: getPHColor(ph.value) }}>
            {language === 'ml' ? ph.categoryMl : ph.category}
          </span>
        </div>
      </div>
    </div>
  );
}
