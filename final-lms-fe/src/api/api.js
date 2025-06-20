export async function fetchCourses() {
  const res = await fetch('/api/courses/getall');
  return res.json();
}

export async function fetchUser() {
  const res = await fetch('/api/auth/me');
  return res.json();
}