import app from './app';
import { logInfo } from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logInfo(`Server is running on port ${PORT}`);
});

export default server; 