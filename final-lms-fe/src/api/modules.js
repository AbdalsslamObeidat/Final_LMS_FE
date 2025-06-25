import axios from './axiosInstance';

export async function createModule(module) {
  // expects module: { title, description, order, course_id }
  const { data } = await axios.post('/modules/create', module);
  return data;
}

export async function fetchModulesByCourse(courseId) {
  const { data } = await axios.get(`/modules/course/${courseId}`);
  return data;
}

export async function updateModule(id, module) {
  // expects module: { title, description, order }
  const { data } = await axios.put(`/modules/update/${id}`, module);
  return data;
}

export async function deleteModule(id) {
  const { data } = await axios.delete(`/modules/delete/${id}`);
  return data;
}
