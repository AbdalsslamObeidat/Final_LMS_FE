import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function Player() {
  const { courseId } = useParams();
  return (
    <Container>
      <Typography variant="h4">Course Player - {courseId}</Typography>
      <Typography>Lesson content, quiz, and assignment submission goes here.</Typography>
    </Container>
  );
}