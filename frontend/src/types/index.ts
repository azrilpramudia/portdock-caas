export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Container {
  id: string;
  projectId: string;
  dockerContainerId?: string;
  name: string;
  imageName: string;
  imageTag: string;
  subdomain?: string;
  hostPort?: number;
  status: "RUNNING" | "STOPPED" | "BUILDING" | "ERROR";
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  deploymentType: "ZIP" | "GITHUB" | "DOCKERFILE";
  repositoryUrl?: string;
  domain?: string;
  status: "ACTIVE" | "INACTIVE" | "BUILDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
  containers?: Container[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
