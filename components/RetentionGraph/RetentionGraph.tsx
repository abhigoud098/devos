"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  history: any[];
};

export default function RetentionGraph({ history }: Props) {
  const data = history
    .slice()
    .reverse()
    .map((item, index) => ({
      day: `Day ${index + 1}`,

      retention: Math.max(20, 100 - index * 5),
    }));

  return (
    <div className="h-[280px] w-full">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No retention data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Line type="monotone" dataKey="retention" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
