import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  FaAward,
  FaCertificate,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaFilter,
  FaPrint,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrophy,
  FaUserGraduate,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "./StatsCard";

import {
  getApiErrorMessage,
  parentCertificatesApi,
  parentChildrenApi,
} from "../../services/api";

function Certificates() {
  const certificatePreviewRef = useRef(null);
  const [searchParams] = useSearchParams();

  const [children, setChildren] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [summary, setSummary] = useState({});

  const [selectedChildId, setSelectedChildId] = useState(
    searchParams.get("child") || "all"
  );
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] =
    useState(false);
  const [downloadLoadingId, setDownloadLoadingId] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewCertificate, setPreviewCertificate] =
    useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 9;

  useEffect(() => {
    loadData();
  }, [selectedChildId, searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const urlChild = searchParams.get("child");
      const activeChildId = urlChild || selectedChildId;

      const params = {};
      if (activeChildId && activeChildId !== "all") {
        params.child = activeChildId;
      }

      const results = await Promise.allSettled([
        parentChildrenApi.getChildren(),
        parentCertificatesApi.getCertificates(params),
        parentCertificatesApi.getCertificateSummary(params),
      ]);

      const [childrenResult, certificatesResult, summaryResult] = results;

      if (childrenResult.status === "fulfilled") {
        const childrenData = childrenResult.value;
        setChildren(
          Array.isArray(childrenData)
            ? childrenData
            : childrenData?.results || childrenData?.children || childrenData?.data || []
        );
      }

      if (certificatesResult.status === "fulfilled") {
        const certificateData = certificatesResult.value;
        setCertificates(
          Array.isArray(certificateData)
            ? certificateData
            : certificateData?.results || certificateData?.certificates || certificateData?.data || []
        );
      }

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value || {});
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load certificates."
        )
      );
    } finally {
      setLoading(false);
      setCertificateLoading(false);
    }
  };

  const getChildName = (child) =>
    child?.name ||
    child?.child_name ||
    child?.full_name ||
    child?.user?.first_name ||
    "Child";

  const normalizedCertificates = useMemo(() => {
    return certificates.map((certificate, index) => ({
      ...certificate,
      id: certificate.id || index,
      title:
        certificate.title ||
        certificate.certificate_title ||
        certificate.name ||
        "Certificate of Achievement",
      child_name:
        certificate.child_name ||
        certificate.child?.name ||
        certificate.child?.child_name ||
        "StoryNest Learner",
      type:
        certificate.certificate_type ||
        certificate.type ||
        certificate.category ||
        "Achievement",
      description:
        certificate.description ||
        certificate.milestone ||
        certificate.reason ||
        "Awarded for completing a StoryNest learning milestone.",
      issued_at:
        certificate.issued_at ||
        certificate.awarded_at ||
        certificate.created_at ||
        "",
      certificate_number:
        certificate.certificate_number ||
        certificate.serial_number ||
        certificate.code ||
        `SN-${String(certificate.id || index + 1).padStart(
          5,
          "0"
        )}`,
      story_title:
        certificate.story_title ||
        certificate.story?.title_en ||
        certificate.story?.title ||
        "",
      score: Number(
        certificate.score ??
          certificate.quiz_score ??
          certificate.percentage ??
          0
      ),
      pdf_url:
        certificate.pdf_url ||
        certificate.file_url ||
        certificate.download_url ||
        "",
      verified:
        certificate.verified ??
        certificate.is_verified ??
        true,
    }));
  }, [certificates]);

  const certificateTypes = useMemo(() => {
    return [
      ...new Set(
        normalizedCertificates
          .map((certificate) => certificate.type)
          .filter(Boolean)
      ),
    ];
  }, [normalizedCertificates]);

  const filteredCertificates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedCertificates.filter((certificate) => {
      const matchesSearch =
        !query ||
        certificate.title.toLowerCase().includes(query) ||
        certificate.child_name
          .toLowerCase()
          .includes(query) ||
        certificate.description
          .toLowerCase()
          .includes(query) ||
        certificate.certificate_number
          .toLowerCase()
          .includes(query) ||
        certificate.story_title
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        certificate.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [
    normalizedCertificates,
    searchTerm,
    typeFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChildId, typeFilter, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCertificates.length / certificatesPerPage
    )
  );

  const paginatedCertificates =
    filteredCertificates.slice(
      (currentPage - 1) * certificatesPerPage,
      currentPage * certificatesPerPage
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalCertificates =
    summary.total_certificates ||
    normalizedCertificates.length;

  const verifiedCertificates =
    summary.verified_certificates ||
    summary.verified ||
    normalizedCertificates.filter(
      (certificate) => certificate.verified
    ).length;

  const childrenAwarded =
    summary.children_awarded ||
    new Set(
      normalizedCertificates.map(
        (certificate) => certificate.child_name
      )
    ).size;

  const achievementCertificates =
    summary.achievement_certificates ||
    summary.achievements ||
    normalizedCertificates.filter((certificate) =>
      (certificate.type || "")
        .toLowerCase()
        .includes("achievement")
    ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

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

  const createCertificatePdf = (certificate) => {
    const document = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight =
      document.internal.pageSize.getHeight();

    document.setFillColor(248, 250, 252);
    document.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );

    document.setDrawColor(79, 70, 229);
    document.setLineWidth(3);
    document.rect(
      10,
      10,
      pageWidth - 20,
      pageHeight - 20
    );

    document.setDrawColor(245, 158, 11);
    document.setLineWidth(1);
    document.rect(
      15,
      15,
      pageWidth - 30,
      pageHeight - 30
    );

    document.setTextColor(79, 70, 229);
    document.setFont("helvetica", "bold");
    document.setFontSize(24);
    document.text(
      "StoryNest",
      pageWidth / 2,
      31,
      {
        align: "center",
      }
    );

    document.setTextColor(15, 23, 42);
    document.setFontSize(30);
    document.text(
      certificate.title,
      pageWidth / 2,
      55,
      {
        align: "center",
        maxWidth: pageWidth - 60,
      }
    );

    document.setFont("helvetica", "normal");
    document.setFontSize(15);
    document.setTextColor(71, 85, 105);
    document.text(
      "This certificate is proudly presented to",
      pageWidth / 2,
      76,
      {
        align: "center",
      }
    );

    document.setFont("helvetica", "bold");
    document.setFontSize(28);
    document.setTextColor(79, 70, 229);
    document.text(
      certificate.child_name,
      pageWidth / 2,
      96,
      {
        align: "center",
        maxWidth: pageWidth - 70,
      }
    );

    document.setDrawColor(245, 158, 11);
    document.setLineWidth(0.8);
    document.line(
      70,
      102,
      pageWidth - 70,
      102
    );

    document.setFont("helvetica", "normal");
    document.setFontSize(14);
    document.setTextColor(51, 65, 85);

    const descriptionLines = document.splitTextToSize(
      certificate.description,
      pageWidth - 90
    );

    document.text(
      descriptionLines,
      pageWidth / 2,
      119,
      {
        align: "center",
      }
    );

    let detailsY =
      119 + descriptionLines.length * 7 + 8;

    if (certificate.story_title) {
      document.setFont("helvetica", "bold");
      document.text(
        `Story: ${certificate.story_title}`,
        pageWidth / 2,
        detailsY,
        {
          align: "center",
          maxWidth: pageWidth - 80,
        }
      );

      detailsY += 10;
    }

    if (certificate.score > 0) {
      document.text(
        `Score: ${certificate.score}%`,
        pageWidth / 2,
        detailsY,
        {
          align: "center",
        }
      );

      detailsY += 10;
    }

    document.setFont("helvetica", "normal");
    document.setFontSize(11);
    document.setTextColor(100, 116, 139);

    document.text(
      `Issued on: ${formatDate(
        certificate.issued_at
      )}`,
      35,
      pageHeight - 34
    );

    document.text(
      `Certificate No: ${certificate.certificate_number}`,
      pageWidth - 35,
      pageHeight - 34,
      {
        align: "right",
      }
    );

    document.setTextColor(79, 70, 229);
    document.setFont("helvetica", "bold");
    document.setFontSize(13);
    document.text(
      "StoryNest Learning Platform",
      pageWidth / 2,
      pageHeight - 27,
      {
        align: "center",
      }
    );

    return document;
  };

  const handleDownloadCertificate = async (
    certificate
  ) => {
    try {
      setDownloadLoadingId(certificate.id);
      setError("");

      if (certificate.pdf_url) {
        window.open(
          certificate.pdf_url,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      const document =
        createCertificatePdf(certificate);

      const safeChildName =
        certificate.child_name
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();

      const safeCertificateTitle =
        certificate.title
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();

      document.save(
        `${safeChildName}-${safeCertificateTitle}.pdf`
      );

      setSuccessMessage(
        "Certificate downloaded successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (downloadError) {
      setError(
        getApiErrorMessage(
          downloadError,
          "Unable to download certificate."
        )
      );
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handlePrintCertificate = (certificate) => {
    const document =
      createCertificatePdf(certificate);

    document.autoPrint();

    const pdfBlobUrl =
      document.output("bloburl");

    window.open(
      pdfBlobUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const hasActiveFilters =
    searchTerm || typeFilter !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ParentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-72">
          <ParentNavbar
            title="Certificates"
            subtitle="Loading certificates"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <FaSpinner className="mx-auto animate-spin text-5xl text-indigo-600" />

              <p className="mt-4 font-medium text-slate-600">
                Loading certificates...
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
          title="Certificates"
          subtitle="View and download children's learning certificates"
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
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Certificates"
              value={totalCertificates}
              icon={FaCertificate}
              color="indigo"
              description="Certificates issued"
            />

            <StatsCard
              title="Verified"
              value={verifiedCertificates}
              icon={FaCheckCircle}
              color="emerald"
              description="Verified awards"
            />

            <StatsCard
              title="Children Awarded"
              value={childrenAwarded}
              icon={FaUserGraduate}
              color="blue"
              description="Unique learners"
            />

            <StatsCard
              title="Achievements"
              value={achievementCertificates}
              icon={FaTrophy}
              color="amber"
              description="Milestone certificates"
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                  <FaAward />
                </div>

                <h2 className="mt-4 text-3xl font-bold">
                  Celebrate Every Milestone
                </h2>

                <p className="mt-2 max-w-2xl leading-7 text-orange-50">
                  Download, print and share certificates
                  earned through reading, quizzes and
                  StoryNest achievements.
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-6 py-5 text-center backdrop-blur-sm">
                <p className="text-sm font-medium text-orange-50">
                  Certificates available
                </p>

                <p className="mt-1 text-4xl font-bold">
                  {totalCertificates}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_240px_240px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search Certificates
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-indigo-500">
                  <FaSearch className="text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search child, certificate or number..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <FilterSelect
                label="Child"
                value={selectedChildId}
                onChange={setSelectedChildId}
                options={[
                  {
                    value: "all",
                    label: "All Children",
                  },
                  ...children.map((child) => ({
                    value: String(child.id),
                    label: getChildName(child),
                  })),
                ]}
              />

              <FilterSelect
                label="Certificate Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  {
                    value: "all",
                    label: "All Types",
                  },
                  ...certificateTypes.map((type) => ({
                    value: type,
                    label: type,
                  })),
                ]}
              />
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <FaFilter />
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          <section className="relative mt-6">
            {certificateLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-50/70 backdrop-blur-sm">
                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
              </div>
            )}

            {paginatedCertificates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-600">
                  <FaCertificate />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No certificates found
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Certificates will appear after children
                  complete stories, quizzes and learning
                  milestones.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCertificates.map(
                    (certificate) => (
                      <article
                        key={certificate.id}
                        className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-6 text-white">
                          <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                            {certificate.type}
                          </div>

                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
                            <FaCertificate />
                          </div>

                          <h2 className="mt-5 pr-16 text-xl font-bold leading-7">
                            {certificate.title}
                          </h2>

                          <p className="mt-2 text-sm text-orange-50">
                            Awarded to{" "}
                            <span className="font-bold">
                              {certificate.child_name}
                            </span>
                          </p>
                        </div>

                        <div className="p-6">
                          <p className="min-h-16 text-sm leading-6 text-slate-600">
                            {certificate.description}
                          </p>

                          {certificate.story_title && (
                            <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                Story
                              </p>

                              <p className="mt-1 font-semibold text-indigo-800">
                                {certificate.story_title}
                              </p>
                            </div>
                          )}

                          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                            <CertificateDetail
                              label="Issued"
                              value={formatDate(
                                certificate.issued_at
                              )}
                            />

                            <CertificateDetail
                              label="Certificate No."
                              value={
                                certificate.certificate_number
                              }
                            />

                            {certificate.score > 0 && (
                              <CertificateDetail
                                label="Score"
                                value={`${certificate.score}%`}
                              />
                            )}
                          </div>

                          <div className="mt-6 grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewCertificate(
                                  certificate
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                              title="Preview certificate"
                            >
                              <FaEye />
                              <span className="hidden sm:inline">
                                View
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handlePrintCertificate(
                                  certificate
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                              title="Print certificate"
                            >
                              <FaPrint />
                              <span className="hidden sm:inline">
                                Print
                              </span>
                            </button>

                            <button
                              type="button"
                              disabled={
                                downloadLoadingId ===
                                certificate.id
                              }
                              onClick={() =>
                                handleDownloadCertificate(
                                  certificate
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                              title="Download certificate"
                            >
                              {downloadLoadingId ===
                              certificate.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaDownload />
                              )}

                              <span className="hidden sm:inline">
                                PDF
                              </span>
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                    <p className="text-sm text-slate-500">
                      Showing{" "}
                      {(currentPage - 1) *
                        certificatesPerPage +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        currentPage *
                          certificatesPerPage,
                        filteredCertificates.length
                      )}{" "}
                      of {filteredCertificates.length} certificates
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage(
                            (previous) => previous - 1
                          )
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          currentPage === totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (previous) => previous + 1
                          )
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {previewCertificate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Certificate Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review before downloading or printing.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewCertificate(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close preview"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-slate-100 p-4 sm:p-8">
              <div
                ref={certificatePreviewRef}
                className="relative mx-auto aspect-[1.414/1] w-full overflow-hidden border-[10px] border-indigo-600 bg-white p-4 shadow-xl"
              >
                <div className="flex h-full flex-col items-center justify-center border-4 border-amber-400 px-6 py-8 text-center sm:px-14">
                  <FaCertificate className="text-5xl text-amber-500 sm:text-7xl" />

                  <p className="mt-4 text-xl font-bold text-indigo-600 sm:text-3xl">
                    StoryNest
                  </p>

                  <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-5xl">
                    {previewCertificate.title}
                  </h1>

                  <p className="mt-5 text-sm text-slate-500 sm:text-lg">
                    This certificate is proudly presented to
                  </p>

                  <h2 className="mt-3 border-b-2 border-amber-400 px-8 pb-2 text-2xl font-bold text-indigo-600 sm:text-5xl">
                    {previewCertificate.child_name}
                  </h2>

                  <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-8">
                    {previewCertificate.description}
                  </p>

                  {previewCertificate.story_title && (
                    <p className="mt-3 text-sm font-bold text-slate-700 sm:text-lg">
                      Story:{" "}
                      {previewCertificate.story_title}
                    </p>
                  )}

                  <div className="mt-auto flex w-full items-end justify-between gap-4 pt-6 text-xs text-slate-500 sm:text-sm">
                    <div className="text-left">
                      <p>
                        Issued:{" "}
                        {formatDate(
                          previewCertificate.issued_at
                        )}
                      </p>

                      <p className="mt-1">
                        Certificate No:{" "}
                        {
                          previewCertificate.certificate_number
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="mb-2 h-px w-28 bg-slate-400 sm:w-40" />

                      <p className="font-bold text-indigo-600">
                        StoryNest Learning Platform
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setPreviewCertificate(null)
                }
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePrintCertificate(
                    previewCertificate
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <FaPrint />
                Print
              </button>

              <button
                type="button"
                disabled={
                  downloadLoadingId ===
                  previewCertificate.id
                }
                onClick={() =>
                  handleDownloadCertificate(
                    previewCertificate
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {downloadLoadingId ===
                previewCertificate.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}

                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
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

function CertificateDetail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="break-all text-right font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

export default Certificates;
