import React, { useRef, useState, useEffect } from 'react';
import styles from './CourseConfig.module.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createModule, fetchModulesByCourse, updateModule, deleteModule } from '../../api/modules';
import { createLesson, fetchLessonsByModule, updateLesson, deleteLesson } from '../../api/lessons';

export default function CourseConfig({ open, onClose, course }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState('');
  const [lessons, setLessons] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContentType, setLessonContentType] = useState('video');
  const [lessonContentUrl, setLessonContentUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonOrder, setLessonOrder] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(null);
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [editModuleData, setEditModuleData] = useState({ title: '', description: '', order: '' });
  const [editingLesson, setEditingLesson] = useState({ moduleIdx: null, lessonIdx: null });
  const [editLessonData, setEditLessonData] = useState({ title: '', content_type: 'video', content_url: '', content_text: '', duration: '', order: '' });
  const fileInputRef = useRef();

  // Fetch and show all modules for the selected course when the dialog opens or course changes
  useEffect(() => {
    async function loadModulesAndLessons() {
      if (open && course?.id) {
        try {
          const mods = await fetchModulesByCourse(course.id || course._id);
          if (Array.isArray(mods)) {
            // Fetch lessons for each module
            const modsWithLessons = await Promise.all(
              mods.map(async (m) => {
                try {
                  const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                  return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
                } catch {
                  return { ...m, lessons: [] };
                }
              })
            );
            setModules(modsWithLessons);
          } else {
            setModules([]);
          }
        } catch (err) {
          setModules([]);
        }
      } else if (!open) {
        setModules([]);
      }
    }
    loadModulesAndLessons();
  }, [open, course]);

  // File upload handler (stub, connect to backend)
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    // TODO: Connect to backend upload endpoint
    // Example: await uploadToCloudinary(selectedFile, course.id)
    setTimeout(() => {
      setUploading(false);
      setSelectedFile(null);
      // Show success message or update state
    }, 1200);
  };

  // Module add handler
  const handleAddModule = async () => {
    if (moduleName.trim() && moduleDescription.trim() && moduleOrder.trim()) {
      const newModule = {
        title: moduleName, // changed from name to title
        description: moduleDescription,
        order: parseInt(moduleOrder, 10),
        course_id: course?.id || course?._id,
      };
      try {
        const saved = await createModule(newModule);
        setModules([
          ...modules,
          { ...saved, lessons: [] }
        ]);
        setModuleName('');
        setModuleDescription('');
        setModuleOrder('');
      } catch (err) {
        alert('Failed to save module: ' + (err?.response?.data?.error || err.message));
      }
    }
  };

  // Lesson add handler (for selected module)
  const handleAddLesson = async () => {
    if (
      lessonTitle.trim() &&
      lessonContentType &&
      lessonContentUrl.trim() &&
      (lessonContentType !== 'video' || lessonDuration.trim()) &&
      lessonOrder.trim() &&
      selectedModuleIdx !== null
    ) {
      const mod = modules[selectedModuleIdx];
      const newLesson = {
        module_id: mod.id || mod._id || mod.module_id,
        title: lessonTitle,
        content_type: lessonContentType,
        // Only send content_url for video, content_text for text
        ...(lessonContentType === 'video'
          ? { content_url: lessonContentUrl }
          : { content_text: lessonContentUrl }),
        duration: lessonContentType === 'video' ? parseInt(lessonDuration, 10) : undefined,
        order: parseInt(lessonOrder, 10),
      };
      try {
        await createLesson(newLesson);
        // After creating, reload all modules and lessons from DB
        if (course?.id) {
          const mods = await fetchModulesByCourse(course.id || course._id);
          if (Array.isArray(mods)) {
            const modsWithLessons = await Promise.all(
              mods.map(async (m) => {
                try {
                  const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                  return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
                } catch {
                  return { ...m, lessons: [] };
                }
              })
            );
            setModules(modsWithLessons);
          } else {
            setModules([]);
          }
        }
        setLessonTitle('');
        setLessonContentType('video');
        setLessonContentUrl('');
        setLessonDuration('');
        setLessonOrder('');
      } catch (err) {
        alert('Failed to save lesson: ' + (err?.response?.data?.error || err.message));
      }
    }
  };

  // Edit module handlers
  const handleEditModuleClick = (idx) => {
    setEditingModuleIdx(idx);
    const mod = modules[idx];
    setEditModuleData({
      title: mod.title || '',
      description: mod.description || '',
      order: mod.order || '',
    });
  };
  const handleEditModuleChange = (field, value) => {
    setEditModuleData((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdateModule = async (idx) => {
    const mod = modules[idx];
    try {
      await updateModule(mod.id || mod._id, {
        title: editModuleData.title,
        description: editModuleData.description,
        order: parseInt(editModuleData.order, 10),
      });
      // Reload modules/lessons
      if (course?.id) {
        const mods = await fetchModulesByCourse(course.id || course._id);
        if (Array.isArray(mods)) {
          const modsWithLessons = await Promise.all(
            mods.map(async (m) => {
              try {
                const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          setModules(modsWithLessons);
        } else {
          setModules([]);
        }
      }
      setEditingModuleIdx(null);
    } catch (err) {
      alert('Failed to update module: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Edit lesson handlers
  const handleEditLessonClick = (moduleIdx, lessonIdx) => {
    setEditingLesson({ moduleIdx, lessonIdx });
    const les = modules[moduleIdx].lessons[lessonIdx];
    setEditLessonData({
      title: les.title || '',
      content_type: les.content_type || 'video',
      content_url: les.content_url || '',
      content_text: les.content_text || '',
      duration: les.duration || '',
      order: les.order || '',
    });
  };
  const handleEditLessonChange = (field, value) => {
    setEditLessonData((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdateLesson = async (moduleIdx, lessonIdx) => {
    const les = modules[moduleIdx].lessons[lessonIdx];
    const updateData = {
      title: editLessonData.title,
      content_type: editLessonData.content_type,
      order: parseInt(editLessonData.order, 10),
      ...(editLessonData.content_type === 'video'
        ? { content_url: editLessonData.content_url, duration: parseInt(editLessonData.duration, 10) }
        : { content_text: editLessonData.content_text }),
    };
    try {
      await updateLesson(les.id || les._id, updateData);
      // Reload modules/lessons
      if (course?.id) {
        const mods = await fetchModulesByCourse(course.id || course._id);
        if (Array.isArray(mods)) {
          const modsWithLessons = await Promise.all(
            mods.map(async (m) => {
              try {
                const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          setModules(modsWithLessons);
        } else {
          setModules([]);
        }
      }
      setEditingLesson({ moduleIdx: null, lessonIdx: null });
    } catch (err) {
      alert('Failed to update lesson: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Delete module handler
  const handleDeleteModule = async (idx) => {
    const mod = modules[idx];
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await deleteModule(mod.id || mod._id);
      // Reload modules/lessons
      if (course?.id) {
        const mods = await fetchModulesByCourse(course.id || course._id);
        if (Array.isArray(mods)) {
          const modsWithLessons = await Promise.all(
            mods.map(async (m) => {
              try {
                const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          setModules(modsWithLessons);
        } else {
          setModules([]);
        }
      }
    } catch (err) {
      alert('Failed to delete module: ' + (err?.response?.data?.error || err.message));
    }
  };
  // Delete lesson handler
  const handleDeleteLesson = async (moduleIdx, lessonIdx) => {
    const les = modules[moduleIdx].lessons[lessonIdx];
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLesson(les.id || les._id);
      // Reload modules/lessons
      if (course?.id) {
        const mods = await fetchModulesByCourse(course.id || course._id);
        if (Array.isArray(mods)) {
          const modsWithLessons = await Promise.all(
            mods.map(async (m) => {
              try {
                const lessons = await fetchLessonsByModule(m.id || m._id || m.module_id);
                return { ...m, lessons: Array.isArray(lessons) ? lessons.sort((a, b) => (a.order || 0) - (b.order || 0)) : [] };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          setModules(modsWithLessons);
        } else {
          setModules([]);
        }
      }
    } catch (err) {
      alert('Failed to delete lesson: ' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth
      PaperProps={{ className: `${styles.transparentDialogPaper} ${styles.fittedDialogPaper}` }}
    >
      <DialogTitle>
        <span className={styles.paperTitle}>
          Course Configuration: {course?.title}
        </span>
      </DialogTitle>
      <DialogContent>
        <Box className={styles.configContainer}>
          {/* Modules Section */}
          <Typography variant="h6" gutterBottom>Modules</Typography>
          <div className={styles.moduleSection}>
            <Stack direction="row" className={styles.moduleStack}>
              <TextField
                label="Module Title"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                size="small"
                className={styles.textField}
              />
              <TextField
                label="Description"
                value={moduleDescription}
                onChange={e => setModuleDescription(e.target.value)}
                size="small"
                className={styles.textField}
              />
            </Stack>
            <Stack direction="row" className={styles.moduleStack}>
              <TextField
                label="Order"
                type="number"
                value={moduleOrder}
                onChange={e => setModuleOrder(e.target.value)}
                size="small"
                inputProps={{ min: 1 }}
                className={styles.orderField}
              />
              <Button variant="contained" onClick={handleAddModule} className={styles.addModuleBtn}>Add Module</Button>
            </Stack>
            <List dense>
              {modules.map((mod, idx) => (
                <Box key={idx}>
                  <ListItem className={styles.moduleListItem} selected={selectedModuleIdx === idx}>
                    <ListItemText
                      primary={<span className={styles.moduleTitle}>{`${mod.order ? mod.order + '. ' : ''}${mod.title || mod.name}`}</span>}
                      secondary={mod.description ? mod.description : undefined}
                    />
                    <span style={{ flex: 1 }} />
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedModuleIdx(selectedModuleIdx === idx ? null : idx);
                      }}
                      className={styles.expandArrowBtn}
                      aria-label={selectedModuleIdx === idx ? 'Collapse' : 'Expand'}
                    >
                      {selectedModuleIdx === idx ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    {/* Restore spacing between expand and edit/delete icons */}
                    <span style={{ width: 8 }} />
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        handleEditModuleClick(idx);
                      }}
                      aria-label="Edit Module"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteModule(idx);
                      }}
                      aria-label="Delete Module"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                  {/* Edit Module Form */}
                  {editingModuleIdx === idx && (
                    <ListItem style={{ paddingLeft: 32, background: 'rgba(60,80,120,0.10)' }}>
                      <Stack direction="row" className={styles.moduleStack}>
                        <TextField
                          label="Module Title"
                          value={editModuleData.title}
                          onChange={e => handleEditModuleChange('title', e.target.value)}
                          size="small"
                          className={styles.textField}
                        />
                        <TextField
                          label="Description"
                          value={editModuleData.description}
                          onChange={e => handleEditModuleChange('description', e.target.value)}
                          size="small"
                          className={styles.textField}
                        />
                        <TextField
                          label="Order"
                          type="number"
                          value={editModuleData.order}
                          onChange={e => handleEditModuleChange('order', e.target.value)}
                          size="small"
                          inputProps={{ min: 1 }}
                          className={styles.orderField}
                        />
                        <Button variant="contained" onClick={() => handleUpdateModule(idx)} className={styles.addModuleBtn}>Save</Button>
                        <Button variant="outlined" onClick={() => setEditingModuleIdx(null)} color="secondary">Cancel</Button>
                      </Stack>
                    </ListItem>
                  )}
                  {/* Lessons for this module */}
                  <List className={styles.lessonList} dense>
                    {(mod.lessons || []).map((les, lidx) => (
                      <ListItem key={lidx} style={{ paddingLeft: 48, paddingTop: 2, paddingBottom: 2 }}>
                        <ListItemText
                          primary={
                            <>
                              <span className={styles.lessonNumberGradient}>{`Lesson ${lidx + 1}:`}</span>
                              <span className={styles.lessonTitleSpacing}>{les.title || les.name}</span>
                            </>
                          }
                          secondary={
                            <>
                              {les.content_type && (
                                <span className={`${styles.lessonMeta} ${styles.lessonType}`}><strong>Type:</strong> {les.content_type}</span>
                              )}
                              {typeof les.order !== 'undefined' && (
                                <span className={`${styles.lessonMeta} ${styles.lessonOrder}`}><strong>Order:</strong> {les.order}</span>
                              )}
                              {les.content_type === 'video' && les.duration && (
                                <span className={`${styles.lessonMeta} ${styles.lessonDuration}`}><strong>Duration:</strong> {les.duration} min</span>
                              )}
                              {les.created_at && (
                                <span className={`${styles.lessonMeta} ${styles.lessonCreated}`}>
                                  <strong>Created:</strong> {new Date(les.created_at).toLocaleDateString('en-GB')} {new Date(les.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                                </span>
                              )}
                            </>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            handleEditLessonClick(idx, lidx);
                          }}
                          aria-label="Edit Lesson"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteLesson(idx, lidx);
                          }}
                          aria-label="Delete Lesson"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                    {/* Edit Lesson Form */}
                    {editingLesson.moduleIdx === idx && editingLesson.lessonIdx !== null && (
                      <ListItem style={{ paddingLeft: 48, background: 'rgba(60,80,120,0.10)' }}>
                        <Stack direction="row" className={styles.lessonStack}>
                          <TextField
                            label="Lesson Title"
                            value={editLessonData.title}
                            onChange={e => handleEditLessonChange('title', e.target.value)}
                            size="small"
                            required
                            className={styles.textField}
                          />
                          {editLessonData.content_type === 'video' && (
                            <TextField
                              label="Duration (min)"
                              type="number"
                              value={editLessonData.duration}
                              onChange={e => handleEditLessonChange('duration', e.target.value)}
                              size="small"
                              inputProps={{ min: 1 }}
                              required
                              className={styles.durationField}
                            />
                          )}
                          <TextField
                            label="Order"
                            type="number"
                            value={editLessonData.order}
                            onChange={e => handleEditLessonChange('order', e.target.value)}
                            size="small"
                            inputProps={{ min: 1 }}
                            required
                            className={styles.orderField}
                          />
                        </Stack>
                        <Stack direction="row" className={styles.lessonStack}>
                          <Select
                            value={editLessonData.content_type}
                            onChange={e => handleEditLessonChange('content_type', e.target.value)}
                            size="small"
                            required
                            displayEmpty
                            className={styles.selectField}
                          >
                            <MenuItem value="video">Video</MenuItem>
                            <MenuItem value="text">Text</MenuItem>
                          </Select>
                          {editLessonData.content_type === 'text' ? (
                            <TextField
                              label="Content Text"
                              value={editLessonData.content_text}
                              onChange={e => handleEditLessonChange('content_text', e.target.value)}
                              size="small"
                              required
                              className={`${styles.textField} ${styles.contentTextField}`}
                              multiline
                              minRows={4}
                              maxRows={10}
                            />
                          ) : (
                            <TextField
                              label="Content URL"
                              value={editLessonData.content_url}
                              onChange={e => handleEditLessonChange('content_url', e.target.value)}
                              size="small"
                              required
                              className={styles.textField}
                            />
                          )}
                          <Button variant="contained" onClick={() => handleUpdateLesson(editingLesson.moduleIdx, editingLesson.lessonIdx)} className={styles.addLessonBtn}>Save</Button>
                          <Button variant="outlined" onClick={() => setEditingLesson({ moduleIdx: null, lessonIdx: null })} color="secondary">Cancel</Button>
                        </Stack>
                      </ListItem>
                    )}
                    {/* Add Lesson to this module if selected */}
                    {selectedModuleIdx === idx && (
                      <ListItem style={{ paddingLeft: 48, paddingTop: 2, paddingBottom: 2, border: 'none', background: 'none' }} disableGutters>
                        <div className={styles.lessonSection} style={{ width: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Add Lesson to Module: {mod.title || mod.name}
                          </Typography>
                          <Stack direction="row" className={styles.lessonStack}>
                            <TextField
                              label="Lesson Title"
                              value={lessonTitle}
                              onChange={e => setLessonTitle(e.target.value)}
                              size="small"
                              required
                              className={styles.textField}
                            />
                            {lessonContentType === 'video' && (
                              <TextField
                                label="Duration (min)"
                                type="number"
                                value={lessonDuration}
                                onChange={e => setLessonDuration(e.target.value)}
                                size="small"
                                inputProps={{ min: 1 }}
                                required
                                className={styles.durationField}
                              />
                            )}
                            <TextField
                              label="Order"
                              type="number"
                              value={lessonOrder}
                              onChange={e => setLessonOrder(e.target.value)}
                              size="small"
                              inputProps={{ min: 1 }}
                              required
                              className={styles.orderField}
                            />
                          </Stack>
                          <Stack direction="row" className={styles.lessonStack}>
                            <Select
                              value={lessonContentType}
                              onChange={e => setLessonContentType(e.target.value)}
                              size="small"
                              required
                              displayEmpty
                              className={styles.selectField}
                            >
                              <MenuItem value="video">Video</MenuItem>
                              <MenuItem value="text">Text</MenuItem>
                            </Select>
                            {lessonContentType === 'text' ? (
                              <TextField
                                label="Content Text"
                                value={lessonContentUrl}
                                onChange={e => setLessonContentUrl(e.target.value)}
                                size="small"
                                required
                                className={`${styles.textField} ${styles.contentTextField}`}
                                multiline
                                minRows={4}
                                maxRows={10}
                              />
                            ) : (
                              <TextField
                                label="Content URL"
                                value={lessonContentUrl}
                                onChange={e => setLessonContentUrl(e.target.value)}
                                size="small"
                                required
                                className={styles.textField}
                              />
                            )}
                            <Button variant="contained" onClick={handleAddLesson} className={styles.addLessonBtn}>Add Lesson</Button>
                          </Stack>
                        </div>
                      </ListItem>
                    )}
                  </List>
                  <div className={styles.gradientDivider} />
                </Box>
              ))}
            </List>
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
