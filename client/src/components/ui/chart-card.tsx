import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface ChartData {
  name: string;
  value: number;
  year?: number;
}

interface ChartCardProps {
  title: string;
  description: string;
  data: ChartData[];
  type: "area" | "pie";
}

const CHART_COLORS = [
  COLORS.burgundy,
  COLORS.gold,
  COLORS.steel,
  COLORS.graphite,
  COLORS.silver,
];

const ChartCard = ({ title, description, data, type }: ChartCardProps) => {
  return (
    <div>
      <h3 className="font-playfair text-2xl font-medium mb-6">{title}</h3>
      <p className="mb-8 text-charcoal/80">{description}</p>
      <div className="h-80 w-full bg-white p-4 shadow-md rounded-sm">
        {type === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.burgundy}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.burgundy}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                tick={{ fill: COLORS.charcoal }} 
              />
              <YAxis 
                tick={{ fill: COLORS.charcoal }}
                label={{ 
                  value: 'Value (Indexed)',
                  angle: -90, 
                  position: 'insideLeft',
                  fill: COLORS.charcoal,
                  style: { textAnchor: 'middle' }
                }}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.offwhite,
                  border: `1px solid ${COLORS.silver}`,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.burgundy}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={COLORS.burgundy}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={{
                  backgroundColor: COLORS.offwhite,
                  border: `1px solid ${COLORS.silver}`,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
