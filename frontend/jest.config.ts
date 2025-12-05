import { getJestProjects } from '@nx/jest';
import "jest-canvas-mock";

export default {
  projects: getJestProjects(),
  setupFiles: ["jest-canvas-mock"]
};
