import { useMemo, useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";

function ReadingLogTable({ logs = [] }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const keyword = search.toLowerCase();

      return (
        (log.child_name || "")
          .toLowerCase()
          .includes(keyword) ||
        (log.story_title || "")
          .toLowerCase()
          .includes(keyword) ||
        (log.parent_note || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [logs, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / rowsPerPage)
  );

  const currentRows = filteredLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportCSV = () => {
    const header = [
      "Date",
      "Child",
      "Story",
      "Pages Read",
      "Duration (min)",
      "Completion %",
      "Parent Note",
    ];

    const csvRows = filteredLogs.map((item) => [
      item.date,
      item.child_name,
      item.story_title,
      item.pages_read,
      item.duration,
      item.completion_percentage,
      item.parent_note,
    ]);

    const csvContent = [header, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reading_logs.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Reading Logs
          </h2>

          <p className="text-sm text-slate-500">
            Complete family reading history
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-2">
            <FaSearch className="text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="outline-none"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2 font-semibold text-white hover:bg-rose-600"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Child
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Story
              </th>
              <th className="px-5 py-4 text-center text-sm font-semibold">
                Pages
              </th>
              <th className="px-5 py-4 text-center text-sm font-semibold">
                Duration
              </th>
              <th className="px-5 py-4 text-center text-sm font-semibold">
                Completion
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Parent Note
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-slate-500"
                >
                  No reading logs found.
                </td>
              </tr>
            ) : (
              currentRows.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    {log.date}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {log.child_name}
                  </td>
                  <td className="px-5 py-4">
                    {log.story_title}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {log.pages_read}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {log.duration} min
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                      {log.completion_percentage}%
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    {log.parent_note || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 p-5">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-semibold">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ReadingLogTable;
