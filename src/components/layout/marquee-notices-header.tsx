
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Megaphone, Loader2 } from 'lucide-react';

interface Notice {
  id: string;
  noticeTitle: string;
  noticeContent: string;
  publishDate: string;
  status: 'Published' | 'Draft';
  audience?: string;
  isUrgent?: boolean;
  createdAt?: Timestamp;
}

const MAX_NOTICES_FOR_MARQUEE = 3;
const CONTENT_SNIPPET_LENGTH = 50;

export function MarqueeNoticesHeader() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("[MarqueeNoticesHeader] Component mounted. db instance check:", db);
    if (!db) {
      console.warn("[MarqueeNoticesHeader] Firestore db instance is not available. Notices will not load.");
      setErrorMessage("Database not available. Cannot load announcements.");
      setLoading(false);
      return;
    }
    setErrorMessage(null); // Clear previous errors
    console.log("[MarqueeNoticesHeader] Firestore db instance IS available. Setting up listener...");

    const q = query(
      collection(db, "notices"),
      where("status", "==", "Published"),
      orderBy("publishDate", "desc"),
      orderBy("createdAt", "desc"),
      limit(MAX_NOTICES_FOR_MARQUEE)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotices: Notice[] = [];
      console.log(`[MarqueeNoticesHeader] Snapshot received. Empty: ${querySnapshot.empty}, Size: ${querySnapshot.size}`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[MarqueeNoticesHeader] Doc ID: ${doc.id}, Raw Data:`, JSON.parse(JSON.stringify(data)));

        if (typeof data.publishDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.publishDate)) {
            console.warn(`[MarqueeNoticesHeader] Doc ID: ${doc.id} - Invalid publishDate format: "${data.publishDate}". Expected YYYY-MM-DD.`);
        }
        fetchedNotices.push({ ...data, id: doc.id } as Notice);
      });

      console.log("[MarqueeNoticesHeader] Notices directly from Firestore query (after potential client-side filtering was removed):", fetchedNotices.length);
      setNotices(fetchedNotices);
      setLoading(false);
    }, (error) => {
      console.error("[MarqueeNoticesHeader] Error fetching notices: ", error);
      setErrorMessage(`Error fetching notices: ${error.message}`);
      setLoading(false);
    });

    return () => {
      console.log("[MarqueeNoticesHeader] Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, []);

  const getMarqueeDisplayContent = () => {
    if (loading) return "Loading announcements...";
    if (errorMessage) return errorMessage;
    if (notices.length === 0) return "No current announcements.";

    return notices
      .map(notice => {
        const snippet = notice.noticeContent.length > CONTENT_SNIPPET_LENGTH
          ? notice.noticeContent.substring(0, CONTENT_SNIPPET_LENGTH) + "..."
          : notice.noticeContent;
        return `${notice.isUrgent ? 'URGENT: ' : ''}${notice.noticeTitle}: (${snippet})`;
      })
      .join("  ||  ");
  };

  const marqueeDisplayContent = getMarqueeDisplayContent();
  const showMarqueeAnimation = !loading && !errorMessage && notices.length > 0;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-sm">
      <div className="flex items-center">
        <Megaphone className="h-5 w-5 mr-3 flex-shrink-0" />
        {loading && notices.length === 0 && !errorMessage ? (
           <div className="flex items-center">
             <Loader2 className="h-4 w-4 animate-spin mr-2" />
             <span>Loading announcements...</span>
           </div>
        ) : showMarqueeAnimation ? (
          <div className="marquee-container-wrapper">
            <div className="marquee-content">
              <span>{marqueeDisplayContent}</span>
              <span className="ml-12">{marqueeDisplayContent}</span> {/* Duplicated for seamless scroll */}
            </div>
          </div>
        ) : (
          <span>{marqueeDisplayContent}</span>
        )}
      </div>
    </div>
  );
}
