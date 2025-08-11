import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Storage,
  CloudUpload,
  FileUpload,
  Delete,
  Refresh,
  Preview,
  Send,
  Add,
  Remove,
  ExpandMore,
  DataUsage,
  Security,
  History,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, type ProjectConfig } from '../../utils/api';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  preview?: any[][];
  timestamp: Date;
}

interface UploadHistory {
  id: string;
  projectId: string;
  fileName: string;
  rows: number;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  message?: string;
}

const DataIngestion: React.FC = () => {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; file?: UploadedFile }>({
    open: false,
  });
  
  // Project configuration state
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    pid: 'healthcare-clean-room',
    type: 'cpu',
    persist: true,
    enableHistogram: true,
    targetList: ['age', 'bmi'],
    condList: ['smoker', 'diagnosis:I10_Hypertension'],
  });

  // Upload history (mock data)
  const [uploadHistory] = useState<UploadHistory[]>([
    {
      id: '1',
      projectId: 'healthcare-clean-room',
      fileName: 'peer_A_patients.csv',
      rows: 1250,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success',
    },
    {
      id: '2',
      projectId: 'healthcare-clean-room',
      fileName: 'peer_B_patients.csv',
      rows: 980,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'success',
    },
  ]);

  // Mutations
  const initializeProjectMutation = useMutation({
    mutationFn: () =>
      projectsAPI.create({
        pid: projectConfig.pid,
        type: projectConfig.type,
        persist: projectConfig.persist,
        enableHistogram: projectConfig.enableHistogram,
        extra: {
          sml_project_autosave: 'true',
          sml_project_target_list: projectConfig.targetList.join(','),
          sml_project_cond_list: projectConfig.condList.join(','),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const pushDataMutation = useMutation({
    mutationFn: (data: { projectId: string; csvContent: string }) =>
      projectsAPI.pushData(data.projectId, data.csvContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadHistory'] });
    },
  });

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const csvContent = reader.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        const preview = lines.slice(0, 6).map(line => line.split(','));
        
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          content: csvContent,
          preview,
          timestamp: new Date(),
        };
        
        setUploadedFiles(prev => [...prev, uploadedFile]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const previewFile = (file: UploadedFile) => {
    setPreviewDialog({ open: true, file });
  };

  const pushToCleanRoom = (file: UploadedFile) => {
    pushDataMutation.mutate({
      projectId: projectConfig.pid,
      csvContent: file.content,
    });
  };

  const addTarget = () => {
    setProjectConfig(prev => ({
      ...prev,
      targetList: [...prev.targetList, ''],
    }));
  };

  const removeTarget = (index: number) => {
    setProjectConfig(prev => ({
      ...prev,
      targetList: prev.targetList.filter((_, i) => i !== index),
    }));
  };

  const updateTarget = (index: number, value: string) => {
    setProjectConfig(prev => ({
      ...prev,
      targetList: prev.targetList.map((item, i) => (i === index ? value : item)),
    }));
  };

  const addCondition = () => {
    setProjectConfig(prev => ({
      ...prev,
      condList: [...prev.condList, ''],
    }));
  };

  const removeCondition = (index: number) => {
    setProjectConfig(prev => ({
      ...prev,
      condList: prev.condList.filter((_, i) => i !== index),
    }));
  };

  const updateCondition = (index: number, value: string) => {
    setProjectConfig(prev => ({
      ...prev,
      condList: prev.condList.map((item, i) => (i === index ? value : item)),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'var(--gradient-secondary)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Storage sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Data Ingestion
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Securely push healthcare data to the clean room
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Project: ${projectConfig.pid}`}
                color="primary"
                variant="filled"
              />
              <Chip
                label={`Type: ${projectConfig.type.toUpperCase()}`}
                color="secondary"
                variant="filled"
              />
              <Chip
                label={uploadedFiles.length > 0 ? `${uploadedFiles.length} Files Ready` : 'No Files'}
                color={uploadedFiles.length > 0 ? 'success' : 'default'}
                icon={<FileUpload />}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Project Configuration */}
        <Box sx={{ flex: '1 1 350px', minWidth: '350px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <DataUsage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Project Configuration
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={projectConfig.pid}
                  onChange={(e) =>
                    setProjectConfig({ ...projectConfig, pid: e.target.value })
                  }
                  helperText="Unique identifier for this project"
                />

                <FormControl fullWidth>
                  <InputLabel>Processing Type</InputLabel>
                  <Select
                    value={projectConfig.type}
                    onChange={(e) =>
                      setProjectConfig({ ...projectConfig, type: e.target.value as 'cpu' | 'gpu' })
                    }
                  >
                    <MenuItem value="cpu">CPU (Standard)</MenuItem>
                    <MenuItem value="gpu">GPU (Accelerated)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={projectConfig.persist}
                      onChange={(e) =>
                        setProjectConfig({ ...projectConfig, persist: e.target.checked })
                      }
                    />
                  }
                  label="Persist Data"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={projectConfig.enableHistogram}
                      onChange={(e) =>
                        setProjectConfig({ ...projectConfig, enableHistogram: e.target.checked })
                      }
                    />
                  }
                  label="Enable Histogram"
                />

                <Button
                  variant="contained"
                  onClick={() => initializeProjectMutation.mutate()}
                  disabled={initializeProjectMutation.isPending}
                  startIcon={<Add />}
                  fullWidth
                >
                  {initializeProjectMutation.isPending ? 'Initializing...' : 'Initialize Project'}
                </Button>

                {initializeProjectMutation.isPending && <LinearProgress />}

                {initializeProjectMutation.isError && (
                  <Alert severity="error">
                    Failed to initialize project: {(initializeProjectMutation.error as any)?.message}
                  </Alert>
                )}

                {initializeProjectMutation.isSuccess && (
                  <Alert severity="success">
                    Project initialized successfully!
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight={600}>
                    Advanced Configuration
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Target List */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Target Attributes
                      </Typography>
                      {projectConfig.targetList.map((target, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="e.g., age, bmi, hba1c"
                            value={target}
                            onChange={(e) => updateTarget(index, e.target.value)}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeTarget(index)}
                            color="error"
                          >
                            <Remove />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" startIcon={<Add />} onClick={addTarget}>
                        Add Target
                      </Button>
                    </Box>

                    {/* Condition List */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Condition Attributes
                      </Typography>
                      {projectConfig.condList.map((condition, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="e.g., smoker, diagnosis:I10_Hypertension"
                            value={condition}
                            onChange={(e) => updateCondition(index, e.target.value)}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeCondition(index)}
                            color="error"
                          >
                            <Remove />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" startIcon={<Add />} onClick={addCondition}>
                        Add Condition
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Box>

        {/* File Upload Area */}
        <Box sx={{ flex: '2 1 600px', minWidth: '600px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <FileUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                CSV File Upload
              </Typography>

              {/* Drag & Drop Zone */}
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  backgroundColor: isDragActive ? 'action.hover' : 'transparent',
                  transition: 'all 0.3s ease',
                  mb: 3,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop files here...' : 'Drag & drop CSV files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or click to select files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports multiple CSV files with healthcare data
                </Typography>
              </Paper>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Uploaded Files ({uploadedFiles.length})
                  </Typography>
                  <List>
                    <AnimatePresence>
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ListItem
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              mb: 1,
                              background: 'var(--gradient-surface)',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" fontWeight={600}>
                                    {file.name}
                                  </Typography>
                                  <Chip label={formatFileSize(file.size)} size="small" />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Uploaded: {file.timestamp.toLocaleString()}
                                  </Typography>
                                  {file.preview && (
                                    <Typography variant="body2" color="text.secondary">
                                      Rows: ~{file.content.split('\n').length - 1} | 
                                      Columns: {file.preview[0]?.length || 0}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Preview Data">
                                  <IconButton onClick={() => previewFile(file)} color="primary">
                                    <Preview />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Push to Clean Room">
                                  <IconButton
                                    onClick={() => pushToCleanRoom(file)}
                                    color="secondary"
                                    disabled={pushDataMutation.isPending}
                                  >
                                    <Send />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove">
                                  <IconButton
                                    onClick={() => removeFile(file.id)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </List>

                  {/* Bulk Actions */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => {
                        uploadedFiles.forEach(file => pushToCleanRoom(file));
                      }}
                      disabled={pushDataMutation.isPending}
                    >
                      Push All to Clean Room
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => setUploadedFiles([])}
                      color="error"
                    >
                      Clear All
                    </Button>
                  </Box>

                  {pushDataMutation.isPending && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Pushing data to clean room...
                      </Typography>
                    </Box>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Upload History */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upload History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell align="right">Rows</TableCell>
                      <TableCell align="right">Timestamp</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.fileName}</TableCell>
                        <TableCell align="right">{item.rows.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {item.timestamp.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={item.status}
                            color={item.status === 'success' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Re-push">
                            <IconButton size="small" color="primary">
                              <Refresh />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Alert severity="info" sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Privacy Protection:</strong> All uploaded data is processed with differential privacy 
              and never leaves your secure environment in raw form. Only privacy-preserving statistics 
              are shared through the federation.
            </Typography>
          </Box>
        </Alert>
      </motion.div>

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Preview sx={{ mr: 1 }} />
            Data Preview: {previewDialog.file?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file?.preview && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {previewDialog.file.preview[0]?.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 600 }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewDialog.file.preview.slice(1, 6).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Showing first 5 rows of data. Total rows: {previewDialog.file?.content.split('\n').length || 0 - 1}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false })}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => {
              if (previewDialog.file) {
                pushToCleanRoom(previewDialog.file);
                setPreviewDialog({ open: false });
              }
            }}
            disabled={pushDataMutation.isPending}
          >
            Push to Clean Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataIngestion;