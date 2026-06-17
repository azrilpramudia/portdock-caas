import api from "@/lib/api";

export const terminalLogsService = {
  getLogs: async (containerId: string) => {
    const res = await api.get(`/terminal-logs/${containerId}`);
    return res.data;
  }
};
