import DashboardLayout from "../components/DashboardLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [system, setSystem] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/ai/stats")
      .then(res => setStats(res.data))
      .catch(() => setStats(null));

    axios.get("http://localhost:5000/api/ai/system-status")
      .then(res => setSystem(res.data))
      .catch(() => setSystem(null));
  }, []);

  // Proper chart data formatting
  const chartData = stats?.dailyUsage
    ? Object.entries(stats.dailyUsage)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, count]) => {
          const formattedDate = new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          });

          return {
            date: formattedDate,
            calls: count,
          };
        })
    : [];

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">
            AI Control Center 🚀
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor your local LLaMA + Ollama performance.
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-lg text-sm ${
            system?.ollama === "Running"
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          }`}
        >
          {system?.ollama || "Checking..."}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { title: "Total AI Calls", value: stats?.totalCalls || 0 },
          { title: "LLaMA Requests", value: stats?.llamaCalls || 0 },
          { title: "Embeddings", value: stats?.embeddingCalls || 0 },
          { title: "Indexed Files", value: stats?.indexedFiles || 0 },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <p className="text-gray-400">{item.title}</p>
            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* USAGE OVERVIEW + SYSTEM STATUS */}
      <div className="grid lg:grid-cols-3 gap-6 mt-10">

        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            AI Usage Overview (Last 7 Days)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px"
                  }}
                  labelStyle={{ color: "#fff" }}
                />

                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            System Status
          </h3>

          {system && (
            <div className="space-y-4 text-gray-300">
              <div className="flex justify-between">
                <span>CPU</span>
                <span>{system.cpu}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Memory</span>
                <span>{system.memory}</span>
              </div>

              <div className="flex justify-between">
                <span>Free Memory</span>
                <span>{system.freeMemory}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform</span>
                <span>{system.platform}</span>
              </div>

              <div className="flex justify-between">
                <span>Model</span>
                <span className="text-indigo-400">llama3</span>
              </div>

              <div className="flex justify-between">
                <span>Embedding</span>
                <span className="text-purple-400">nomic-embed-text</span>
              </div>

              <div className="flex justify-between">
                <span>Vector Store</span>
                <span className="text-green-400">In Memory</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">
          Recent AI Activity
        </h3>

        <div className="space-y-4 text-gray-400">
          {stats?.recentActivity?.length ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between">
                <span>{activity.type}</span>
                <span>{activity.time}</span>
              </div>
            ))
          ) : (
            <div>No recent activity</div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;