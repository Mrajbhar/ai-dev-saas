import DashboardLayout from "../components/DashboardLayout";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Developer 👋</h1>
          <p className="text-gray-400 mt-2">
            Monitor your AI model usage and performance.
          </p>
        </div>

        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 rounded-lg hover:scale-105 transition">
          Create Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">

        {[
          { title: "API Calls", value: "50.8K", growth: "+24%" },
          { title: "Active Users", value: "23.6K", growth: "+12%" },
          { title: "New Signups", value: "756", growth: "+31%" },
          { title: "Revenue", value: "$2.3K", growth: "+11%" },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <p className="text-gray-400">{item.title}</p>
            <h2 className="text-2xl font-bold mt-2">{item.value}</h2>
            <span className="text-green-400 text-sm">{item.growth}</span>
          </motion.div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid lg:grid-cols-3 gap-6 mt-10">

        {/* Big Chart Card */}
        <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>

          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>

        {/* Side Stats */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Total Sessions</h3>
          <h2 className="text-3xl font-bold">400</h2>
          <p className="text-green-400 mt-2">+16% this month</p>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;