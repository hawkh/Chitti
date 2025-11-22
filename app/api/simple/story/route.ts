import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const isAnonymous = formData.get('isAnonymous') === 'true';
    const userId = formData.get('userId') as string;

    if (!description) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    // TODO: Save to Story model
    // await prisma.story.create({
    //   data: {
    //     userId,
    //     imageUrl: uploadedUrl,
    //     description,
    //     isAnonymous
    //   }
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Story shared successfully' 
    });
  } catch (error) {
    console.error('Story error:', error);
    return NextResponse.json({ error: 'Failed to share story' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // TODO: Fetch approved stories
    // const stories = await prisma.story.findMany({
    //   where: { isApproved: true },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10
    // })

    return NextResponse.json({ stories: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
