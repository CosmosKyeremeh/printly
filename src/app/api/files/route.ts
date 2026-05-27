import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fileType, 
      categoryId, 
      fileName, 
      filePath, 
      fileSize, 
      description, 
      instructions 
    } = body;

    // 1. Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // 2. Initialize the Supabase client safely with await
    const supabase = await createClient();

    // 3. Get the logged-in user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Save the document metadata to the database
    const { data, error: dbError } = await supabase
      .from('files')
      .insert({
        owner_id: user.id,
        category_id: categoryId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        file_type: fileType,
        description: description || null,
        instructions: instructions || null,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Return the saved data back to the client
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
}