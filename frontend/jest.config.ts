import { getJestProjectsAsync } from '@nx/jest';
import "jest-canvas-mock";

export default async () => ({
  projects: await getJestProjectsAsync(),
  setupFiles: ["jest-canvas-mock"]
});
