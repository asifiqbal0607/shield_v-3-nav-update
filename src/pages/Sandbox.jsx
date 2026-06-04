import { useMemo, useState } from "react";
import {
  CheckCircle,
  Copy,
  Globe2,
  Play,
  Server,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Card, SectionTitle } from "../components/ui";

const SANDBOX_TABS = [
  { key: "shield", label: "Shield Integration" },
  { key: "server", label: "Block API (Server)" },
  { key: "client", label: "Block API (Client)" },
];

const CODE_LANGS = ["CURL", "PHP CURL", "C#", "JAVA", "OBJECTIVE C", "PYTHON", "NODE JS", "C"];
const DATA_CENTERS = [
  "uk.block.shield.monitoringservice.co",
  "sa.block.shield.monitoringservice.co",
  "sg.block.shield.monitoringservice.co",
];

const HTTP_ROWS = [
  { code: "200", status: "Success", message: "{ JSON OBJECT }" },
  { code: "400", status: "Failed", message: "UNIQID is Missing" },
  { code: "401", status: "Failed", message: "Access Denied" },
  { code: "404", status: "Failed", message: "Transaction Not Found in System" },
  { code: "421", status: "Failed", message: "Request Error" },
];

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function buildSnippet(tab, lang, dataCenter, uniqueId) {
  const id = uniqueId || "e18a9d2646a32ae6a9d238b096bce58d";
  const endpoint = `http://${dataCenter}/appblock`;
  const snippets = {
    CURL: `curl -X POST \\
  ${endpoint} \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -H 'cache-control: no-cache' \\
  -d uniqid=${id}`,
    "PHP CURL": `$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "${endpoint}",
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => "uniqid=${id}",
]);
$response = curl_exec($curl);`,
    "C#": `var client = new HttpClient();
var body = new FormUrlEncodedContent(new[] {
  new KeyValuePair<string,string>("uniqid", "${id}")
});
var response = await client.PostAsync("${endpoint}", body);`,
    JAVA: `HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("${endpoint}"))
  .POST(BodyPublishers.ofString("uniqid=${id}"))
  .header("Content-Type", "application/x-www-form-urlencoded")
  .build();`,
    "OBJECTIVE C": `NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:
  [NSURL URLWithString:@"${endpoint}"]];
[request setHTTPMethod:@"POST"];
[request setHTTPBody:[@"uniqid=${id}" dataUsingEncoding:NSUTF8StringEncoding]];`,
    PYTHON: `import requests

response = requests.post(
  "${endpoint}",
  data={"uniqid": "${id}"},
  headers={"Content-Type": "application/x-www-form-urlencoded"}
)`,
    "NODE JS": `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ uniqid: "${id}" })
});`,
    C: `// Use libcurl
curl_easy_setopt(curl, CURLOPT_URL, "${endpoint}");
curl_easy_setopt(curl, CURLOPT_POSTFIELDS, "uniqid=${id}");`,
  };

  if (tab === "shield") {
    return `<script src="https://shield.monitoringservice.co/shield.js"></script>
<script>
  window.MCPShield.init({
    serviceId: "SERVICE_ID",
    stagingKey: "mcpstagingkey"
  });
</script>`;
  }

  return snippets[lang] || snippets.CURL;
}

export default function PageSandbox() {
  const [activeTab, setActiveTab] = useState("shield");
  const [activeLang, setActiveLang] = useState("CURL");
  const [url, setUrl] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [dataCenter, setDataCenter] = useState(DATA_CENTERS[0]);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(
    () => buildSnippet(activeTab, activeLang, dataCenter, uniqueId),
    [activeTab, activeLang, dataCenter, uniqueId],
  );

  function copySnippet() {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function runTest() {
    if (activeTab === "shield") {
      let normalized;
      try {
        normalized = normalizeUrl(url);
        new URL(normalized);
      } catch {
        setResult({
          ok: false,
          title: "Invalid URL",
          message: "Enter a valid URL where Shield is integrated.",
          code: "400",
        });
        return;
      }

      const indicator = normalized.toLowerCase();
      const ok = indicator.includes("shield") || indicator.includes("mcp") || indicator.includes("staging");
      setResult({
        ok,
        title: ok ? "Shield is successfully integrated" : "Shield integration was not detected",
        message: ok
          ? "Shield loading indicators were found for this URL."
          : "No Shield loading indicators were found. Confirm the script is installed and verify again.",
        code: ok ? "200" : "404",
        target: normalized,
      });
      return;
    }

    const ok = Boolean(uniqueId.trim());
    setResult({
      ok,
      title: ok ? "Block API request is valid" : "UNIQID is missing",
      message: ok
        ? `Request can be submitted to ${dataCenter}.`
        : "Enter the UNIQID retrieved or created by the deployed script.",
      code: ok ? "200" : "400",
      target: dataCenter,
    });
  }

  function resetForTab(key) {
    setActiveTab(key);
    setResult(null);
  }

  return (
    <div className="sandbox-console-page">
      <div className="sandbox-console-head">
        <div>
          <SectionTitle>Sandbox Environment</SectionTitle>
          <div className="sandbox-console-sub">
            Test Shield loading and Block API behavior before releasing partner traffic.
          </div>
        </div>
        <div className="sandbox-console-badge">Partner testing console</div>
      </div>

      <div className="sandbox-console-tabs">
        {SANDBOX_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => resetForTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "shield" && (
      <Card className="sandbox-console-card">
        <div className="sandbox-console-card-head">
          <div>
            <div className="sandbox-console-title">
              {activeTab === "shield"
                ? "Shield Integration Testing"
                : activeTab === "server"
                  ? "Block API Server Side Testing"
                  : "Block API Client Side Testing"}
            </div>
            <div className="sandbox-console-desc">
              {activeTab === "shield"
                ? "Provide the page URL and verify whether Shield is loading on that URL."
                : "Use the request data below to validate Block API behavior in the selected data center."}
            </div>
          </div>
          <button type="button" className="sandbox-copy-btn" onClick={copySnippet}>
            <Copy size={14} />
            {copied ? "Copied" : "Copy snippet"}
          </button>
        </div>

        <div className="sandbox-code-tabs">
          {activeTab === "shield" ? (
            <button type="button" className="active">JAVASCRIPT</button>
          ) : (
            CODE_LANGS.map((lang) => (
              <button
                key={lang}
                type="button"
                className={activeLang === lang ? "active" : ""}
                onClick={() => setActiveLang(lang)}
              >
                {lang}
              </button>
            ))
          )}
        </div>
        <pre className="sandbox-code-block">{snippet}</pre>
      </Card>
      )}

      <Card className="sandbox-console-card">
        <div className="sandbox-console-card-head">
          <div>
            <div className="sandbox-console-title">Request Data</div>
            <div className="sandbox-console-desc">
              {activeTab === "shield"
                ? "Enter the live page URL used by the partner campaign and run a Shield loading check."
                : "Provide the unique transaction identifier and target data center."}
            </div>
          </div>
        </div>

        <div className="sandbox-request-table">
          {activeTab === "shield" ? (
            <div className="sandbox-request-row">
              <div>
                <strong>Integration URL</strong>
                <span>(URL)</span>
              </div>
              <div>
                <strong className="required">Required</strong>
                <span>Page URL where Shield JS is integrated</span>
              </div>
              <div className="sandbox-request-control">
                <Globe2 size={15} />
                <input
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setResult(null);
                  }}
                  placeholder="https://partner-domain.com/landing-page"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="sandbox-request-row">
                <div>
                  <strong>Unique Id</strong>
                  <span>(string)</span>
                </div>
                <div>
                  <strong className="required">Required</strong>
                  <span>Value of UNIQID retrieved or created by a deployed script</span>
                </div>
                <input
                  className="sandbox-request-input"
                  value={uniqueId}
                  onChange={(event) => {
                    setUniqueId(event.target.value);
                    setResult(null);
                  }}
                />
              </div>
              <div className="sandbox-request-row">
                <div>
                  <strong>Data Center</strong>
                  <span>(string)</span>
                </div>
                <div>
                  <strong>string</strong>
                  <span>Data Center</span>
                </div>
                <select
                  className="sandbox-request-input"
                  value={dataCenter}
                  onChange={(event) => setDataCenter(event.target.value)}
                >
                  {DATA_CENTERS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="sandbox-submit-row">
          {result && (
            <div className={`sandbox-inline-result ${result.ok ? "ok" : "bad"}`}>
              {result.ok ? <CheckCircle size={18} /> : <ShieldX size={18} />}
              <div>
                <strong>{result.title}</strong>
                <span>{result.message}</span>
              </div>
              <em>HTTP {result.code}</em>
            </div>
          )}
          <button type="button" className="sandbox-run-btn" onClick={runTest}>
            <Play size={14} />
            {activeTab === "shield" ? "Verify URL" : "Submit"}
          </button>
        </div>
      </Card>

      <Card className="sandbox-console-card">
        <div className="sandbox-console-card-head">
          <div>
            <div className="sandbox-console-title">HTTP Status</div>
            <div className="sandbox-console-desc">
              Module behavior must change depending on the following API response code.
            </div>
          </div>
          <Server size={18} className="sandbox-muted-icon" />
        </div>

        <table className="sandbox-status-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {HTTP_ROWS.map((row) => (
              <tr key={row.code}>
                <td>{row.code}</td>
                <td className={row.status === "Success" ? "success" : "failed"}>{row.status}</td>
                <td>{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
