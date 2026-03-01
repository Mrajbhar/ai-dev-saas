import { motion } from "framer-motion";

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex overflow-hidden bg-black text-white">

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-70"></div>

      <div className="relative z-10 flex w-full">

        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center px-16 relative">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold leading-tight text-center"
          >
            Build AI Tools <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Faster & Smarter
            </span>
          </motion.h1>

          <p className="mt-6 text-lg text-gray-400 max-w-md text-center">
            Develop, test and deploy intelligent applications effortlessly.
          </p>

          {/* 💻 Animated Code Window */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="mt-12 bg-gray-900/80 border border-indigo-500/20 rounded-2xl shadow-xl p-6 w-96"
          >
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <pre className="text-sm text-green-400 font-mono leading-relaxed">
{`import AI from 'ai-dev';

const model = AI.load("neural-core");

model.train({
  dataset: "developer-data",
  accuracy: 99.8%
});

export default model;`}
            </pre>
          </motion.div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 bg-black/60 backdrop-blur-xl">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-gray-900/80 border border-indigo-500/20 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.2)] p-10"
          >
            {children}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;