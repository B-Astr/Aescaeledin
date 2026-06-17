import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 160;
const SEARCH_DEBOUNCE_MS = 450;
const MAX_RESULTS = 5;
const MIN_RESULT_SCORE = 0.4;

type SearchResult = {
  id: string;
  title: string;
  type: "JOB" | "SERVICE";
  description: string;
  route: string;
  score: number;
};

type NavbarSearchProps = {
  mobile?: boolean;
  onNavigate?: () => void;
  onOpenChange?: (open: boolean) => void;
};

export default function NavbarSearch({
  mobile = false,
  onNavigate,
  onOpenChange,
}: NavbarSearchProps) {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);

  function resetSearch() {
    setQuery("");
    setResults([]);
    setLoading(false);
    setError(false);
    setSearched(false);
  }

  function toggleSearch() {
    const nextOpen = !open;

    if (!nextOpen) {
      resetSearch();
    }

    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function handleResultClick(result: SearchResult) {
    setOpen(false);
    onOpenChange?.(false);
    resetSearch();
    onNavigate?.();
    navigate(result.route);
  }

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!open || normalizedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(false);
      setSearched(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        setResults([]);
        setError(true);
        setSearched(true);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(normalizedQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        setResults(
          Array.isArray(data.results)
            ? (data.results as SearchResult[])
                .filter((result) => result.score >= MIN_RESULT_SCORE)
                .slice(0, MAX_RESULTS)
            : []
        );
        setSearched(true);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setResults([]);
        setError(true);
        setSearched(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [open, query]);

  const showDropdown =
    open && query.trim().length >= MIN_QUERY_LENGTH && (loading || error || searched);

  return (
    <div className={`navbar-search ${mobile ? "mobile-search" : ""} ${open ? "open" : ""}`}>
      {open && (
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={LL.navbar.searchPlaceholder()}
          aria-label={LL.navbar.searchPlaceholder()}
          maxLength={MAX_QUERY_LENGTH}
        />
      )}

      <button
        type="button"
        className="nav-secondary-button navbar-search-button"
        onClick={toggleSearch}
        aria-label={LL.navbar.searchPlaceholder()}
        aria-expanded={open}
      >
        <span aria-hidden="true">{"\uD83D\uDD0D"}</span>
      </button>

      {showDropdown && (
        <div className="navbar-search-dropdown" aria-live="polite">
          <div className="navbar-search-dropdown-title">
            {LL.navbar.searchResults()}
          </div>

          {loading ? (
            <div className="navbar-search-message">{LL.navbar.searchLoading()}</div>
          ) : error ? (
            <div className="navbar-search-message navbar-search-error">
              {LL.navbar.searchError()}
            </div>
          ) : results.length === 0 ? (
            <div className="navbar-search-message">{LL.navbar.searchEmpty()}</div>
          ) : (
            <div className="navbar-search-results">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="navbar-search-result"
                  onClick={() => handleResultClick(result)}
                >
                  <span className="navbar-search-result-topline">
                    <strong>{result.title}</strong>
                    <span>{Math.round(Math.max(0, Math.min(1, result.score)) * 100)}%</span>
                  </span>
                  <span className="navbar-search-result-type">
                    {result.type === "JOB"
                      ? LL.navbar.searchJobType()
                      : LL.navbar.searchServiceType()}
                  </span>
                  <span className="navbar-search-result-description">
                    {result.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
