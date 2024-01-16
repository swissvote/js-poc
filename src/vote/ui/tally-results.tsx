import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { TallyResult } from "../type";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const TallyResults = ({
  tallyResults,
}: {
  tallyResults: TallyResult;
}) => {
  return (
    <>
      <div className="max-w-md mx-auto  rounded px-8 pt-6 pb-8 mb-4">
        <BarChartComponent tallyResults={tallyResults} />
        <ul className="list-disc space-y-2 pl-5">
          {Object.entries(tallyResults.tally)
            .sort(([k1], [k2]) => k1.localeCompare(k2))
            .map(([k, v]) => (
              <li key={k} className="text-gray-700 text-lg">
                <span className="font-semibold">{k}:</span> {v}
              </li>
            ))}
        </ul>
        <p className="mt-4 text-gray-600 text-sm">
          {tallyResults.n.toLocaleString()} votes, results computed in{" "}
          <span className="font-mono text-green-600">{tallyResults.dt}ms</span>
        </p>
      </div>
    </>
  );
};

const BarChartComponent = ({ tallyResults }: { tallyResults: TallyResult }) => {
  const orderedSet = Object.entries(tallyResults.tally).sort(([k1], [k2]) =>
    k1.localeCompare(k2)
  );

  const labels = orderedSet.map((x) => x[0]);
  const data = orderedSet.map((x) => x[1]);

  const dataset = {
    labels,
    datasets: [
      {
        label: "Vote Results",
        data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={dataset} />;
};
