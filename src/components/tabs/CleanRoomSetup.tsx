import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Security,
  GroupAdd,
  PlayArrow,
  Stop,
  Refresh,
  ContentCopy,
  QrCode,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { federationAPI, type FederationConfig, type SyncStats } from '../../utils/api';

const CleanRoomSetup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const queryClient = useQueryClient();

  // Form states
  const [federationConfig, setFederationConfig] = useState<FederationConfig>({
    pid: 'clean-room-1',
    natsHosts: 'nats://charm:4222',
    syncSchedule: 'm1',
  });
  
  const [invitePassword, setInvitePassword] = useState('passwd66');
  const [generatedInvite, setGeneratedInvite] = useState<string>('');
  const [inviteJson, setInviteJson] = useState('');

  // Mutations
  const createFederationMutation = useMutation({
    mutationFn: federationAPI.create,
    onSuccess: () => {
      setActiveStep(1);
      queryClient.invalidateQueries({ queryKey: ['federation'] });
    },
  });

  const generateInviteMutation = useMutation({
    mutationFn: (data: { password: string }) =>
      federationAPI.generateInvite(federationConfig.pid, data),
    onSuccess: (response) => {
      setGeneratedInvite(JSON.stringify(response.data, null, 2));
      setActiveStep(2);
    },
  });

  const joinFederationMutation = useMutation({
    mutationFn: (data: { pid: string; inviteJson: string }) =>
      federationAPI.join(data),
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const startPulsingMutation = useMutation({
    mutationFn: () => federationAPI.startPulsing(federationConfig.pid),
    onSuccess: () => setIsPulsing(true),
  });

  const stopPulsingMutation = useMutation({
    mutationFn: () => federationAPI.stopPulsing(federationConfig.pid),
    onSuccess: () => setIsPulsing(false),
  });

  // Query for sync stats
  const { data: syncStats } = useQuery({
    queryKey: ['syncStats', federationConfig.pid],
    queryFn: () => federationAPI.getSyncStats(federationConfig.pid),
    refetchInterval: isPulsing ? 10000 : false,
    enabled: isPulsing,
  });

  const steps = [
    {
      label: 'Configure Clean Room',
      description: 'Set up federation parameters',
      icon: <Security />,
    },
    {
      label: 'Generate Invite',
      description: 'Create secure invitation',
      icon: <QrCode />,
    },
    {
      label: 'Join Federation',
      description: 'Connect to clean room',
      icon: <GroupAdd />,
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'connected':
      case 'success':
        return 'success';
      case 'warning':
      case 'pending':
        return 'warning';
      case 'error':
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'var(--gradient-primary)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Clean Room Setup
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Privacy-preserving healthcare data federation management
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Federation: ${federationConfig.pid}`}
                color="secondary"
                variant="filled"
              />
              <Chip
                label={isPulsing ? 'PULSING ACTIVE' : 'PULSING STOPPED'}
                color={isPulsing ? 'success' : 'default'}
                icon={isPulsing ? <PlayArrow /> : <Stop />}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Setup Wizard */}
        <Box sx={{ flex: '2 1 600px', minWidth: '600px' }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Federation Setup Wizard
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Configure Clean Room */}
                <Step>
                  <StepLabel
                    icon={
                      <Badge
                        badgeContent={createFederationMutation.isSuccess ? <CheckCircle /> : null}
                        color="success"
                      >
                        <Security />
                      </Badge>
                    }
                  >
                    <Typography variant="h6">Configure Clean Room</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Set up federation parameters and NATS configuration
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            sx={{ flex: '1 1 300px' }}
                            label="Federation PID"
                            value={federationConfig.pid}
                            onChange={(e) =>
                              setFederationConfig({ ...federationConfig, pid: e.target.value })
                            }
                            helperText="Unique identifier for your clean room"
                          />
                          <TextField
                            sx={{ flex: '1 1 300px' }}
                            label="NATS Hosts"
                            value={federationConfig.natsHosts}
                            onChange={(e) =>
                              setFederationConfig({ ...federationConfig, natsHosts: e.target.value })
                            }
                            helperText="NATS server connection string"
                          />
                        </Box>
                        <Box sx={{ maxWidth: '300px' }}>
                          <FormControl fullWidth>
                            <InputLabel>Sync Schedule</InputLabel>
                            <Select
                              value={federationConfig.syncSchedule}
                              onChange={(e) =>
                                setFederationConfig({
                                  ...federationConfig,
                                  syncSchedule: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="m1">Every 1 minute</MenuItem>
                              <MenuItem value="m5">Every 5 minutes</MenuItem>
                              <MenuItem value="h1">Every 1 hour</MenuItem>
                              <MenuItem value="h6">Every 6 hours</MenuItem>
                              <MenuItem value="d1">Daily</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </Box>

                    {createFederationMutation.isError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Failed to create federation: {(createFederationMutation.error as any)?.message}
                      </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => createFederationMutation.mutate(federationConfig)}
                        disabled={createFederationMutation.isPending}
                        startIcon={<Security />}
                        sx={{ mr: 1 }}
                      >
                        {createFederationMutation.isPending ? 'Creating...' : 'Create Clean Room'}
                      </Button>
                      {createFederationMutation.isPending && (
                        <LinearProgress sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: Generate Invite */}
                <Step>
                  <StepLabel
                    icon={
                      <Badge
                        badgeContent={generateInviteMutation.isSuccess ? <CheckCircle /> : null}
                        color="success"
                      >
                        <QrCode />
                      </Badge>
                    }
                  >
                    <Typography variant="h6">Generate Secure Invite</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create encrypted invitation for federation members
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Invite Password"
                        type={showPassword ? 'text' : 'password'}
                        value={invitePassword}
                        onChange={(e) => setInvitePassword(e.target.value)}
                        helperText="Secure password for federation access"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      {generatedInvite && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              background: 'var(--gradient-surface)',
                              border: '1px solid',
                              borderColor: 'primary.main',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                Generated Invitation
                              </Typography>
                              <Tooltip title="Copy to clipboard">
                                <IconButton
                                  onClick={() => copyToClipboard(generatedInvite)}
                                  color="primary"
                                >
                                  <ContentCopy />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={6}
                                  value={generatedInvite}
                                  variant="outlined"
                                  InputProps={{ readOnly: true }}
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      fontFamily: 'monospace',
                                      fontSize: '0.8rem',
                                    },
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <QRCode
                                  value={generatedInvite}
                                  size={120}
                                  level="M"
                                  includeMargin
                                />
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                  QR Code
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </motion.div>
                      )}
                    </Box>

                    {generateInviteMutation.isError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Failed to generate invite: {(generateInviteMutation.error as any)?.message}
                      </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => generateInviteMutation.mutate({ password: invitePassword })}
                        disabled={generateInviteMutation.isPending || !createFederationMutation.isSuccess}
                        startIcon={<QrCode />}
                        sx={{ mr: 1 }}
                      >
                        {generateInviteMutation.isPending ? 'Generating...' : 'Generate Invite'}
                      </Button>
                      {generateInviteMutation.isPending && (
                        <LinearProgress sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Join Federation */}
                <Step>
                  <StepLabel
                    icon={
                      <Badge
                        badgeContent={joinFederationMutation.isSuccess ? <CheckCircle /> : null}
                        color="success"
                      >
                        <GroupAdd />
                      </Badge>
                    }
                  >
                    <Typography variant="h6">Join Clean Room</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect using invitation from federation leader
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Invitation JSON"
                        multiline
                        rows={8}
                        value={inviteJson}
                        onChange={(e) => setInviteJson(e.target.value)}
                        placeholder="Paste the invitation JSON here..."
                        helperText="Paste the complete invitation JSON from the federation leader"
                        sx={{
                          mb: 2,
                          '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                          },
                        }}
                      />
                    </Box>

                    {joinFederationMutation.isError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Failed to join federation: {(joinFederationMutation.error as any)?.message}
                      </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          joinFederationMutation.mutate({
                            pid: `${federationConfig.pid}-peer`,
                            inviteJson,
                          })
                        }
                        disabled={joinFederationMutation.isPending || !inviteJson.trim()}
                        startIcon={<GroupAdd />}
                        sx={{ mr: 1 }}
                      >
                        {joinFederationMutation.isPending ? 'Joining...' : 'Join Clean Room'}
                      </Button>
                      {joinFederationMutation.isPending && (
                        <LinearProgress sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Box>

        {/* Control Panel */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Federation Controls
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPulsing}
                      onChange={(e) => {
                        if (e.target.checked) {
                          startPulsingMutation.mutate();
                        } else {
                          stopPulsingMutation.mutate();
                        }
                      }}
                      disabled={startPulsingMutation.isPending || stopPulsingMutation.isPending}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Sync Pulsing
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable real-time DEM merging
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={isPulsing ? <Stop /> : <PlayArrow />}
                  onClick={() => {
                    if (isPulsing) {
                      stopPulsingMutation.mutate();
                    } else {
                      startPulsingMutation.mutate();
                    }
                  }}
                  disabled={startPulsingMutation.isPending || stopPulsingMutation.isPending}
                  fullWidth
                >
                  {isPulsing ? 'Stop Pulsing' : 'Start Pulsing'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['syncStats'] })}
                  fullWidth
                >
                  Refresh Stats
                </Button>
              </Box>

              {/* Sync Stats */}
              {syncStats && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Live Sync Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {syncStats.data?.map((stat: SyncStats, index: number) => (
                        <Paper key={index} sx={{ p: 2, background: 'var(--gradient-surface)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(stat.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Chip
                              label={stat.status}
                              color={getStatusColor(stat.status) as any}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Merged: {stat.mergedCount} records
                          </Typography>
                          {stat.errors && stat.errors.length > 0 && (
                            <Typography variant="caption" color="error">
                              Errors: {stat.errors.join(', ')}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              )}

              {/* Status Information */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Privacy Information
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    All data remains encrypted and privacy-preserving throughout the federation process.
                    Individual patient data is never shared directly.
                  </Typography>
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2">End-to-end encryption</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2">HIPAA compliant</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="body2">Differential privacy enabled</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CleanRoomSetup;