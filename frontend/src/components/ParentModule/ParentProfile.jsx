import { useEffect, useMemo, useState } from "react";
import {
    FaCamera,
    FaCheckCircle,
    FaEdit,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhone,
    FaSave,
    FaSpinner,
    FaTimes,
    FaUser,
    FaUserShield,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "./StatsCard";

import {
    getApiErrorMessage,
    parentChildrenApi,
    parentProfileApi,
} from "../../services/api";

const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    bio: "",
    avatar: "",
};

function ParentProfile() {
    const [profile, setProfile] = useState({});
    const [children, setChildren] = useState([]);
    const [formData, setFormData] = useState(initialFormData);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] =
        useState(false);

    const [editMode, setEditMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                parentProfileApi.getProfile(),
                parentChildrenApi.getChildren(),
            ]);

            const [profileResult, childrenResult] = results;

            if (profileResult.status === "fulfilled") {
                const profileData =
                    profileResult.value?.profile ||
                    profileResult.value?.data ||
                    profileResult.value ||
                    {};

                setProfile(profileData);
                setFormData(normalizeProfile(profileData));
            } else {
                throw profileResult.reason;
            }

            if (childrenResult.status === "fulfilled") {
                const childrenData = childrenResult.value;

                setChildren(
                    Array.isArray(childrenData)
                        ? childrenData
                        : childrenData?.results ||
                        childrenData?.children ||
                        childrenData?.data ||
                        []
                );
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load parent profile."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const normalizeProfile = (profileData) => ({
        first_name:
            profileData.first_name ||
            profileData.user?.first_name ||
            "",
        last_name:
            profileData.last_name ||
            profileData.user?.last_name ||
            "",
        email:
            profileData.email ||
            profileData.user?.email ||
            "",
        phone:
            profileData.phone ||
            profileData.phone_number ||
            "",
        address:
            profileData.address ||
            profileData.street_address ||
            "",
        city: profileData.city || "",
        state:
            profileData.state ||
            profileData.region ||
            "",
        country: profileData.country || "",
        postal_code:
            profileData.postal_code ||
            profileData.zip_code ||
            "",
        bio:
            profileData.bio ||
            profileData.about ||
            "",
        avatar:
            profileData.avatar ||
            profileData.profile_image ||
            profileData.image ||
            "",
    });

    const fullName = useMemo(() => {
        const name = `${formData.first_name} ${formData.last_name}`.trim();

        return (
            name ||
            profile.username ||
            profile.user?.username ||
            "Parent"
        );
    }, [formData, profile]);

    const accountCreatedDate =
        profile.date_joined ||
        profile.created_at ||
        profile.user?.date_joined ||
        "";

    const verified =
        profile.is_verified ??
        profile.email_verified ??
        profile.user?.is_active ??
        true;

    const completedProfileFields = useMemo(() => {
        const fields = [
            formData.first_name,
            formData.last_name,
            formData.email,
            formData.phone,
            formData.address,
            formData.city,
            formData.state,
            formData.country,
            formData.bio,
            formData.avatar,
        ];

        return fields.filter(
            (field) => String(field || "").trim()
        ).length;
    }, [formData]);

    const profileCompletion = Math.round(
        (completedProfileFields / 10) * 100
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setEditMode(true);
        setError("");
        setSuccessMessage("");
    };

    const handleCancelEdit = () => {
        setFormData(normalizeProfile(profile));
        setEditMode(false);
        setError("");
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            return "First name is required.";
        }

        if (!formData.email.trim()) {
            return "Email address is required.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(formData.email)) {
            return "Enter a valid email address.";
        }

        if (
            formData.phone &&
            !/^[0-9+\-\s()]{7,20}$/.test(
                formData.phone
            )
        ) {
            return "Enter a valid phone number.";
        }

        return "";
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                postal_code: formData.postal_code.trim(),
                bio: formData.bio.trim(),
            };

            const response =
                await parentProfileApi.updateProfile(payload);

            const updatedProfile =
                response?.profile ||
                response?.data ||
                response ||
                {
                    ...profile,
                    ...payload,
                };

            setProfile(updatedProfile);

            setFormData((previous) => ({
                ...normalizeProfile(updatedProfile),
                avatar:
                    normalizeProfile(updatedProfile).avatar ||
                    previous.avatar,
            }));

            setEditMode(false);
            setSuccessMessage(
                "Profile updated successfully."
            );

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to update profile."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, PNG or WEBP image."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Profile image must be smaller than 5 MB."
            );
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setFormData((previous) => ({
            ...previous,
            avatar: previewUrl,
        }));

        try {
            setAvatarUploading(true);
            setError("");
            setSuccessMessage("");

            const uploadData = new FormData();
            uploadData.append("avatar", file);

            const response =
                await parentProfileApi.updateAvatar(uploadData);

            const avatarUrl =
                response?.avatar ||
                response?.profile_image ||
                response?.image ||
                response?.data?.avatar ||
                response?.data?.profile_image ||
                previewUrl;

            setFormData((previous) => ({
                ...previous,
                avatar: avatarUrl,
            }));

            setProfile((previous) => ({
                ...previous,
                avatar: avatarUrl,
                profile_image: avatarUrl,
            }));

            setSuccessMessage(
                "Profile picture updated successfully."
            );

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (requestError) {
            setFormData((previous) => ({
                ...previous,
                avatar:
                    profile.avatar ||
                    profile.profile_image ||
                    "",
            }));

            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to upload profile picture."
                )
            );
        } finally {
            setAvatarUploading(false);
            event.target.value = "";
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ParentSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="lg:pl-72">
                    <ParentNavbar
                        title="Parent Profile"
                        subtitle="Loading profile information"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <FaSpinner className="mx-auto animate-spin text-5xl text-rose-500" />

                            <p className="mt-4 font-medium text-slate-600">
                                Loading parent profile...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ParentSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-72">
                <ParentNavbar
                    title="Parent Profile"
                    subtitle="Manage your personal information and account details"
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

                    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-lg">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                                    <div className="relative">
                                        <img
                                            src={
                                                formData.avatar ||
                                                `https://ui-avatars.com/api/?background=ffffff&color=4f46e5&size=220&name=${encodeURIComponent(
                                                    fullName
                                                )}`
                                            }
                                            alt={fullName}
                                            className="h-32 w-32 rounded-full border-4 border-white/40 object-cover shadow-lg"
                                        />

                                        <label
                                            className={`absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-rose-500 shadow-lg transition hover:scale-105 ${avatarUploading
                                                    ? "pointer-events-none opacity-70"
                                                    : ""
                                                }`}
                                            title="Change profile picture"
                                        >
                                            {avatarUploading ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <FaCamera />
                                            )}

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                            <h1 className="text-3xl font-bold sm:text-4xl">
                                                {fullName}
                                            </h1>

                                            {verified && (
                                                <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                                                    <FaCheckCircle />
                                                    Verified
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-rose-100">
                                            {formData.email ||
                                                "No email available"}
                                        </p>

                                        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm sm:justify-start">
                                            <span className="rounded-full bg-white/15 px-4 py-2">
                                                Parent Account
                                            </span>

                                            <span className="rounded-full bg-white/15 px-4 py-2">
                                                {children.length}{" "}
                                                {children.length === 1
                                                    ? "Child"
                                                    : "Children"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!editMode && (
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-rose-600 shadow-sm hover:bg-rose-50"
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Profile Completion"
                            value={`${profileCompletion}%`}
                            icon={FaUser}
                            color="rose"
                            description="Account information"
                        />

                        <StatsCard
                            title="Children"
                            value={children.length}
                            icon={FaUserShield}
                            color="blue"
                            description="Linked child profiles"
                        />

                        <StatsCard
                            title="Account Status"
                            value={verified ? "Verified" : "Pending"}
                            icon={FaCheckCircle}
                            color="emerald"
                            description="Profile verification"
                        />

                        <StatsCard
                            title="Member Since"
                            value={
                                accountCreatedDate
                                    ? new Date(
                                        accountCreatedDate
                                    ).getFullYear()
                                    : "-"
                            }
                            icon={FaUser}
                            color="amber"
                            description="StoryNest member"
                        />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
                        <form
                            onSubmit={handleSaveProfile}
                            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Personal Information
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Update your contact and profile details.
                                    </p>
                                </div>

                                {editMode && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {saving ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <FaSave />
                                            )}

                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <ProfileInput
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    required
                                />

                                <ProfileInput
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />

                                <ProfileInput
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    icon={FaEnvelope}
                                    required
                                />

                                <ProfileInput
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    icon={FaPhone}
                                    placeholder="+1 555 123 4567"
                                />

                                <div className="md:col-span-2">
                                    <ProfileInput
                                        label="Street Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        icon={FaMapMarkerAlt}
                                    />
                                </div>

                                <ProfileInput
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />

                                <ProfileInput
                                    label="State / Region"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />

                                <ProfileInput
                                    label="Country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />

                                <ProfileInput
                                    label="Postal Code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                />

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        About You
                                    </label>

                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        rows={5}
                                        maxLength={500}
                                        placeholder="Write a short description about yourself..."
                                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${editMode
                                                ? "border-slate-300 bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                                                : "cursor-default border-slate-200 bg-slate-50 text-slate-600"
                                            }`}
                                    />

                                    <p className="mt-2 text-right text-xs text-slate-400">
                                        {formData.bio.length}/500
                                    </p>
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaSave />
                                        )}

                                        Save Profile
                                    </button>
                                </div>
                            )}
                        </form>

                        <aside className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Profile Completion
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Complete your profile for a better StoryNest
                                    experience.
                                </p>

                                <div className="mt-6 flex items-center justify-center">
                                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-slate-100">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(#4f46e5 ${profileCompletion}%, #e2e8f0 ${profileCompletion}% 100%)`,
                                            }}
                                        />

                                        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                                            <span className="text-3xl font-bold text-rose-500">
                                                {profileCompletion}%
                                            </span>

                                            <span className="mt-1 text-xs font-medium text-slate-500">
                                                Complete
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <CompletionItem
                                        label="Personal name"
                                        completed={
                                            Boolean(formData.first_name) &&
                                            Boolean(formData.last_name)
                                        }
                                    />

                                    <CompletionItem
                                        label="Email address"
                                        completed={Boolean(formData.email)}
                                    />

                                    <CompletionItem
                                        label="Phone number"
                                        completed={Boolean(formData.phone)}
                                    />

                                    <CompletionItem
                                        label="Address details"
                                        completed={
                                            Boolean(formData.address) &&
                                            Boolean(formData.city)
                                        }
                                    />

                                    <CompletionItem
                                        label="Profile picture"
                                        completed={Boolean(formData.avatar)}
                                    />

                                    <CompletionItem
                                        label="About section"
                                        completed={Boolean(formData.bio)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Account Details
                                </h2>

                                <div className="mt-5 space-y-4">
                                    <AccountDetail
                                        label="Account Type"
                                        value={
                                            profile.role ||
                                            profile.user?.role ||
                                            "Parent"
                                        }
                                    />

                                    <AccountDetail
                                        label="Username"
                                        value={
                                            profile.username ||
                                            profile.user?.username ||
                                            "Not available"
                                        }
                                    />

                                    <AccountDetail
                                        label="Joined"
                                        value={formatDate(accountCreatedDate)}
                                    />

                                    <AccountDetail
                                        label="Status"
                                        value={
                                            verified
                                                ? "Verified and Active"
                                                : "Verification Pending"
                                        }
                                    />
                                </div>
                            </div>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
}

function ProfileInput({
    label,
    name,
    value,
    onChange,
    type = "text",
    disabled = false,
    placeholder = "",
    required = false,
    icon: Icon,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <div
                className={`flex items-center gap-3 rounded-xl border px-4 transition ${disabled
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-300 bg-white focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100"
                    }`}
            >
                {Icon && (
                    <Icon className="shrink-0 text-slate-400" />
                )}

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full bg-transparent py-3 text-sm outline-none ${disabled
                            ? "cursor-default text-slate-600"
                            : "text-slate-900"
                        }`}
                />
            </div>
        </div>
    );
}

function CompletionItem({ label, completed }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">
                {label}
            </span>

            <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${completed
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
            >
                {completed ? <FaCheckCircle /> : <FaTimes />}
            </span>
        </div>
    );
}

function AccountDetail({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="text-right text-sm font-semibold capitalize text-slate-800">
                {value}
            </span>
        </div>
    );
}

export default ParentProfile;

