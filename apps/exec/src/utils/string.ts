/* eslint-disable no-control-regex */
export function filterControlCharacters(str: string): string {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

export function formatExportLogs(logs: string): {
  output: string;
  executeTime: number;
} {
  const pattern = /{--(\d+)--}$/;
  const trimmedLogs = filterControlCharacters(logs.toString().trim());
  const coastTimeNS = Number(
    parseInt(trimmedLogs.match(pattern)?.[1] as string),
  );
  const coastTimeMs = coastTimeNS / 10 ** 6 || 0;
  const outputWithoutTime = trimmedLogs.replace(pattern, '');

  return {
    output: outputWithoutTime,
    executeTime: coastTimeMs,
  };
}
