import { createClient } from '@/lib/supabase/server';
import { convertFile, getConversionFormats } from '@/lib/conversion/convertapi';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await params;

    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const conversion = getConversionFormats(file.file_type);
    if (!conversion.canConvert) {
      return NextResponse.json(
        { error: 'File type not supported for conversion' },
        { status: 400 }
      );
    }

    // Get a signed URL for the source file
    const { data: signedData } = await supabase.storage
      .from('assignments')
      .createSignedUrl(file.file_path, 300);

    if (!signedData?.signedUrl) {
      return NextResponse.json({ error: 'Could not access file' }, { status: 500 });
    }

    // Run the conversion
    const convertedUrl = await convertFile(
      signedData.signedUrl,
      conversion.from!,
      conversion.to!
    );

    // Download the converted file
    const convertedResponse = await fetch(convertedUrl);
    const convertedBuffer = await convertedResponse.arrayBuffer();

    const newFileName = file.file_name.replace(
      /\.(pdf|docx)$/i,
      conversion.to === 'pdf' ? '.pdf' : '.docx'
    );
    const newPath = `${user.id}/${Date.now()}_converted_${newFileName}`;
    const newFileType = conversion.to === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Upload converted file to storage
    const { error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(newPath, convertedBuffer, { contentType: newFileType });

    if (uploadError) throw uploadError;

    // Save to DB
    const { data: newFile } = await supabase
      .from('files')
      .insert({
        owner_id: user.id,
        category_id: file.category_id,
        file_name: newFileName,
        file_path: newPath,
        file_size: convertedBuffer.byteLength,
        file_type: newFileType,
        description: `Converted from ${file.file_name}`,
      })
      .select()
      .single();

    return NextResponse.json({ success: true, file: newFile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}