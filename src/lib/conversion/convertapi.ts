const CONVERT_API_BASE = 'https://v2.convertapi.com';

export type ConversionFormat = 'pdf' | 'docx';

export async function convertFile(
  fileUrl: string,
  fromFormat: ConversionFormat,
  toFormat: ConversionFormat
): Promise<string> {
  const secret = process.env.CONVERT_API_SECRET;
  if (!secret) throw new Error('ConvertAPI secret not configured');

  const response = await fetch(
    `${CONVERT_API_BASE}/convert/${fromFormat}/to/${toFormat}?Secret=${secret}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Parameters: [
          {
            Name: 'File',
            FileUrl: fileUrl,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Conversion failed: ${error}`);
  }

  const data = await response.json();
  const convertedFile = data.Files?.[0];

  if (!convertedFile?.Url) {
    throw new Error('No converted file returned');
  }

  return convertedFile.Url;
}

export function getConversionFormats(fileType: string): {
  canConvert: boolean;
  from: ConversionFormat | null;
  to: ConversionFormat | null;
  label: string;
} {
  if (fileType === 'application/pdf') {
    return { canConvert: true, from: 'pdf', to: 'docx', label: 'Convert to DOCX' };
  }
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return { canConvert: true, from: 'docx', to: 'pdf', label: 'Convert to PDF' };
  }
  return { canConvert: false, from: null, to: null, label: '' };
}