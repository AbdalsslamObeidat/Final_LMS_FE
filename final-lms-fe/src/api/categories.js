export async function fetchCategories() {
  const res = await fetch('/api/categories/getall');
  return res.json();
}
