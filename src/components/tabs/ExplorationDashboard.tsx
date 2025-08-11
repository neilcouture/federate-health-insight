import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Grid,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Assessment,
  PieChart,
  BarChart,
  Timeline,
  Download,
  Share,
  Refresh,
  FilterList,
  Group,
  LocalHospital,
  Science,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { projectsAPI, type ExploreData } from '../../utils/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardMetric {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface CohortOption {
  id: string;
  label: string;
  description: string;
  count?: number;
}

const ExplorationDashboard: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState<CohortOption | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'uni' | 'bi' | 'predictive'>('uni');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock cohort options
  const cohortOptions: CohortOption[] = [
    { id: 'all', label: 'All Patients', description: 'Complete patient dataset', count: 12450 },
    { id: 'hypertension', label: 'I10_Hypertension', description: 'Patients with hypertension', count: 3420 },
    { id: 'asthma', label: 'J45_Asthma', description: 'Patients with asthma', count: 1850 },
    { id: 'reflux', label: 'K21_Reflux', description: 'Gastroesophageal reflux patients', count: 920 },
    { id: 'diabetes', label: 'E11_Type2Diabetes', description: 'Type 2 diabetes patients', count: 2140 },
    { id: 'smokers', label: 'Smokers', description: 'Patients who smoke', count: 1680 },
    { id: 'seniors', label: 'Age > 65', description: 'Senior patients', count: 4250 },
    { id: 'obese', label: 'BMI > 30', description: 'Obese patients', count: 3850 },
  ];

  // Mock dashboard metrics
  const dashboardMetrics: DashboardMetric[] = [
    {
      label: 'Total Patients',
      value: '12,450',
      change: '+5.2%',
      icon: <Group />,
      color: 'primary',
    },
    {
      label: 'Average Age',
      value: '54.2',
      change: '+1.1%',
      icon: <LocalHospital />,
      color: 'secondary',
    },
    {
      label: 'Active Conditions',
      value: '847',
      change: '+12.3%',
      icon: <Science />,
      color: 'success',
    },
    {
      label: 'Avg BMI',
      value: '27.8',
      change: '-0.8%',
      icon: <Assessment />,
      color: 'warning',
    },
  ];

  // Mock chart data
  const ageDistributionData = {
    labels: ['18-30', '31-45', '46-60', '61-75', '75+'],
    datasets: [
      {
        label: 'Patient Count',
        data: [1250, 2840, 3920, 3200, 1240],
        backgroundColor: [
          'hsl(210, 79%, 46%)',
          'hsl(174, 72%, 56%)',
          'hsl(142, 76%, 36%)',
          'hsl(45, 93%, 47%)',
          'hsl(0, 84%, 60%)',
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
      },
    ],
  };

  const conditionDistributionData = {
    labels: ['Hypertension', 'Diabetes', 'Asthma', 'Reflux', 'Other'],
    datasets: [
      {
        data: [3420, 2140, 1850, 920, 4120],
        backgroundColor: [
          'hsl(210, 79%, 46%)',
          'hsl(174, 72%, 56%)',
          'hsl(142, 76%, 36%)',
          'hsl(45, 93%, 47%)',
          'hsl(0, 84%, 60%)',
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  };

  const bmiTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Average BMI',
        data: [28.2, 28.1, 27.9, 27.8, 27.7, 27.8, 27.9, 28.0, 27.8, 27.6, 27.5, 27.8],
        borderColor: 'hsl(174, 72%, 56%)',
        backgroundColor: 'hsl(174, 72%, 56% / 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'hsl(174, 72%, 56%)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Target BMI',
        data: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'hsl(210, 79%, 46%)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
  };

  // Mutations
  const exploreDataMutation = useMutation({
    mutationFn: (data: ExploreData) =>
      projectsAPI.explore('healthcare-clean-room', data.metric, {
        cohort: data.cohort,
        attributes: data.attributes,
      }),
    onMutate: () => setIsAnalyzing(true),
    onSettled: () => setIsAnalyzing(false),
  });

  const handleAnalyze = () => {
    if (selectedCohort) {
      exploreDataMutation.mutate({
        metric: selectedMetric,
        cohort: selectedCohort.id,
        attributes: ['age', 'bmi', 'hba1c', 'blood_pressure'],
      });
    }
  };

  const handleMetricChange = (
    event: React.MouseEvent<HTMLElement>,
    newMetric: 'uni' | 'bi' | 'predictive' | null,
  ) => {
    if (newMetric) {
      setSelectedMetric(newMetric);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'var(--gradient-hero)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Exploration Dashboard
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Analyze merged healthcare data with privacy-preserving insights
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="Federated Data"
                color="secondary"
                variant="filled"
                icon={<Group />}
              />
              <Chip
                label={`Analysis: ${selectedMetric.toUpperCase()}`}
                color="primary"
                variant="filled"
                icon={<TrendingUp />}
              />
              <Chip
                label={selectedCohort ? selectedCohort.label : 'No Cohort Selected'}
                color={selectedCohort ? 'success' : 'default'}
                variant="filled"
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Analysis Controls
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'end' }}>
            {/* Cohort Selector */}
            <Autocomplete
              sx={{ minWidth: 300 }}
              options={cohortOptions}
              value={selectedCohort}
              onChange={(event, newValue) => setSelectedCohort(newValue)}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} label="Select Cohort" variant="outlined" />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {option.label}
                      </Typography>
                      {option.count && (
                        <Chip
                          label={`${option.count.toLocaleString()} patients`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Metric Toggle */}
            <ToggleButtonGroup
              value={selectedMetric}
              exclusive
              onChange={handleMetricChange}
              aria-label="analysis metric"
            >
              <ToggleButton value="uni" aria-label="univariate">
                <BarChart sx={{ mr: 1 }} />
                Univariate
              </ToggleButton>
              <ToggleButton value="bi" aria-label="bivariate">
                <Timeline sx={{ mr: 1 }} />
                Bivariate
              </ToggleButton>
              <ToggleButton value="predictive" aria-label="predictive">
                <TrendingUp sx={{ mr: 1 }} />
                Predictive
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Analyze Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Assessment />}
              onClick={handleAnalyze}
              disabled={!selectedCohort || isAnalyzing}
              sx={{
                minWidth: 150,
                background: 'var(--gradient-primary)',
                '&:hover': {
                  background: 'var(--gradient-secondary)',
                },
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Box>

          {exploreDataMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Analysis failed: {(exploreDataMutation.error as any)?.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Metrics */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {dashboardMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ flex: '1 1 200px', minWidth: '200px' }}
          >
            <Card
              sx={{
                background: 'var(--gradient-surface)',
                border: `2px solid hsl(var(--${metric.color}))`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 'var(--shadow-lg)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: `hsl(var(--${metric.color}) / 0.1)`,
                      color: `hsl(var(--${metric.color}))`,
                      mr: 2,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {metric.value}
                    </Typography>
                    {metric.change && (
                      <Typography
                        variant="body2"
                        color={metric.change.startsWith('+') ? 'success.main' : 'error.main'}
                      >
                        {metric.change}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {metric.label}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Analytics Charts */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {/* Age Distribution */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Age Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<Download />}>
                    Export
                  </Button>
                  <Button size="small" startIcon={<Refresh />}>
                    Refresh
                  </Button>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={ageDistributionData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Condition Distribution */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Condition Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<Download />}>
                    Export
                  </Button>
                  <Button size="small" startIcon={<Share />}>
                    Share
                  </Button>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <Pie data={conditionDistributionData} options={pieOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* BMI Trend Analysis */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                BMI Trend Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                12-month average BMI progression with target comparison
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<FilterList />}>
                Filters
              </Button>
              <Button size="small" startIcon={<Download />}>
                Export CSV
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 400 }}>
            <Line data={bmiTrendData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Correlation Matrix Placeholder */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Health Metrics Correlation Matrix
          </Typography>
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--gradient-surface)',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Science sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Advanced Analytics Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive correlation heatmap, predictive models, and risk assessment tools
              </Typography>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // This would trigger advanced analytics
                  console.log('Advanced analytics requested');
                }}
              >
                Request Analysis
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Privacy & Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> All analytics are computed using differential privacy and federated learning. 
            Individual patient data remains encrypted and never leaves the secure clean room environment. 
            Statistical insights are privacy-preserving and HIPAA compliant.
          </Typography>
        </Alert>
      </motion.div>
    </Box>
  );
};

export default ExplorationDashboard;