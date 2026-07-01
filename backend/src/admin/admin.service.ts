import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<AdminDashboardResponseDto> {
    const [
      totalProjects,
      totalContainers,
      activeDeployments,
      totalUsers,
      containerRunning,
      containerStopped,
      containerError,
      recentProjects,
      recentActivities
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.container.count(),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.container.count({ where: { status: 'RUNNING' } }),
      this.prisma.container.count({ where: { status: 'STOPPED' } }),
      this.prisma.container.count({ where: { status: 'ERROR' } }),
      this.prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, project: true },
      }),
    ]);

    const successRate = totalProjects > 0 ? 
      Math.round((activeDeployments / totalProjects) * 100) : 100;

    const recentDeployments = recentProjects.map(p => ({
      id: `#DEP-${p.id.substring(0, 4).toUpperCase()}`,
      project: p.name,
      user: p.user.email,
      status: (p.status === 'ACTIVE' ? 'Success' : p.status === 'FAILED' ? 'Failed' : 'Building') as 'Success' | 'Failed' | 'Building',
      time: p.updatedAt.toISOString(),
      duration: '01:24', // Mocked duration for now
    }));

    const recentActivity = recentActivities.map(a => ({
      id: a.id,
      user: a.user.email,
      action: a.action,
      project: a.project?.name || 'System',
      time: a.createdAt.toISOString(),
    }));

    return {
      stats: {
        totalProjects,
        totalContainers,
        activeDeployments,
        totalUsers,
        successRate,
        runningContainers: containerRunning,
      },
      resources: {
        cpu: 45.2, // Simulated
        ram: 68.5, // Simulated
        disk: 32.1, // Simulated
        network: "1.2 GB/s", // Simulated
      },
      containerStatus: {
        active: containerRunning,
        stopped: containerStopped,
        failed: containerError,
      },
      recentDeployments,
      recentActivity,
      serviceStatus: [
        { name: "Docker Engine", status: "Active" },
        { name: "Nginx", status: "Active" },
        { name: "PostgreSQL", status: "Active" },
        { name: "SSL (Let's Encrypt)", status: "Active" },
        { name: "Web Socket", status: "Active" },
      ],
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllProjects() {
    return this.prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: { containers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
