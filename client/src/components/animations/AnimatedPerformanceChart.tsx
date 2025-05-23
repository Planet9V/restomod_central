import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Gauge, Users } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceData {
  marketData?: {
    marketGrowthData: Array<{ year: number; value: number }>;
    avgPriceByCategory: Array<{ category: string; price: number }>;
    customerSatisfaction: Array<{ year: number; satisfaction: number }>;
  };
}

export function AnimatedPerformanceChart({ marketData }: PerformanceData) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Market Growth Chart Data
  const marketGrowthData = {
    labels: marketData?.marketGrowthData?.map(item => item.year) || [2019, 2020, 2021, 2022, 2023, 2024],
    datasets: [
      {
        label: 'Market Value ($M)',
        data: marketData?.marketGrowthData?.map(item => item.value) || [2.1, 2.4, 2.8, 3.2, 3.7, 4.1],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Price by Category Chart Data
  const priceData = {
    labels: marketData?.avgPriceByCategory?.map(item => item.category.replace('-', ' ').toUpperCase()) || 
             ['MUSCLE CARS', 'CLASSIC TRUCKS', 'LUXURY CLASSICS', 'SPORTS CARS'],
    datasets: [
      {
        label: 'Average Price ($K)',
        data: marketData?.avgPriceByCategory?.map(item => item.price / 1000) || [85, 65, 125, 95],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Customer Satisfaction Doughnut
  const satisfactionData = {
    labels: ['Excellent', 'Very Good', 'Good', 'Fair'],
    datasets: [
      {
        data: [75, 20, 4, 1],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8"
    >
      {/* Market Growth Chart */}
      <motion.div variants={chartVariants}>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg font-semibold text-white">Market Growth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">
              Classic car restomod market value over time
            </CardDescription>
            <div className="h-64">
              <Line data={marketGrowthData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price by Category Chart */}
      <motion.div variants={chartVariants}>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg font-semibold text-white">Average Pricing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">
              Average restomod pricing by category
            </CardDescription>
            <div className="h-64">
              <Bar data={priceData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div variants={chartVariants}>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg font-semibold text-white">Performance Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-lg bg-white/5"
              >
                <div className="text-2xl font-bold text-amber-400">98%</div>
                <div className="text-sm text-slate-300">On-Time Delivery</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-lg bg-white/5"
              >
                <div className="text-2xl font-bold text-green-400">500+</div>
                <div className="text-sm text-slate-300">Completed Builds</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-lg bg-white/5"
              >
                <div className="text-2xl font-bold text-blue-400">25+</div>
                <div className="text-sm text-slate-300">Years Experience</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-lg bg-white/5"
              >
                <div className="text-2xl font-bold text-purple-400">200%</div>
                <div className="text-sm text-slate-300">Avg. Value Increase</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Satisfaction */}
      <motion.div variants={chartVariants}>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg font-semibold text-white">Customer Satisfaction</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">
              Client satisfaction ratings distribution
            </CardDescription>
            <div className="h-64">
              <Doughnut data={satisfactionData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}