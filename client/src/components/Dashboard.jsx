import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Clock, 
  Plus, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  Timer,
  Calendar,
  Tag,
  MoreVertical,
  FileEdit,
  Trash2,
  StickyNote,
  LayoutDashboard,
  PieChart,
  Settings,
  LogOut,
  User,
  Edit,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userDetails, setUserDetails] = useState(() => {
    const details = localStorage.getItem('userDetails');
    return details ? JSON.parse(details) : { name: 'User' };
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timers, setTimers] = useState({});
  const [filter, setFilter] = useState('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    tags: [],
    notes: '',
    status: 'pending'
  });
  const [view, setView] = useState('board'); // 'board' or 'analytics'
  const token = localStorage.getItem('token');

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 100 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 100 } }
  };

  const taskCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: { 
      y: -5,
      scale: 1.02,
      transition: { type: "spring", stiffness: 200 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200 }
    }
  };

  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  const statusIcons = {
    pending: <Circle className="w-4 h-4" />,
    'in-progress': <Timer className="w-4 h-4 text-yellow-500" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />
  };

  // Chart configuration
  const chartData = {
    labels: tasks.map(task => format(new Date(task.createdAt), 'MMM d')),
    datasets: [{
      label: 'Time Spent (hours)',
      data: tasks.map(task => (task.timeSpent || 0) / 3600),
      borderColor: 'rgb(99, 179, 237)',
      backgroundColor: 'rgba(99, 179, 237, 0.5)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#fff' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#fff' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#fff' }
      }
    }
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        console.log('Fetched tasks:', response.data); // Debug log
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/tasks', 
        newTask,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Task creation response:', response.data); // Debug log
      
      if (response.data) {
        setTasks(prevTasks => [...prevTasks, response.data]);
        setNewTask({
          title: '',
          priority: 'medium',
          notes: '',
          status: 'pending',
          timeSpent: 0,
          tags: []
        });
        setShowAddTask(false);
      }
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      // You might want to show this error to the user
    }
  };

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [activeTimer]: (prev[activeTimer] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (activeTimer === taskId) {
      setActiveTimer(null);
    }
  };

  const toggleTimer = (taskId) => {
    if (activeTimer === taskId) {
      setActiveTimer(null);
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, timeSpent: (task.timeSpent || 0) + (timers[taskId] || 0) }
          : task
      ));
    } else {
      if (activeTimer) {
        // Save time for previous task
        setTasks(prev => prev.map(task => 
          task.id === activeTimer 
            ? { ...task, timeSpent: (task.timeSpent || 0) + (timers[activeTimer] || 0) }
            : task
        ));
      }
      setActiveTimer(taskId);
      setTimers(prev => ({ ...prev, [taskId]: 0 }));
    }
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const updateTaskNotes = (taskId, notes) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, notes } : task
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    navigate('/');
  };

  const updateProfile = async (updatedDetails) => {
    try {
      // Update user details in localStorage for now
      // In a real app, you would make an API call here
      const newDetails = { ...userDetails, ...updatedDetails };
      localStorage.setItem('userDetails', JSON.stringify(newDetails));
      setUserDetails(newDetails);
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white overflow-hidden flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-[#2a2b2e] fixed h-screen border-r border-gray-800 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-semibold">DevTrack</h1>
          </div>

          {/* User Profile Section */}
          <div className="mb-8 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-colors"
               onClick={() => setShowEditProfile(true)}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {userDetails.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{userDetails.name}</h3>
                <p className="text-sm text-gray-400">{userDetails.email}</p>
              </div>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <nav className="space-y-2">
            {['board', 'analytics'].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  view === item ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'
                }`}
              >
                {item === 'board' ? (
                  <LayoutDashboard className="w-5 h-5" />
                ) : (
                  <PieChart className="w-5 h-5" />
                )}
                <span className="capitalize">{item}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400">FILTERS</h2>
            </div>
            <div className="space-y-2">
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    filter === status ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'
                  }`}
                >
                  {status === 'all' ? (
                    <LayoutDashboard className="w-4 h-4" />
                  ) : (
                    statusIcons[status]
                  )}
                  <span className="capitalize">{status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - with margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">
              {view === 'board' ? 'Task Board' : 'Analytics'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTask(true)}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </motion.button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
              >
                <span className="text-lg font-semibold">
                  {userDetails.name.charAt(0).toUpperCase()}
                </span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-[#2a2b2e] rounded-lg shadow-xl border border-gray-800 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-800 transition-colors text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {view === 'board' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {tasks
                  .filter(task => filter === 'all' || task.status === filter)
                  .map(task => (
                    <motion.div
                      key={task.id}
                      layoutId={`task-${task.id}`}
                      variants={taskCardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover="hover"
                      className="bg-[#2a2b2e] rounded-xl border border-gray-800 overflow-hidden group"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateTaskStatus(task.id)}
                              className="hover:bg-gray-700 p-1 rounded transition-colors"
                            >
                              {statusIcons[task.status]}
                            </button>
                            <h3 className="font-medium">{task.title}</h3>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors"
                            >
                              <FileEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {task.notes && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3 p-3 bg-yellow-100/10 rounded-lg relative overflow-hidden"
                          >
                            <StickyNote className="absolute top-2 right-2 w-4 h-4 text-yellow-500/50" />
                            <p className="text-sm text-gray-300">{task.notes}</p>
                          </motion.div>
                        )}

                        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(task.timeSpent)}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#2a2b2e] rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Productivity Trend</h2>
                <div className="h-[400px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#2a2b2e] rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold mb-4">Summary</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Tasks</span>
                      <span className="text-2xl font-semibold">{tasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Completed</span>
                      <span className="text-2xl font-semibold text-green-500">
                        {tasks.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">In Progress</span>
                      <span className="text-2xl font-semibold text-yellow-500">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-[#2a2b2e] rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">New Task</h2>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                    rows="4"
                    placeholder="Add any notes..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddTask}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
                >
                  Create Task
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2a2b2e] rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateProfile({
                  name: formData.get('name'),
                  email: formData.get('email')
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      defaultValue={userDetails.name}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      defaultValue={userDetails.email}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1b1e;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2b2e;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3b3e;
        }
      `}</style>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default Dashboard;
