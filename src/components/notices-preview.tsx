
"use client";

import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { Megaphone, Loader2 } from 'lucide-react';

interface Notice {
  id: string;
  noticeTitle: string;
  noticeContent: string;
  publishDate: string;
  audience: string;
  status: 'Published' | 'Draft';
  isUrgent?: boolean;
  createdAt?: Timestamp;
}

const MAX_NOTICES_TO_DISPLAY = 5;
const NOTICE_CHANGE_INTERVAL = 7000; // 7 seconds

export function NoticesPreview() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.warn("[NoticesPreview] Firestore db instance is not available. Notices will not load.");
      setLoading(false);
      return;
    }
    console.log("[NoticesPreview] Firestore db instance IS available. Setting up listener.");

    const q = query(
      collection(db, "notices"),
      where("status", "==", "Published"),
      orderBy("publishDate", "desc"),
      orderBy("createdAt", "desc"),
      limit(MAX_NOTICES_TO_DISPLAY)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotices: Notice[] = [];
      console.log(`[NoticesPreview] Snapshot received. Empty: ${querySnapshot.empty}, Size: ${querySnapshot.size}`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[NoticesPreview] Doc ID: ${doc.id}, Raw Data:`, JSON.parse(JSON.stringify(data)));

        if (typeof data.publishDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.publishDate)) {
            console.warn(`[NoticesPreview] Doc ID: ${doc.id} - Invalid publishDate format: "${data.publishDate}". Expected YYYY-MM-DD.`);
        }
        fetchedNotices.push({ ...data, id: doc.id } as Notice);
      });

      console.log("[NoticesPreview] Notices processed from Firestore query:", fetchedNotices.length);
      setNotices(fetchedNotices);
      setLoading(false);
      if (fetchedNotices.length > 0) {
        setCurrentNoticeIndex(0);
      }
    }, (error) => {
      console.error("[NoticesPreview] Error fetching notices for preview: ", error);
      setLoading(false);
    });

    return () => {
      console.log("[NoticesPreview] Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (notices.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentNoticeIndex((prevIndex) => (prevIndex + 1) % notices.length);
      }, NOTICE_CHANGE_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [notices]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      console.warn(`[NoticesPreview] Error formatting date: "${dateString}"`, e);
      return dateString;
    }
  };

  const currentNotice = notices.length > 0 ? notices[currentNoticeIndex] : null;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <CardTitle>Latest Notices</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[180px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>Loading notices...</p>
          </div>
        ) : currentNotice ? (
          <div key={currentNotice.id} className="space-y-2 animate-fadeIn">
            <h3 className={cn("text-md font-semibold text-foreground", currentNotice.isUrgent && "text-destructive")}>
              {currentNotice.isUrgent && "URGENT: "}
              {currentNotice.noticeTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              Published: {formatDate(currentNotice.publishDate)} | For: {currentNotice.audience}
            </p>
            <p className="text-sm text-foreground/80 max-h-[60px] overflow-hidden text-ellipsis">
              {currentNotice.noticeContent}
            </p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>No recent notices to display.</p>
            <p className="text-xs mt-1">(Ensure notices have status "Published", correct `publishDate` format, and check Firestore rules.)</p>
          </div>
        )}
      </CardContent>
      {notices.length > 1 && (
        <div className="p-4 pt-0 flex justify-center space-x-1.5">
          {notices.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentNoticeIndex(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === currentNoticeIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to notice ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
