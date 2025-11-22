import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ISO_9001_CHECKLIST, ISOChecklistSection } from '@/lib/audit/iso-checklist';

const prisma = new PrismaClient();

// GET - Retrieve checklist configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version') || 'ISO_9001_2015';
    const source = searchParams.get('source') || 'default'; // 'default' or 'database'

    if (source === 'database') {
      // Load from database
      const checklist = await prisma.iSOChecklist.findFirst({
        where: { 
          version,
          isActive: true 
        },
        include: {
          sections: {
            include: {
              items: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!checklist) {
        return NextResponse.json(
          { error: 'Checklist not found' },
          { status: 404 }
        );
      }

      // Transform database format to application format
      const sections: ISOChecklistSection[] = checklist.sections.map(section => ({
        id: section.id,
        title: section.title,
        clauseRange: section.isoClause,
        items: section.items.map(item => ({
          id: item.id,
          clauseRef: item.isoReference,
          section: section.title,
          question: item.question,
          helpText: item.helpText || '',
          responseType: item.responseType.toLowerCase().replace('_', '_') as any,
          required: item.required,
          weight: item.weight,
          correctiveActionTemplates: Array.isArray(item.correctiveActionTemplates) 
            ? item.correctiveActionTemplates as string[]
            : [],
          evidenceRequired: item.required // Default to required field value
        }))
      }));

      return NextResponse.json({
        version: checklist.version,
        title: checklist.title,
        sections
      });
    } else {
      // Return default ISO 9001 checklist
      return NextResponse.json({
        version: 'ISO_9001_2015',
        title: 'ISO 9001:2015 Quality Management System Audit',
        sections: ISO_9001_CHECKLIST
      });
    }
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist configuration' },
      { status: 500 }
    );
  }
}

// POST - Save/Update checklist configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version = 'ISO_9001_2015', title = 'ISO 9001:2015 Audit', sections } = body;

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid checklist data' },
        { status: 400 }
      );
    }

    // Deactivate existing checklists with same version
    await prisma.iSOChecklist.updateMany({
      where: { version },
      data: { isActive: false }
    });

    // Create new checklist
    const checklist = await prisma.iSOChecklist.create({
      data: {
        version,
        title,
        isActive: true,
        sections: {
          create: sections.map((section: ISOChecklistSection, sectionIndex: number) => ({
            title: section.title,
            isoClause: section.clauseRange,
            weight: 1.0,
            order: sectionIndex,
            items: {
              create: section.items.map((item, itemIndex) => ({
                question: item.question,
                isoReference: item.clauseRef,
                responseType: item.responseType.toUpperCase().replace('_', '_') as any,
                required: item.required,
                helpText: item.helpText,
                correctiveActionTemplates: item.correctiveActionTemplates || [],
                weight: item.weight,
                order: itemIndex
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Checklist configuration saved successfully',
      checklistId: checklist.id
    });
  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json(
      { error: 'Failed to save checklist configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update existing checklist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { checklistId, sections } = body;

    if (!checklistId || !sections) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delete existing sections and items
    await prisma.checklistSection.deleteMany({
      where: { checklistId }
    });

    // Create new sections and items
    await prisma.iSOChecklist.update({
      where: { id: checklistId },
      data: {
        sections: {
          create: sections.map((section: ISOChecklistSection, sectionIndex: number) => ({
            title: section.title,
            isoClause: section.clauseRange,
            weight: 1.0,
            order: sectionIndex,
            items: {
              create: section.items.map((item, itemIndex) => ({
                question: item.question,
                isoReference: item.clauseRef,
                responseType: item.responseType.toUpperCase().replace('_', '_') as any,
                required: item.required,
                helpText: item.helpText,
                correctiveActionTemplates: item.correctiveActionTemplates || [],
                weight: item.weight,
                order: itemIndex
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Checklist updated successfully'
    });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}

// DELETE - Delete checklist configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('id');

    if (!checklistId) {
      return NextResponse.json(
        { error: 'Checklist ID required' },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    await prisma.iSOChecklist.update({
      where: { id: checklistId },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Checklist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    return NextResponse.json(
      { error: 'Failed to delete checklist' },
      { status: 500 }
    );
  }
}
