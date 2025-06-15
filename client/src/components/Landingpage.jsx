import React from "react";
import { motion } from "framer-motion";
import { Code2, ListTodo, NotebookPen, TimerReset, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const features = [
	{
		icon: <ListTodo size={44} className="text-cyan-400 drop-shadow-lg" />,
		title: "Task Management",
		desc: "Organize your development tasks with intuitive lists and priorities.",
	},
	{
		icon: <TimerReset size={44} className="text-pink-400 drop-shadow-lg" />,
		title: "Session Tracking",
		desc: "Monitor your coding sessions and boost productivity with insightful stats.",
	},
	{
		icon: <NotebookPen size={44} className="text-yellow-400 drop-shadow-lg" />,
		title: "Coding Notes",
		desc: "Take quick notes, jot down ideas, and never lose your coding thoughts.",
	},
];

const Landingpage = () => {
  const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-black text-white overflow-hidden">
			{/* Stars Background */}
			<div className="fixed inset-0 z-0">
				{[...Array(50)].map((_, i) => (
					<div
						key={i}
						className="absolute rounded-full bg-white"
						style={{
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
							width: `${Math.random() * 3}px`,
							height: `${Math.random() * 3}px`,
							animation: `twinkle ${Math.random() * 5 + 3}s infinite`,
						}}
					/>
				))}
			</div>

			{/* Navigation */}
			<nav className="relative z-10 px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center space-x-2"
          >
            <Code2 className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold">DevTrack</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/get-started')}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium"
          >
            Get Started
          </motion.button>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="relative z-10">
				<div className="max-w-7xl mx-auto px-6 py-20 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="max-w-3xl mx-auto"
					>
						<h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
							Track Your Dev Journey
						</h1>
						<p className="text-xl text-gray-400 mb-10">
							Manage tasks, track coding sessions, and take notes—all in one powerful, beautiful tool.
						</p>
						<motion.button
							onClick={() => navigate('/get-started')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium group"
						>
							Try DevTrack Free
							<ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</motion.button>
					</motion.div>
				</div>
			</main>

			{/* Features Section */}
			<motion.section
				variants={staggerContainer}
				initial="initial"
				whileInView="animate"
				viewport={{ once: true }}
				className="relative z-10 py-20 bg-gradient-to-b from-transparent to-gray-900"
			>
				<div className="max-w-7xl mx-auto px-6">
					<motion.h2
						variants={fadeInUp}
						className="text-4xl font-bold text-center mb-16"
					>
						Everything you need to excel
					</motion.h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: <ListTodo className="w-8 h-8 text-cyan-400" />,
								title: "Task Management",
								description: "Organize your development tasks with intuitive lists and priorities",
							},
							{
								icon: <TimerReset className="w-8 h-8 text-blue-400" />,
								title: "Session Tracking",
								description: "Monitor your coding sessions and boost productivity with insights",
							},
							{
								icon: <NotebookPen className="w-8 h-8 text-indigo-400" />,
								title: "Smart Notes",
								description: "Take quick notes and never lose your coding thoughts",
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								variants={fadeInUp}
								className="relative group"
							>
								<div className="relative z-10 p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:border-cyan-500 transition-colors duration-300">
									<div className="flex flex-col items-center text-center">
										{feature.icon}
										<h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
										<p className="mt-2 text-gray-400">{feature.description}</p>
									</div>
								</div>
								<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			<style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
		</div>
	);
};

export default Landingpage;