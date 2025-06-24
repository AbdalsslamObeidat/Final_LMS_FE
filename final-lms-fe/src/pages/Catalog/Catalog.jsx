import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchCourses } from '../../api/authApi';

export default function Catalog() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses().then(data => setCourses(data.courses || []));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Course Catalog</Typography>
      <Grid container spacing={2}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>
                <Typography variant="body2">{course.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}