export function makeTransactionDetail(row) {
  const isBlocked = (row?.status || "").toLowerCase().includes("block");

  return {
    url: "http://aciq.playit.mobi/confirm-asiacell?uniquid=ask004b49312599e074c94c3951d698ad23",
    referrer:
      "http://aciq.playit.mobi/signup?parameter=60432life-15od-4cb2-837f-2e8e7f380f6b&trafficsource=OffyClick",
    time: row?.time || "Feb 25, 04:23:08.438 AM",
    timezone: "Asia/Baghdad",
    transactionId: row?.id || "20260225042308_fd1f907042ef4af9bfe261415926f45",
    client: "IQ Grand Technology",
    service: "GC 2231 Playit",
    queried: "Yes",
    queriedTime: "2026-02-25 07:23:08.488 AM",
    userIp: row?.userIp || "89.46.206.31",
    relatedIps: row?.relatedIps || [],
    userAgent:
      row?.userAgent ||
      "Mozilla/5.0 (Linux; Android 13; SM-M127F Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36",
    country: "Iraq",
    continent: "Asia",
    timezone2: "Asia/Baghdad",
    device: row?.device || "Samsung SM-M127F",
    os: row?.os || "Android",
    browser: row?.browser || "Chrome Mobile",
    network: row?.network || "Asiacell Communications Pjsc",
    apk: row?.apk || "-",
    status: row?.status || "Clean",
    score: row?.score ?? (isBlocked ? 1.0 : 9.0),
    isBlocked,
    reasons: row?.reasons || (isBlocked ? ["MCPS-2000", "MCPS-1300", "MCPS-0041"] : []),
  };
}
