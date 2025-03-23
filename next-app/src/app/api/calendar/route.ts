import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/mongodb';
import Course from '@/lib/db/models/course';
import { verifyToken } from '@/lib/utils/jwt';
import { extractDueDates } from '../../../../../google_calendar/pdf_processor.js'; 
import { addEvents } from '../../../../../google_calendar/calendar_integration.js';

export async function POST(request: NextRequest) {
  try {
    console.log('📌 API Request Received');

    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    console.log('✅ Connected to Database');

    console.log(`🔎 Checking for courses with googleUid: ${decoded.googleUid}`);
    console.log('🔎 Querying courses with hasSyllabus not set to "yes" and a valid syllabusPDF...');

    const coursesToProcess = await Course.find({
      googleUid: decoded.googleUid,
      $or: [
        { hasSyllabus: { $exists: false } },
        { hasSyllabus: 'no' }
      ],
      syllabusPDF: { $ne: null, $exists: true, $ne: '' } // Ensure syllabusPDF is not empty
    });

    console.log(`📊 Found ${coursesToProcess.length} courses matching criteria`);
    if (coursesToProcess.length > 0) {
      coursesToProcess.forEach(course => console.log(`✅ Course: ${course.courseName} | hasSyllabus: ${course.hasSyllabus} | syllabusPDF: ${!!course.syllabusPDF}`));
    }

    if (coursesToProcess.length === 0) {
      console.log('⚠️ No courses found with unprocessed syllabi.');
      return NextResponse.json({ 
        message: 'No courses with unprocessed syllabi found',
        results: [] 
      });
    }

    console.log(`📚 Found ${coursesToProcess.length} courses to process`);

    const results = [];

    for (const course of coursesToProcess) {
      try {
        console.log(`🔍 Processing course: ${course.courseName}`);

        const base64Data = course.syllabusPDF.split(';base64,').pop();
        if (!base64Data) {
          console.log(`⚠️ Skipping ${course.courseName} - Invalid PDF data`);
          results.push({
            courseId: course._id,
            courseName: course.courseName,
            status: 'failed',
            error: 'Invalid PDF data'
          });
          continue;
        }

        const pdfBuffer = Buffer.from(base64Data, 'base64');
        console.log(`📄 Extracting due dates from PDF (Size: ${pdfBuffer.length} bytes) for ${course.courseName}`);

        const events = await extractDueDates(pdfBuffer);
        console.log(`📅 Extracted ${events.length} events for ${course.courseName}`, events);

        if (events.length > 0) {
          console.log(`🚀 Adding ${events.length} events to Google Calendar for ${course.courseName}`);
          await addEvents(events);
          console.log(`✅ Successfully added events for ${course.courseName}`);
        } else {
          console.log(`⚠️ No events extracted for ${course.courseName}, skipping calendar update.`);
        }

        // Update course status
        const updateResult = await Course.updateOne(
          { _id: course._id },
          { $set: { hasSyllabus: 'yes' } }
        );

        if (updateResult.modifiedCount > 0) {
          console.log(`✅ Updated hasSyllabus to 'yes' for ${course.courseName}`);
        } else {
          console.log(`⚠️ Failed to update hasSyllabus for ${course.courseName}`);
        }

        results.push({
          courseId: course._id,
          courseName: course.courseName,
          status: 'success',
          eventsAdded: events.length
        });

      } catch (error) {
        console.error(`❌ Error processing course ${course.courseName}:`, error);
        results.push({ 
          courseId: course._id,
          courseName: course.courseName,
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Processing failed'
        });
      }
    }

    return NextResponse.json({
      message: coursesToProcess.length === results.length 
        ? 'Processing complete' 
        : 'Partial processing completed',
      results
    });

  } catch (error) {
    console.error('🔥 Calendar processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process calendar events',
        results: [] 
      },
      { status: 500 }
    );
  }
}
