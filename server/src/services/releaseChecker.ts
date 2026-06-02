import { prisma } from '../index';
import { EmailService } from './emailService';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LAST_REPORT_FILE = path.join(__dirname, '../../last_weekly_report.txt');

/**
 * Checks for new chapters for ongoing manga/manhwa in the watchlist
 * and sends email notifications to tracking users.
 */
export async function checkNewReleases() {
  console.log('🔍 [Release Checker] Running background check for new releases...');
  try {
    const ongoingMediaList = await prisma.media.findMany({
      where: {
        status: 'RELEASING',
        type: 'MANGA' // Specifically checking Manga for now
      }
    });

    for (const media of ongoingMediaList) {
      const slug = media.titleEnglish.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      try {
        const arenascanUrl = `https://arenascan.com/manga/${slug}/`;
        const response = await axios.get(arenascanUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 4000
        });

        if (response.status === 200) {
          const regex = /<span class="chapternum">Chapter\s+(\d+(?:\.\d+)?)<\/span>/i;
          const match = response.data.match(regex);
          if (match) {
            const latestChapter = parseFloat(match[1]);
            const oldChapters = media.totalChapters || 0;

            if (latestChapter > oldChapters) {
              console.log(`🎉 [Release Checker] New chapter found for "${media.titleEnglish}": Chapter ${latestChapter} (previous: ${oldChapters})`);
              
              // 1. Update Media record in global database
              await prisma.media.update({
                where: { id: media.id },
                data: { totalChapters: latestChapter }
              });

              // 2. Find all users tracking this media
              const trackingUsers = await prisma.userMediaProgress.findMany({
                where: { mediaId: media.id },
                include: { user: true }
              });

              for (const progress of trackingUsers) {
                // If they haven't read up to the new chapter, send email alert
                if (progress.currentProgress < latestChapter) {
                  await EmailService.sendReleaseNotification(
                    progress.user.email,
                    progress.user.username,
                    media.titleEnglish,
                    latestChapter,
                    `https://arenascan.com/${slug}-chapter-${latestChapter}/`
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        // Fail silently for individual mangas to prevent blocking others
      }
    }
  } catch (error) {
    console.error('❌ [Release Checker] Background release check failed:', error);
  }
}

/**
 * Gathers weekly progress statistics and sends analytics report emails.
 */
export async function sendWeeklyAnalyticsEmails() {
  console.log('📊 [Analytics Scheduler] Checking if it is time for weekly reports...');
  try {
    // Check if 7 days have passed since last run
    let shouldRun = false;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    if (fs.existsSync(LAST_REPORT_FILE)) {
      const lastRunStr = fs.readFileSync(LAST_REPORT_FILE, 'utf-8').trim();
      const lastRun = parseInt(lastRunStr, 10);
      if (!isNaN(lastRun) && now - lastRun >= oneWeekMs) {
        shouldRun = true;
      }
    } else {
      // First run ever
      shouldRun = true;
    }

    if (!shouldRun) {
      console.log('📊 [Analytics Scheduler] Weekly report not due yet.');
      return;
    }

    console.log('📊 [Analytics Scheduler] Time elapsed. Generating and mailing weekly reports...');
    const oneWeekAgo = new Date(now - oneWeekMs);
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Fetch progress history for the last 7 days
      const history = await prisma.progressHistory.findMany({
        where: {
          progressRecord: { userId: user.id },
          timestamp: { gte: oneWeekAgo }
        },
        include: {
          progressRecord: {
            include: { media: true }
          }
        },
        orderBy: { timestamp: 'asc' }
      });

      if (history.length === 0) {
        continue;
      }

      // Group history items by progressId to calculate consecutive increments
      const progressGroupMap = new Map<string, number[]>();
      history.forEach(item => {
        if (!progressGroupMap.has(item.progressId)) {
          progressGroupMap.set(item.progressId, []);
        }
        progressGroupMap.get(item.progressId)!.push(item.progressValue);
      });

      const finalMediaStats: { title: string; type: string; amountAdded: number }[] = [];
      let weeklyWatchMinutes = 0;
      let weeklyReadMinutes = 0;

      progressGroupMap.forEach((values, progressId) => {
        const firstHist = history.find(h => h.progressId === progressId)!;
        const mediaTitle = firstHist.progressRecord.media.titleEnglish;
        const mediaType = firstHist.progressRecord.media.type;
        
        let amountAdded = 0;
        if (values.length === 1) {
          amountAdded = 1;
        } else {
          const sorted = [...values].sort((a, b) => a - b);
          amountAdded = Math.max(1, sorted[sorted.length - 1] - sorted[0]);
        }

        finalMediaStats.push({
          title: mediaTitle,
          type: mediaType,
          amountAdded
        });

        if (mediaType === 'ANIME') {
          weeklyWatchMinutes += amountAdded * 24;
        } else if (mediaType === 'TV_SHOW') {
          weeklyWatchMinutes += amountAdded * 45;
        } else if (mediaType === 'MOVIE') {
          weeklyWatchMinutes += amountAdded * 120;
        } else if (mediaType === 'MANGA' || mediaType === 'LIGHT_NOVEL') {
          weeklyReadMinutes += amountAdded * 10;
        }
      });

      const watchHours = parseFloat((weeklyWatchMinutes / 60).toFixed(1));
      const readHours = parseFloat((weeklyReadMinutes / 60).toFixed(1));
      const totalHours = parseFloat(((weeklyWatchMinutes + weeklyReadMinutes) / 60).toFixed(1));

      // Send the email
      await EmailService.sendWeeklyReport(
        user.email,
        user.username,
        watchHours,
        readHours,
        totalHours,
        finalMediaStats
      );
    }

    // Save current runtime
    fs.writeFileSync(LAST_REPORT_FILE, now.toString(), 'utf-8');
    console.log('📊 [Analytics Scheduler] Weekly reports completed successfully.');

  } catch (error) {
    console.error('❌ [Analytics Scheduler] Failed to send weekly reports:', error);
  }
}

/**
 * Initializes background loops
 */
export function startBackgroundChecker() {
  console.log('⏰ [Scheduler] Starting BingeLog background loops...');
  
  // 1. Run chapter release check after 30 seconds, then every 4 hours
  setTimeout(() => {
    checkNewReleases();
  }, 30000);

  setInterval(() => {
    checkNewReleases();
  }, 4 * 60 * 60 * 1000);

  // 2. Check daily for weekly analytics email scheduler
  setTimeout(() => {
    sendWeeklyAnalyticsEmails();
  }, 60000);

  setInterval(() => {
    sendWeeklyAnalyticsEmails();
  }, 24 * 60 * 60 * 1000);
}
