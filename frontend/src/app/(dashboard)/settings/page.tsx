"use client";

import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { GithubSettings } from "@/components/settings/GithubSettings";
import { SshKeySettings } from "@/components/settings/SshKeySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DeleteAccountSettings } from "@/components/settings/DeleteAccountSettings";

export default function SettingsPage() {
  return (
    <div className="w-full pb-8">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProfileSettings />
        <PasswordSettings />
        <GithubSettings />
        <SshKeySettings />
      </div>

      {/* Full Width Bottom Section */}
      <NotificationSettings />

      {/* Danger Zone */}
      <DeleteAccountSettings />
    </div>
  );
}
