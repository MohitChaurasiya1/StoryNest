import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaLock,
  FaMoon,
  FaPalette,
  FaSave,
  FaShieldAlt,
  FaSpinner,
  FaSun,
  FaTimes,
  FaTrashAlt,
  FaUserCog,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";

import {
  getApiErrorMessage,
  parentAuthApi,
  parentProfileApi,
} from "../../services/api";

const defaultSettings = {
  email_notifications: true,
  story_notifications: true,
  quiz_notifications: true,
  achievement_notifications: true,
  certificate_notifications: true,
  weekly_progress_report: true,
  reading_reminders: true,
  marketing_emails: false,
  language: "en",
  theme: "light",
  timezone: "Asia/Kolkata",
  profile_visibility: "private",
  child_progress_visibility: "parent_only",
  login_alerts: true,
};

const initialPasswordData = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function ParentSettings() {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [originalSettings, setOriginalSettings] =
    useState(defaultSettings);

  const [passwordData, setPasswordData] =
    useState(initialPasswordData);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] =
    useState(false);
  const [savingPassword, setSavingPassword] =
    useState(false);
  const [deletingAccount, setDeletingAccount] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await parentProfileApi.getSettings();

      const settingsData =
        response?.settings ||
        response?.data ||
        response ||
        {};

      const normalizedSettings = {
        ...defaultSettings,
        ...settingsData,
      };

      setSettings(normalizedSettings);
      setOriginalSettings(normalizedSettings);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load parent settings."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      setError("");
      setSuccessMessage("");

      const response =
        await parentProfileApi.updateSettings(settings);

      const updatedSettings = {
        ...settings,
        ...(response?.settings ||
          response?.data ||
          response ||
          {}),
      };

      setSettings(updatedSettings);
      setOriginalSettings(updatedSettings);

      applyTheme(updatedSettings.theme);

      setSuccessMessage(
        "Settings updated successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update settings."
        )
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
    applyTheme(originalSettings.theme);
    setError("");
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      root.classList.toggle("dark", prefersDark);
    }

    localStorage.setItem(
      "storynest-parent-theme",
      theme
    );
  };

  const handleThemeChange = (theme) => {
    setSettings((previous) => ({
      ...previous,
      theme,
    }));

    applyTheme(theme);
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    if (!passwordData.current_password) {
      return "Current password is required.";
    }

    if (!passwordData.new_password) {
      return "New password is required.";
    }

    if (passwordData.new_password.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (
      passwordData.current_password ===
      passwordData.new_password
    ) {
      return "New password must be different from the current password.";
    }

    if (
      passwordData.new_password !==
      passwordData.confirm_password
    ) {
      return "New password and confirmation do not match.";
    }

    return "";
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setSuccessMessage("");

      await parentAuthApi.changePassword({
        current_password:
          passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password:
          passwordData.confirm_password,
      });

      setPasswordData(initialPasswordData);

      setSuccessMessage(
        "Password changed successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to change password."
        )
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setError(
        'Type "DELETE" to confirm account deletion.'
      );
      return;
    }

    try {
      setDeletingAccount(true);
      setError("");

      await parentProfileApi.deleteAccount({
        confirmation: deleteConfirmation,
      });

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to delete account."
        )
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const settingsChanged =
    JSON.stringify(settings) !==
    JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ParentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-72">
          <ParentNavbar
            title="Parent Settings"
            subtitle="Loading account settings"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <FaSpinner className="mx-auto animate-spin text-5xl text-rose-500" />

              <p className="mt-4 font-medium text-slate-600">
                Loading settings...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <ParentNavbar
          title="Parent Settings"
          subtitle="Manage notifications, privacy, appearance and security"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-6 flex items-start justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-medium text-emerald-700">
              <FaCheckCircle />
              {successMessage}
            </div>
          )}

          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 text-white shadow-2xl shadow-rose-500/20 sm:p-8 relative">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-inner backdrop-blur-md">
                  <FaUserCog />
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight drop-shadow-sm">
                  Personalize Your StoryNest Experience ✨
                </h1>

                <p className="mt-2 max-w-2xl leading-relaxed text-rose-100 font-medium text-sm sm:text-base">
                  Control account notifications, privacy,
                  language, appearance and security from one
                  place.
                </p>
              </div>

              {settingsChanged && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    disabled={savingSettings}
                    className="rounded-2xl border border-white/40 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20 disabled:opacity-60 transition"
                  >
                    Reset Changes
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-extrabold text-rose-600 hover:bg-rose-50 disabled:opacity-60 shadow-lg transition"
                  >
                    {savingSettings ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}

                    Save Settings
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <SettingsSection
                icon={FaBell}
                iconClass="bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                title="Notifications"
                description="Choose which updates you want to receive."
              >
                <SettingToggle
                  label="Email Notifications"
                  description="Receive important StoryNest account updates by email."
                  checked={settings.email_notifications}
                  onChange={() =>
                    handleToggle(
                      "email_notifications"
                    )
                  }
                />

                <SettingToggle
                  label="New Story Notifications"
                  description="Receive an alert when a new story is created."
                  checked={settings.story_notifications}
                  onChange={() =>
                    handleToggle(
                      "story_notifications"
                    )
                  }
                />

                <SettingToggle
                  label="Quiz Notifications"
                  description="Receive notifications after quiz attempts."
                  checked={settings.quiz_notifications}
                  onChange={() =>
                    handleToggle(
                      "quiz_notifications"
                    )
                  }
                />

                <SettingToggle
                  label="Achievement Notifications"
                  description="Get notified when a child unlocks a badge."
                  checked={
                    settings.achievement_notifications
                  }
                  onChange={() =>
                    handleToggle(
                      "achievement_notifications"
                    )
                  }
                />

                <SettingToggle
                  label="Certificate Notifications"
                  description="Receive an alert when a certificate becomes available."
                  checked={
                    settings.certificate_notifications
                  }
                  onChange={() =>
                    handleToggle(
                      "certificate_notifications"
                    )
                  }
                />

                <SettingToggle
                  label="Weekly Progress Report"
                  description="Receive a weekly summary of children's learning progress."
                  checked={
                    settings.weekly_progress_report
                  }
                  onChange={() =>
                    handleToggle(
                      "weekly_progress_report"
                    )
                  }
                />

                <SettingToggle
                  label="Reading Reminders"
                  description="Receive reminders for scheduled reading activities."
                  checked={settings.reading_reminders}
                  onChange={() =>
                    handleToggle(
                      "reading_reminders"
                    )
                  }
                />

                <SettingToggle
                  label="Marketing Emails"
                  description="Receive product news, tips and promotional updates."
                  checked={settings.marketing_emails}
                  onChange={() =>
                    handleToggle(
                      "marketing_emails"
                    )
                  }
                />
              </SettingsSection>

              <SettingsSection
                icon={FaPalette}
                iconClass="bg-violet-100 text-violet-600"
                title="Appearance"
                description="Choose how StoryNest looks on your device."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <ThemeOption
                    icon={FaSun}
                    title="Light"
                    description="Bright appearance"
                    selected={
                      settings.theme === "light"
                    }
                    onClick={() =>
                      handleThemeChange("light")
                    }
                  />

                  <ThemeOption
                    icon={FaMoon}
                    title="Dark"
                    description="Dark appearance"
                    selected={
                      settings.theme === "dark"
                    }
                    onClick={() =>
                      handleThemeChange("dark")
                    }
                  />

                  <ThemeOption
                    icon={FaPalette}
                    title="System"
                    description="Match device"
                    selected={
                      settings.theme === "system"
                    }
                    onClick={() =>
                      handleThemeChange("system")
                    }
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                icon={FaGlobe}
                iconClass="bg-blue-100 text-blue-600"
                title="Language and Region"
                description="Set your preferred language and timezone."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <SettingsSelect
                    label="Preferred Language"
                    name="language"
                    value={settings.language}
                    onChange={handleSelectChange}
                    options={[
                      {
                        value: "en",
                        label: "English",
                      },
                      {
                        value: "hi",
                        label: "Hindi",
                      },
                      {
                        value: "en_hi",
                        label: "English + Hindi",
                      },
                    ]}
                  />

                  <SettingsSelect
                    label="Timezone"
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleSelectChange}
                    options={[
                      {
                        value: "Asia/Kolkata",
                        label:
                          "India Standard Time",
                      },
                      {
                        value: "UTC",
                        label: "UTC",
                      },
                      {
                        value:
                          "America/New_York",
                        label:
                          "Eastern Time",
                      },
                      {
                        value:
                          "America/Chicago",
                        label:
                          "Central Time",
                      },
                      {
                        value:
                          "America/Denver",
                        label:
                          "Mountain Time",
                      },
                      {
                        value:
                          "America/Los_Angeles",
                        label:
                          "Pacific Time",
                      },
                      {
                        value: "Europe/London",
                        label:
                          "London Time",
                      },
                    ]}
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                icon={FaShieldAlt}
                iconClass="bg-emerald-100 text-emerald-600"
                title="Privacy"
                description="Control who can access profile and progress information."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <SettingsSelect
                    label="Profile Visibility"
                    name="profile_visibility"
                    value={
                      settings.profile_visibility
                    }
                    onChange={handleSelectChange}
                    options={[
                      {
                        value: "private",
                        label: "Private",
                      },
                      {
                        value: "family",
                        label:
                          "Family Members",
                      },
                      {
                        value: "teachers",
                        label:
                          "Parents and Teachers",
                      },
                    ]}
                  />

                  <SettingsSelect
                    label="Child Progress Visibility"
                    name="child_progress_visibility"
                    value={
                      settings.child_progress_visibility
                    }
                    onChange={handleSelectChange}
                    options={[
                      {
                        value: "parent_only",
                        label:
                          "Parent Only",
                      },
                      {
                        value:
                          "parent_teacher",
                        label:
                          "Parent and Teacher",
                      },
                      {
                        value: "family",
                        label:
                          "Family Members",
                      },
                    ]}
                  />
                </div>

                <div className="mt-5">
                  <SettingToggle
                    label="Login Security Alerts"
                    description="Receive an email when a new device signs in."
                    checked={settings.login_alerts}
                    onChange={() =>
                      handleToggle("login_alerts")
                    }
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                icon={FaLock}
                iconClass="bg-amber-100 text-amber-600"
                title="Change Password"
                description="Use a strong password to protect your account."
              >
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-5"
                >
                  <PasswordInput
                    label="Current Password"
                    name="current_password"
                    value={
                      passwordData.current_password
                    }
                    onChange={
                      handlePasswordInputChange
                    }
                    visible={showCurrentPassword}
                    onToggleVisibility={() =>
                      setShowCurrentPassword(
                        (previous) => !previous
                      )
                    }
                  />

                  <PasswordInput
                    label="New Password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={
                      handlePasswordInputChange
                    }
                    visible={showNewPassword}
                    onToggleVisibility={() =>
                      setShowNewPassword(
                        (previous) => !previous
                      )
                    }
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    name="confirm_password"
                    value={
                      passwordData.confirm_password
                    }
                    onChange={
                      handlePasswordInputChange
                    }
                    visible={showConfirmPassword}
                    onToggleVisibility={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                  />

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-700">
                      Password requirements
                    </p>

                    <p className="mt-1">
                      Use at least 8 characters with a
                      combination of letters, numbers and
                      symbols.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition"
                    >
                      {savingPassword ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaLock />
                      )}

                      Change Password
                    </button>
                  </div>
                </form>
              </SettingsSection>

              <section className="rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="border-b border-red-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <FaTrashAlt />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-red-700">
                        Danger Zone
                      </h2>

                      <p className="text-sm text-slate-500">
                        Permanent account actions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Delete Parent Account
                    </h3>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                      This permanently deletes your profile,
                      linked preferences and account access.
                      This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(true);
                      setDeleteConfirmation("");
                      setError("");
                    }}
                    className="shrink-0 rounded-xl border border-red-300 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
                  >
                    Delete Account
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Settings Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <SummaryItem
                    label="Email Notifications"
                    value={
                      settings.email_notifications
                        ? "Enabled"
                        : "Disabled"
                    }
                  />

                  <SummaryItem
                    label="Weekly Reports"
                    value={
                      settings.weekly_progress_report
                        ? "Enabled"
                        : "Disabled"
                    }
                  />

                  <SummaryItem
                    label="Language"
                    value={
                      settings.language === "hi"
                        ? "Hindi"
                        : settings.language === "en_hi"
                        ? "English + Hindi"
                        : "English"
                    }
                  />

                  <SummaryItem
                    label="Theme"
                    value={
                      settings.theme
                        .charAt(0)
                        .toUpperCase() +
                      settings.theme.slice(1)
                    }
                  />

                  <SummaryItem
                    label="Profile"
                    value={
                      settings.profile_visibility
                        .replace("_", " ")
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-xl text-white shadow-md">
                  <FaEnvelope />
                </div>

                <h2 className="mt-4 text-lg font-bold text-rose-900 dark:text-rose-200">
                  Notification Tip
                </h2>

                <p className="mt-2 text-sm leading-6 text-rose-700 dark:text-rose-300">
                  Keep weekly progress reports enabled to
                  receive a regular summary of reading time,
                  quiz scores and achievements.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white">
                  <FaShieldAlt />
                </div>

                <h2 className="mt-4 text-lg font-bold text-emerald-900">
                  Account Security
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Enable login alerts and update your
                  password regularly to keep your account
                  secure.
                </p>
              </div>
            </aside>
          </section>

          {settingsChanged && (
            <div className="sticky bottom-4 z-30 mt-6 flex flex-col gap-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-4 shadow-xl shadow-rose-500/10 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold text-slate-700 dark:text-slate-200">
                ✨ You have unsaved settings changes.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  disabled={savingSettings}
                  className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 sm:flex-none transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 disabled:opacity-60 sm:flex-none transition"
                >
                  {savingSettings ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}

                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-red-700">
                  Delete Parent Account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This action is permanent.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteModalOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Deleting your account will remove:
                </p>

                <ul className="mt-3 space-y-2 text-sm text-red-700">
                  <li>• Parent profile information</li>
                  <li>• Notification preferences</li>
                  <li>• Account access and login details</li>
                  <li>• Parent-linked account settings</li>
                </ul>
              </div>

              <label className="mt-6 block text-sm font-semibold text-slate-700">
                Type{" "}
                <span className="font-bold text-red-600">
                  DELETE
                </span>{" "}
                to confirm
              </label>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(event) =>
                  setDeleteConfirmation(
                    event.target.value
                  )
                }
                placeholder="DELETE"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteModalOpen(false)
                }
                disabled={deletingAccount}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deletingAccount ||
                  deleteConfirmation !== "DELETE"
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAccount ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrashAlt />
                )}

                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  iconClass,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 p-6 dark:divide-slate-800">
        {children}
      </div>
    </section>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5 first:pt-0 last:pb-0">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {label}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-rose-500"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 ring-4 ring-rose-100 dark:ring-rose-900/40"
          : "border-slate-200 bg-white hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          selected
            ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md"
            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        <Icon />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </button>
  );
}

function SettingsSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  visible,
  onToggleVisibility,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100 dark:border-slate-700 dark:bg-slate-800">
        <FaLock className="text-slate-400" />

        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={
            name === "current_password"
              ? "current-password"
              : "new-password"
          }
          className="w-full bg-transparent py-3 text-sm outline-none dark:text-white"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="text-slate-400 hover:text-rose-500"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

export default ParentSettings;