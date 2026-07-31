export interface User {
  id: string;
  email: string;
  name: string;
  githubUsername?: string;
  sshPublicKey?: string;
  role: "USER" | "ADMIN";
  isTwoFactorEnabled?: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActive: string;
  expiresAt: string;
  createdAt: string;
  isCurrent?: boolean;
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
  status: "RUNNING" | "STOPPED" | "BUILDING" | "ERROR" | "FAILED";
  createdAt: string;
  updatedAt: string;
  project?: Project;
  networkAllocations?: { ipAddress: string; hostPort: number }[];
  internalPort?: number;
  memoryLimit?: number;
  cpuLimit?: number;
  restartPolicy?: string;
  volumeMountPath?: string;
}

export interface ProjectEnvironment {
  id: string;
  projectId: string;
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: "PENDING" | "BUILDING" | "SUCCESS" | "FAILED";
  commitHash?: string;
  commitMessage?: string;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  deploymentType: "ZIP" | "GITHUB" | "DOCKERFILE";
  repositoryUrl?: string;
  branch?: string;
  domain?: string;
  status: "ACTIVE" | "INACTIVE" | "BUILDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
  containers?: Container[];
  envVars?: ProjectEnvironment[];
  deployments?: Deployment[];
  activityLogs?: ActivityLog[];
  buildCommand?: string;
  startCommand?: string;
  templateId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsSnapshot {
  timestamp: string;
  cpuPercent: number;
  memPercent: number;
  netRxMb: number;
  netTxMb: number;
}

export interface ManagedDatabase {
  id: string;
  userId: string;
  name: string;
  type: "POSTGRESQL" | "MYSQL";
  version: string;
  dbName: string;
  dbUser: string;
  dbPassword?: string;
  hostPort?: number;
  status: "RUNNING" | "STOPPED" | "ERROR";
  dockerContainerId?: string;
  volumeName?: string;
  memoryLimit?: number;
  cpuLimit?: number;
  maxConnections?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseBackup {
  id: string;
  databaseId: string;
  filename: string;
  sizeBytes?: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description?: string;
  createdAt: string;
  project?: Project;
  user?: { name: string; email: string };
  status?: string;
  ipAddress?: string;
}

export interface ResourceStat {
  name: string;
  cpu: number;
  memory: number;
}

export interface ContainerStats {
  cpu?: string;
  ram?: string;
  net?: string;
  disk?: string;
  [key: string]: any;
}

export interface CustomDomain {
  id: string;
  domain: string;
  projectId: string;
  status?: string;
  ssl?: boolean;
  createdAt?: string;
  project?: Project;
}
