"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export function RecentDeployments() {
  const deployments = [
    { id: "#DEP-1245", project: "E-Commerce API", user: "azril@example.com", status: "Success", time: "2 menit lalu", duration: "01:24" },
    { id: "#DEP-1244", project: "Portfolio Web", user: "budi@example.com", status: "Success", time: "15 menit lalu", duration: "02:31" },
    { id: "#DEP-1243", project: "Blog System", user: "andi@example.com", status: "Failed", time: "1 jam lalu", duration: "00:45" },
    { id: "#DEP-1242", project: "Company Profile", user: "siti@example.com", status: "Success", time: "2 jam lalu", duration: "01:12" },
    { id: "#DEP-1241", project: "Landing Page", user: "dimas@example.com", status: "Building", time: "2 jam lalu", duration: "-" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-bold text-gray-900 mb-4">Deployment Terbaru</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">ID</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Waktu</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Durasi</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((dep, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-500">{dep.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{dep.project}</td>
                <td className="px-4 py-3 text-gray-500">{dep.user}</td>
                <td className="px-4 py-3">
                  {dep.status === 'Success' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Success
                    </span>
                  )}
                  {dep.status === 'Failed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Failed
                    </span>
                  )}
                  {dep.status === 'Building' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Building
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{dep.time}</td>
                <td className="px-4 py-3 text-gray-500 font-medium">{dep.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link href="/admin/deployments" className="inline-flex items-center text-sm font-semibold text-[#0066FF] hover:text-blue-700 transition-colors">
          Lihat semua deployment <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
