import axios from './axiosInstance';

export async function createLesson(lesson) {
  // expects lesson: { module_id, title, content_type, content_url, duration, order }
  const { data } = await axios.post('/lessons/create', lesson);
  return data;
}

export async function fetchLessonsByModule(moduleId) {
  const { data } = await axios.get(`/lessons/module/${moduleId}`);
  return data;
}

export async function updateLesson(id, lesson) {
  // expects lesson: { title, content_type, content_url/content_text, duration, order }
  const { data } = await axios.put(`/lessons/update/${id}`, lesson);
  return data;
}

export async function deleteLesson(id) {
  const { data } = await axios.delete(`/lessons/delete/${id}`);
  return data;
}
